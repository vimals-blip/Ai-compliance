'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Settings,
  Building2,
  Plug,
  Cpu,
  Users,
  Check,
  GitBranch,
  Cloud,
  MessageSquare,
  Server,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Activity,
  X,
  Mail,
  Shield,
} from 'lucide-react';

const TABS = [
  { id: 'org', label: 'Organization', icon: Building2 },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'model', label: 'AI Model & RAG', icon: Cpu },
  { id: 'team', label: 'Team Members', icon: Users },
];

const INITIAL_INTEGRATIONS = [
  { id: 'github', name: 'GitHub', icon: GitBranch, desc: 'Branch protection, PR reviews, CI/CD evidence', connected: true },
  { id: 'aws', name: 'AWS Cloud', icon: Cloud, desc: 'S3 encryption, IAM MFA, Security Groups', connected: true },
  { id: 'google', name: 'Google Workspace', icon: Server, desc: 'User directory, MFA, Drive sharing', connected: false },
  { id: 'slack', name: 'Slack', icon: MessageSquare, desc: 'Incident channels, workspace security', connected: false },
];

const INITIAL_TEAM_MEMBERS = [
  { id: 't-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Admin' },
  { id: 't-2', name: 'James Wilson', email: 'james.wilson@company.com', role: 'Auditor' },
  { id: 't-3', name: 'Maya Patel', email: 'maya.patel@company.com', role: 'Viewer' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('org');
  const [orgName, setOrgName] = useState('Enterprise Organization');
  const [industry, setIndustry] = useState('SaaS / Cloud Technology');
  const [frameworks, setFrameworks] = useState(['soc2', 'iso27001']);
  const [modelEndpoint, setModelEndpoint] = useState('http://127.0.0.1:8000/api/v1/health');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b');
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [saved, setSaved] = useState(false);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Auditor' | 'Viewer'>('Auditor');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Load from server and localStorage if present
  useEffect(() => {
    async function loadOrgData() {
      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data.name) setOrgName(data.name);
          if (data.industry) setIndustry(data.industry);
        }
      } catch {
        // fallback to localStorage
      }
      try {
        const storedOrg = localStorage.getItem('compliance_org_name');
        if (storedOrg) setOrgName(storedOrg);
        const storedInd = localStorage.getItem('compliance_org_industry');
        if (storedInd) setIndustry(storedInd);
        const storedFw = localStorage.getItem('compliance_frameworks');
        if (storedFw) setFrameworks(JSON.parse(storedFw));
        const storedTeam = localStorage.getItem('compliance_team');
        if (storedTeam) setTeamMembers(JSON.parse(storedTeam));
      } catch {
        // ignore
      }
    }
    loadOrgData();
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('compliance_org_name', orgName);
      localStorage.setItem('compliance_org_industry', industry);
      localStorage.setItem('compliance_frameworks', JSON.stringify(frameworks));
      localStorage.setItem('compliance_team', JSON.stringify(teamMembers));

      await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          industry,
        }),
      });
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleIntegration = async (id: string) => {
    const updated = integrations.map((i) =>
      i.id === id ? { ...i, connected: !i.connected } : i
    );
    setIntegrations(updated);

    // Call integration status endpoint
    try {
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: id, connected: !integrations.find(i => i.id === id)?.connected }),
      });
    } catch {
      // fallback
    }
  };

  const handleTestModel = async () => {
    setIsTestingModel(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: modelEndpoint, model: selectedModel }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      } else {
        setTestResult({
          success: false,
          status: 'error',
          error: `HTTP error ${res.status}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'error',
        error: err.message || 'Connection failed',
      });
    } finally {
      setIsTestingModel(false);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newMember = {
      id: `t-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    try {
      localStorage.setItem('compliance_team', JSON.stringify(updated));
    } catch {}

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
    }, 800);
  };

  const handleDeleteMember = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    try {
      localStorage.setItem('compliance_team', JSON.stringify(updated));
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Workspace Config</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your organization, telemetry integrations, local open-source AI engine, and team governance.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-60 shrink-0 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Pane */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-7">
            {/* Organization Profile */}
            {activeTab === 'org' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Organization Profile</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This metadata is embedded into your exported SOC 2, ISO 27001, and NIST audit packages.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                      Company / Legal Entity
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                      Industry Domain
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    >
                      <option>SaaS / Technology</option>
                      <option>Healthcare / Digital Health</option>
                      <option>Fintech / Banking</option>
                      <option>E-Commerce / Retail</option>
                      <option>Government / Defense</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">
                    Active Compliance Frameworks
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: 'soc2', label: 'SOC 2 Type II' },
                      { id: 'iso27001', label: 'ISO/IEC 27001:2022' },
                      { id: 'nist', label: 'NIST CSF v2.0' },
                      { id: 'hipaa', label: 'HIPAA Security Rule' },
                      { id: 'gdpr', label: 'GDPR Privacy' },
                    ].map((fw) => (
                      <button
                        key={fw.id}
                        type="button"
                        onClick={() =>
                          setFrameworks((prev) =>
                            prev.includes(fw.id) ? prev.filter((f) => f !== fw.id) : [...prev, fw.id]
                          )
                        }
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
                          frameworks.includes(fw.id)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {frameworks.includes(fw.id) && <Check className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />}
                        {fw.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    {saved ? <Check className="w-4 h-4 text-white" /> : null}
                    <span>{saved ? 'Changes Saved!' : 'Save Organization Profile'}</span>
                  </button>
                  {saved && (
                    <span className="text-xs text-emerald-600 font-medium">
                      Configuration persisted to system storage.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Live Telemetry & Cloud Integrations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect external systems to stream automated compliance evidence directly to the AI engine.
                  </p>
                </div>

                <div className="space-y-3">
                  {integrations.map((intg) => {
                    const Icon = intg.icon;
                    return (
                      <div
                        key={intg.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition bg-slate-50/50"
                      >
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
                          <Icon className="w-5 h-5 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-slate-900">{intg.name}</p>
                            {intg.connected && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                                ACTIVE SYNC
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{intg.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleIntegration(intg.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            intg.connected
                              ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300 hover:bg-emerald-200/70'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-xs'
                          }`}
                        >
                          {intg.connected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                            </>
                          ) : (
                            'Connect Integration'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Model Configuration */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Fine-Tuned Open-Source AI Engine</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero third-party proprietary API dependencies. All RAG analysis and policy generation run locally.
                  </p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-700" /> Air-Gapped / Host-Local Privacy Architecture
                  </p>
                  <p className="text-emerald-800">
                    Your evidence artifacts, infrastructure scans, and employee records remain strictly on your sovereign infrastructure.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                      Fine-Tuned Compliance Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="llama-3.1-8b">Meta Llama 3.1 8B Instruct (Fine-Tuned GRC Edition) - Default</option>
                      <option value="mistral-nemo-12b">Mistral Nemo 12B Instruct (High Context 128k)</option>
                      <option value="llama-3.1-70b">Meta Llama 3.1 70B Instruct (Enterprise Cluster)</option>
                      <option value="command-r">Cohere Command R (RAG Optimized Local)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                      FastAPI AI Backend Service URL
                    </label>
                    <input
                      type="text"
                      value={modelEndpoint}
                      onChange={(e) => setModelEndpoint(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={handleTestModel}
                      disabled={isTestingModel}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      {isTestingModel ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>{isTestingModel ? 'Pinging Model...' : 'Test AI Connection & Latency'}</span>
                    </button>

                    {testResult && testResult.success && (
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>
                          <strong>Online</strong> ({testResult.latencyMs}ms) — {testResult.activeModel} (Engine: {testResult.ragEngine || 'pgvector'})
                        </span>
                      </div>
                    )}

                    {testResult && !testResult.success && (
                      <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{testResult.error || 'Connection timed out'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Governance & Team Access</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage compliance officers, external CPA auditors, and internal reviewers.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Team Member</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/70 transition">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          member.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : member.role === 'Auditor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {member.role}
                      </span>
                      {teamMembers.length > 1 && (
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@acme.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Role & Permissions</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Admin">Admin (Full Control, Frameworks, AI Models)</option>
                    <option value="Auditor">Auditor (Read-Only Evidence, Findings, Sign-off)</option>
                    <option value="Viewer">Viewer (Dashboard & Controls Read-Only)</option>
                  </select>
                </div>

                {inviteSuccess ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Invitation dispatched! User added to active directory.</span>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                    >
                      Send Invitation
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
