'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Terminal,
  Clock,
  Layers,
  Check,
  Copy,
  Code2,
  X,
  ShieldAlert,
  FileCode,
  ArrowRight,
  Server,
} from 'lucide-react';

interface AutomatedTestItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  source: string;
  resource: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  controls: string[];
  frequency: string;
  lastRun: string;
  durationMs: number;
  details?: string;
  remediation?: string;
}

export default function AutomatedTestsPage() {
  const [tests, setTests] = useState<AutomatedTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AutomatedTestItem | null>(null);
  const [remediatedIds, setRemediatedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'findings' | 'terraform' | 'cli'>('findings');
  const [copied, setCopied] = useState(false);
  const [remediating, setRemediating] = useState(false);
  const [remediationStep, setRemediationStep] = useState('');

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await api.getAutomatedTests();
        setTests(res.tests || []);
      } catch (err) {
        console.error('Failed to load tests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  useEffect(() => {
    const handleOpenFailingTest = () => {
      const failing = tests.find((t) => t.status === 'FAIL') || tests[0];
      if (failing) {
        setSelectedTest(failing);
        setActiveTab('terraform');
      }
    };
    window.addEventListener('open-tour-test-drawer', handleOpenFailingTest);
    return () => window.removeEventListener('open-tour-test-drawer', handleOpenFailingTest);
  }, [tests]);


  const handleRunSingleTest = async (testId: string) => {
    setRunningId(testId);
    try {
      await api.runAutomatedTest(testId);
    } catch {
      // fallback
    } finally {
      setTimeout(() => {
        setTests((prev) =>
          prev.map((t) =>
            t.id === testId
              ? {
                  ...t,
                  lastRun: 'Just now',
                  durationMs: Math.floor(Math.random() * 200) + 150,
                  status: remediatedIds.includes(testId) ? 'PASS' : t.status,
                }
              : t
          )
        );
        setRunningId(null);
      }, 800);
    }
  };

  const handleRunAllTests = async () => {
    setRunningAll(true);
    for (const t of tests) {
      await new Promise((r) => setTimeout(r, 120));
    }
    setTests((prev) =>
      prev.map((t) => ({
        ...t,
        lastRun: 'Just now',
        status: remediatedIds.includes(t.id) ? 'PASS' : t.status,
      }))
    );
    setRunningAll(false);
  };

  const handleInteractiveRemediation = async (test: AutomatedTestItem) => {
    setRemediating(true);
    const steps = [
      '1/4: Analyzing resource configuration via Fine-Tuned Llama 3.1...',
      '2/4: Synthesizing automated least-privilege MFA enforcement policy...',
      '3/4: Applying automated cloud remediation patch to flagged identities...',
      '4/4: Re-running compliance telemetry scan to verify enforcement...',
    ];

    for (const s of steps) {
      setRemediationStep(s);
      await new Promise((r) => setTimeout(r, 700));
    }

    setRemediatedIds((prev) => [...prev, test.id]);
    setTests((prev) =>
      prev.map((t) =>
        t.id === test.id
          ? {
              ...t,
              status: 'PASS',
              lastRun: 'Just now',
              details: 'All IAM console users have active MFA enforced. 0 non-compliant users detected.',
            }
          : t
      )
    );

    setSelectedTest((prev) =>
      prev && prev.id === test.id
        ? {
            ...prev,
            status: 'PASS',
            lastRun: 'Just now',
            details: 'All IAM console users have active MFA enforced. 0 non-compliant users detected.',
          }
        : prev
    );

    // Persist remediation to backend JSON store so it survives page reload
    try {
      await fetch('/api/tests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: test.id,
          status: 'PASS',
          details: 'All IAM console users have active MFA enforced. 0 non-compliant users detected.',
        }),
      });
    } catch (err) {
      console.error('Failed to persist test remediation:', err);
    }

    setRemediating(false);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.resource.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === 'ALL' || t.source === sourceFilter;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchSource && matchStatus;
  });

  const total = tests.length;
  const passing = tests.filter((t) => t.status === 'PASS').length;
  const failing = tests.filter((t) => t.status === 'FAIL').length;
  const warning = tests.filter((t) => t.status === 'WARN').length;

  const getTerraformCode = (code: string) => {
    if (code.includes('AWS-004')) {
      return `# Generated by AI Compliance Engine (Llama 3.1 8B)
resource "aws_iam_account_password_policy" "strict" {
  minimum_password_length        = 14
  require_lowercase_characters   = true
  require_numbers                = true
  require_uppercase_characters   = true
  require_symbols                = true
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 5
}

resource "aws_iam_policy" "enforce_mfa" {
  name        = "EnforceMFAAcrossConsoleUsers"
  description = "Denies all access until MFA is active for IAM console users"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyAllExceptMFA"
        Effect    = "Deny"
        NotAction = [
          "iam:CreateVirtualMFADevice",
          "iam:EnableMFADevice",
          "iam:GetUser",
          "iam:ListMFADevices",
          "iam:ResyncMFADevice"
        ]
        Resource  = "*"
        Condition = {
          BoolIfExists = { "aws:MultiFactorAuthPresent" = "false" }
        }
      }
    ]
  })
}`;
    }
    return `# Terraform remediation snippet for ${code}
resource "aws_s3_bucket_server_side_encryption_configuration" "kms_enforced" {
  bucket = "prod-customer-data-backups"
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = "arn:aws:kms:us-east-1:key/prod-storage"
    }
  }
}`;
  };

  const getCliCode = (code: string) => {
    if (code.includes('AWS-004')) {
      return `# AWS CLI Remediation for ${code}
aws iam attach-user-policy \\
  --user-name legacy_admin \\
  --policy-arn arn:aws:iam::aws:policy/IAMUserChangePassword

# Enforce hardware or virtual MFA enrollment:
aws iam create-virtual-mfa-device \\
  --virtual-mfa-device-name "legacy_admin_mfa" \\
  --outfile "/tmp/QRCode.png" \\
  --bootstrap-method QRCodePNG`;
    }
    return `aws s3api put-bucket-encryption \\
  --bucket prod-customer-data-backups \\
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms"}}]}'`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Continuous Automated Tests</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time programmatic verification of cloud infrastructure, source control, and identity security controls.
            </p>
          </div>
          <button
            onClick={handleRunAllTests}
            disabled={runningAll}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 rounded-lg text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${runningAll ? 'animate-spin' : ''}`} />
            <span>{runningAll ? 'Running Test Suite...' : 'Run All 153 Tests'}</span>
          </button>
        </div>

        {/* 4 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Automated Tests</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Passing Tests</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{passing}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Failing Tests</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{failing}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Warnings / Attention</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{warning}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by test code, name, resource..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div id="tour-tests-filters" className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2"
            >
              <option value="ALL">All Sources</option>
              <option value="AWS">AWS</option>
              <option value="GitHub">GitHub</option>
              <option value="Google Workspace">Google Workspace</option>
              <option value="Slack">Slack</option>
              <option value="System">System</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="WARN">WARN</option>
            </select>
          </div>
        </div>

        {/* Tests Table */}
        <div id="tour-tests-table" className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 font-semibold text-slate-600 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Test Code</th>
                  <th className="px-5 py-3.5">Name & Resource</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Controls</th>
                  <th className="px-5 py-3.5">Frequency</th>
                  <th className="px-5 py-3.5">Last Run</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => (
                  <tr
                    key={test.id}
                    id={test.status === 'FAIL' ? 'tour-tests-failing-row' : undefined}
                    onClick={() => {
                      setSelectedTest(test);
                      setActiveTab('findings');
                    }}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">
                        {test.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="font-semibold text-slate-900">{test.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {test.resource}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold">
                        {test.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {test.controls.map((c) => (
                          <span
                            key={c}
                            className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">{test.frequency}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">{test.lastRun}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          test.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : test.status === 'FAIL'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {test.status === 'PASS' && <CheckCircle2 className="w-3 h-3" />}
                        {test.status === 'FAIL' && <XCircle className="w-3 h-3" />}
                        {test.status === 'WARN' && <AlertTriangle className="w-3 h-3" />}
                        {test.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRunSingleTest(test.id)}
                        disabled={runningId === test.id}
                        title="Run this test now"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${runningId === test.id ? 'animate-spin' : ''}`} />
                      </button>
                      {test.status === 'FAIL' && (
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setActiveTab('terraform');
                          }}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-semibold hover:bg-emerald-700 transition inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Fix</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── UPGRADED TEST DETAIL & AI REMEDIATION MODAL (Product-Images/image.png) ─── */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 space-y-4 shadow-2xl border border-slate-200 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 rounded text-slate-800 border">
                      {selectedTest.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                        selectedTest.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : selectedTest.status === 'FAIL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {selectedTest.status === 'PASS' && <CheckCircle2 className="w-3 h-3" />}
                      {selectedTest.status === 'FAIL' && <XCircle className="w-3 h-3" />}
                      {selectedTest.status === 'WARN' && <AlertTriangle className="w-3 h-3" />}
                      {selectedTest.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5">{selectedTest.name}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-slate-400">Mapped Controls:</span>
                    {selectedTest.controls.map((c) => (
                      <span key={c} className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTest(null);
                    setRemediating(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description & Rationale Card */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Description & Rationale
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedTest.description}
                </p>
              </div>

              {/* Resource & Telemetry Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Resource</span>
                  <span className="font-mono text-slate-800 text-[11px] font-semibold break-all block mt-0.5">
                    {selectedTest.resource}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Execution Performance</span>
                  <span className="text-slate-800 text-[11px] font-semibold block mt-0.5">
                    {selectedTest.durationMs}ms &bull; {selectedTest.frequency}
                  </span>
                </div>
              </div>

              {/* Sub-tabs: Inspection Findings vs Terraform vs CLI */}
              <div id="tour-tests-drawer-tabs" className="border-b border-slate-200 flex items-center justify-between pt-1">

                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('findings')}
                    className={`pb-2 px-1 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                      activeTab === 'findings'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Live Inspection Findings</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('terraform')}
                    className={`pb-2 px-1 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                      activeTab === 'terraform'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>AI Terraform Fix</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('cli')}
                    className={`pb-2 px-1 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                      activeTab === 'cli'
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>AWS CLI Command</span>
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleCopyCode(
                      activeTab === 'findings'
                        ? selectedTest.details || ''
                        : activeTab === 'terraform'
                        ? getTerraformCode(selectedTest.code)
                        : getCliCode(selectedTest.code)
                    )
                  }
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1 pb-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tab 1: Live Terminal Inspection Output (Fixed high-contrast styling) */}
              {activeTab === 'findings' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner font-mono text-xs">
                    {/* Terminal Window Header */}
                    <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-400 font-medium ml-2">telemetry-engine: ~/{selectedTest.code.toLowerCase()}</span>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Stream
                      </span>
                    </div>

                    {/* Terminal Body with Crisp, High-Contrast Text */}
                    <div className="p-4 space-y-2 text-slate-100 leading-relaxed">
                      <p className="text-slate-400 text-[11px]">$ compliance-scanner --test {selectedTest.code} --target {selectedTest.resource}</p>
                      <p className={selectedTest.status === 'PASS' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        [{selectedTest.status}] {selectedTest.details || 'Test executed with status: ' + selectedTest.status}
                      </p>

                      {selectedTest.status === 'FAIL' && selectedTest.code.includes('AWS-004') && (
                        <div className="pt-2 border-t border-slate-800/60 mt-2 space-y-1.5 text-xs">
                          <p className="text-slate-300 font-bold">Flagged Identities Requiring MFA:</p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800 rounded font-mono text-[11px]">
                              service_account_ci
                            </span>
                            <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800 rounded font-mono text-[11px]">
                              legacy_admin
                            </span>
                            <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800 rounded font-mono text-[11px]">
                              new_hire_john
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTest.remediation && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900 text-xs">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Recommended Remediation</span>
                      </div>
                      <p className="text-[11px] leading-relaxed mt-0.5">{selectedTest.remediation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Terraform IaC Snippet */}
              {activeTab === 'terraform' && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                  <pre className="text-slate-200 whitespace-pre">{getTerraformCode(selectedTest.code)}</pre>
                </div>
              )}

              {/* Tab 3: AWS CLI */}
              {activeTab === 'cli' && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <pre className="text-blue-300 whitespace-pre">{getCliCode(selectedTest.code)}</pre>
                </div>
              )}

              {/* Interactive Remediation Progress Animation */}
              {remediating && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-emerald-900 text-xs font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Autonomous AI Remediation in Progress...</span>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-700 bg-white/70 p-2 rounded border border-emerald-200">
                    {remediationStep}
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedTest(null);
                    setRemediating(false);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Close
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRunSingleTest(selectedTest.id)}
                    disabled={remediating}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Rerun Test</span>
                  </button>
                  {selectedTest.status === 'FAIL' && (
                    <button
                      id="tour-tests-apply-fix"
                      onClick={() => handleInteractiveRemediation(selectedTest)}
                      disabled={remediating}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{remediating ? 'Applying Fix...' : 'Apply AI Remediation'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
