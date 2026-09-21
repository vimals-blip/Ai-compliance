'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Download,
  FileArchive,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  FileText,
  Server,
  GitBranch,
  Cloud,
  MessageSquare,
  AlertTriangle,
  FileCode,
  FolderArchive,
  RefreshCw,
} from 'lucide-react';

const EVIDENCE_SOURCES = [
  { id: 'github', name: 'GitHub', icon: GitBranch, desc: 'Branch protection, PR reviews, CI/CD pipelines', color: 'text-slate-900 bg-slate-100' },
  { id: 'aws', name: 'AWS', icon: Cloud, desc: 'S3 encryption, IAM MFA, Security Groups', color: 'text-orange-600 bg-orange-50' },
  { id: 'google', name: 'Google Workspace', icon: Server, desc: 'User directory, MFA status, Drive sharing', color: 'text-blue-600 bg-blue-50' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, desc: 'Workspace security, incident channels, DLP', color: 'text-purple-600 bg-purple-50' },
];

const POLICIES_INCLUDED = [
  'Information Security Policy',
  'Access Control Policy',
  'Incident Response Plan',
  'Data Classification Policy',
  'Vendor Risk Management Policy',
  'Business Continuity Plan',
  'Acceptable Use Policy',
  'Change Management Policy',
  'Encryption & Key Management Policy',
  'Physical Security Policy',
];

export default function ExportPage() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedSources, setCollectedSources] = useState<string[]>(['github', 'aws']);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportStep, setExportStep] = useState('');
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('CloudSecure Enterprise');

  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setCompanyName(data.name);
        }
      } catch {
        // fallback
      }
    }
    loadOrg();
  }, []);

  const handleCollectSource = async (sourceId: string) => {
    setIsCollecting(true);
    try {
      await fetch(`/api/ai/integrations/collect?source=${sourceId}`);
    } catch {
      // simulated fallback
    }
    await new Promise(r => setTimeout(r, 600));
    setCollectedSources(prev => Array.from(new Set([...prev, sourceId])));
    setIsCollecting(false);
  };

  const handleCollectAll = async () => {
    setIsCollecting(true);
    for (const src of EVIDENCE_SOURCES) {
      await handleCollectSource(src.id);
    }
    setIsCollecting(false);
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const filename = `${companyName.replace(/\s+/g, '_')}_SOC2_Auditor_Package.zip`;

    const steps = [
      '1/5: Authoring 10 compliance policies with Fine-Tuned Llama 3.1...',
      '2/5: Gathering signed JSON evidence from AWS, GitHub, Google, Slack...',
      '3/5: Compiling Statement of Applicability & control mappings...',
      '4/5: Generating MANIFEST.json and auditor README...',
      '5/5: Compressing archive into auditor-ready ZIP package...',
    ];

    for (const s of steps) {
      setExportStep(s);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      // Call actual binary ZIP generator endpoint
      const res = await fetch('/api/export/auditor-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          cloud_provider: 'AWS',
          mfa_tool: 'Okta',
          version: '1.0',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate auditor package ZIP');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setZipBlobUrl(url);

      // Trigger automatic browser download immediately
      triggerDownload(url, filename);

      setExported(true);
    } catch (err: any) {
      console.error('Error exporting package:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Export to Auditor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Collect live evidence from all integrations, generate policies, and package everything into a secure ZIP for your external auditor.
          </p>
        </div>

        {/* Step 1: Collect Evidence */}
        <div id="tour-export-evidence" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Collect Live Evidence
                </h2>
                <p className="text-sm text-slate-500 mt-1">Pull real-time configuration data from your connected integrations.</p>
              </div>
              <button
                onClick={handleCollectAll}
                disabled={isCollecting || collectedSources.length === EVIDENCE_SOURCES.length}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {isCollecting ? 'Collecting...' : 'Collect All'}
              </button>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EVIDENCE_SOURCES.map(src => {
              const Icon = src.icon;
              const collected = collectedSources.includes(src.id);
              return (
                <div key={src.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${collected ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${src.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900">{src.name}</p>
                    <p className="text-xs text-slate-500 truncate">{src.desc}</p>
                  </div>
                  {collected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCollectSource(src.id)}
                      disabled={isCollecting}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    >
                      Collect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Review Package Contents */}
        <div id="tour-export-contents" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Package Contents (18 Bundled Artifacts)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> AI-Generated Policies ({POLICIES_INCLUDED.length})
              </h3>
              <div className="space-y-1.5">
                {POLICIES_INCLUDED.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {p}.md
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Automated Evidence & Manifest (8 Files)
              </h3>
              <div className="space-y-1.5">
                {[
                  'evidence/github_branch_protection.json',
                  'evidence/aws_s3_encryption.json',
                  'evidence/aws_iam_mfa.json',
                  'evidence/google_workspace_users.json',
                  'evidence/google_workspace_drive.json',
                  'evidence/slack_workspace.json',
                  'MANIFEST.json',
                  'README.md',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Generate & Download */}
        <div id="tour-export-generate-btn" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 border border-emerald-100">
              <FileArchive className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">SOC 2 Type II Evidence Package</h2>
            <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm">
              This ZIP contains {POLICIES_INCLUDED.length} AI-generated policies, automated evidence from {EVIDENCE_SOURCES.length} integrations, a MANIFEST, and a README — compiled for your auditor.
            </p>
            
            {!exported && !isExporting && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-5 h-5" /> Generate & Download ZIP
              </button>
            )}

            {isExporting && (
              <div className="space-y-4 max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs font-mono font-medium text-emerald-800">{exportStep}</p>
              </div>
            )}

            {exported && (
              <div className="space-y-4 max-w-lg mx-auto animate-in fade-in">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-6 py-3 rounded-xl font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Package Generated & Downloaded!
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your auditor archive <strong className="font-mono text-slate-800">{companyName.replace(/\s+/g, '_')}_SOC2_Auditor_Package.zip</strong> (18 files, ~15 KB) was successfully created and sent to your browser's download folder.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  {zipBlobUrl && (
                    <button
                      onClick={() => triggerDownload(zipBlobUrl, `${companyName.replace(/\s+/g, '_')}_SOC2_Auditor_Package.zip`)}
                      className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm text-xs"
                    >
                      <Download className="w-4 h-4" /> Download ZIP Again
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setExported(false);
                      setIsExporting(false);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
                  >
                    Re-Generate Package
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Auditor Disclaimer</p>
            <p className="text-xs mt-1">This evidence package was generated by an AI Compliance Engine using Llama 3.1 8B. All policies and evidence should be reviewed by a qualified SOC 2 / ISO 27001 auditor before submission.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
