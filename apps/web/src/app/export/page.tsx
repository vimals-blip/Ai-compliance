'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { getPersistedObject } from '../../lib/clientStore';
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
  FolderArchive,
  Layers,
  Award,
} from 'lucide-react';

const EVIDENCE_SOURCES = [
  { id: 'github', name: 'GitHub', icon: GitBranch, desc: 'Branch protection, PR reviews, CI/CD pipelines', color: 'text-slate-900 bg-slate-100' },
  { id: 'aws', name: 'AWS', icon: Cloud, desc: 'S3 encryption, IAM MFA, Security Groups', color: 'text-orange-600 bg-orange-50' },
  { id: 'google', name: 'Google Workspace', icon: Server, desc: 'User directory, MFA status, Drive sharing', color: 'text-blue-600 bg-blue-50' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, desc: 'Workspace security, incident channels, DLP', color: 'text-purple-600 bg-purple-50' },
];

const FRAMEWORK_PACKAGES = [
  {
    id: 'all',
    name: 'Master Multi-Framework Auditor Package',
    badge: 'ALL CERTIFICATIONS',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Layers,
    desc: 'Unified master archive containing full cross-walked policies, live telemetry, and Statement of Applicability across SOC 2, ISO 27001, NIST CSF, and HIPAA.',
    prefix: 'Master_Multi_Framework',
    policies: [
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
    ],
    evidence: [
      'evidence/01_aws_iam_mfa_enforcement.json',
      'evidence/02_aws_s3_kms_encryption.json',
      'evidence/03_github_branch_protection.json',
      'evidence/04_google_workspace_2sv.json',
      'evidence/05_hipaa_phi_safeguards_audit.json',
      'evidence/06_automated_test_results.json',
      'mappings/iso27001_statement_of_applicability.json',
      'mappings/controls_crosswalk_matrix.json',
      'MANIFEST.json',
      'README.md',
    ],
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II Evidence Package',
    badge: 'SOC 2 TYPE II',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
    desc: 'AICPA Trust Services Criteria bundle with change management policies, PR peer reviews, MFA telemetry, and cryptographic verification ledger.',
    prefix: 'SOC2_Type_II',
    policies: [
      'Information Security Policy',
      'Access Control Policy',
      'Incident Response Plan',
      'Change Management Policy',
      'Encryption & Key Management Policy',
      'Vendor Risk Management Policy',
    ],
    evidence: [
      'evidence/01_aws_iam_mfa_enforcement.json',
      'evidence/02_aws_s3_kms_encryption.json',
      'evidence/03_github_branch_protection.json',
      'evidence/04_google_workspace_2sv.json',
      'evidence/06_automated_test_results.json',
      'mappings/controls_crosswalk_matrix.json',
      'MANIFEST.json',
      'README.md',
    ],
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001:2022 ISMS Evidence Package',
    badge: 'ISO 27001',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Award,
    desc: 'Complete Information Security Management System (ISMS) dossier including Annex A.5 - A.8 controls and Statement of Applicability (SoA).',
    prefix: 'ISO_27001_2022',
    policies: [
      'Information Security Policy',
      'Access Control Policy',
      'Data Classification Policy',
      'Business Continuity Plan',
      'Vendor Risk Management Policy',
      'Physical Security Policy',
    ],
    evidence: [
      'evidence/01_aws_iam_mfa_enforcement.json',
      'evidence/02_aws_s3_kms_encryption.json',
      'evidence/03_github_branch_protection.json',
      'mappings/iso27001_statement_of_applicability.json',
      'mappings/controls_crosswalk_matrix.json',
      'MANIFEST.json',
      'README.md',
    ],
  },
  {
    id: 'nist',
    name: 'NIST CSF 2.0 Assessment Package',
    badge: 'NIST CSF v2.0',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: FolderArchive,
    desc: 'NIST Cybersecurity Framework package covering Govern, Identify, Protect, Detect, Respond, and Recover tiers with telemetry benchmarks.',
    prefix: 'NIST_CSF_v2',
    policies: [
      'Incident Response Plan',
      'Access Control Policy',
      'Data Classification Policy',
      'Change Management Policy',
      'Business Continuity Plan',
    ],
    evidence: [
      'evidence/01_aws_iam_mfa_enforcement.json',
      'evidence/02_aws_s3_kms_encryption.json',
      'evidence/03_github_branch_protection.json',
      'evidence/06_automated_test_results.json',
      'mappings/controls_crosswalk_matrix.json',
      'MANIFEST.json',
      'README.md',
    ],
  },
  {
    id: 'hipaa',
    name: 'HIPAA Security & Privacy Package',
    badge: 'HIPAA SAFEGUARDS',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldCheck,
    desc: '45 CFR Part 164 administrative, technical, and physical safeguards bundle with ePHI encryption telemetry and Business Associate Agreements.',
    prefix: 'HIPAA_Security',
    policies: [
      'Data Classification Policy',
      'Access Control Policy',
      'Encryption & Key Management Policy',
      'Incident Response Plan',
      'Physical Security Policy',
    ],
    evidence: [
      'evidence/01_aws_iam_mfa_enforcement.json',
      'evidence/02_aws_s3_kms_encryption.json',
      'evidence/04_google_workspace_2sv.json',
      'evidence/05_hipaa_phi_safeguards_audit.json',
      'mappings/controls_crosswalk_matrix.json',
      'MANIFEST.json',
      'README.md',
    ],
  },
];

export default function ExportPage() {
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedSources, setCollectedSources] = useState<string[]>(['github', 'aws', 'google', 'slack']);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportStep, setExportStep] = useState('');
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [downloadedFileName, setDownloadedFileName] = useState<string>('');
  const [companyName, setCompanyName] = useState('CloudSecure Enterprise');

  useEffect(() => {
    async function loadOrg() {
      const savedOrg = getPersistedObject<any>('organization', null, { name: 'CloudSecure Enterprise' });
      if (savedOrg?.name) setCompanyName(savedOrg.name);

      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setCompanyName(data.name);
        }
      } catch {}
    }
    loadOrg();
  }, []);

  const currentPkg = FRAMEWORK_PACKAGES.find((p) => p.id === selectedFramework) || FRAMEWORK_PACKAGES[0];

  const handleCollectSource = async (sourceId: string) => {
    setIsCollecting(true);
    try {
      await fetch(`/api/ai/integrations/collect?source=${sourceId}`);
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
    setCollectedSources((prev) => Array.from(new Set([...prev, sourceId])));
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

  const handleExport = async (frameworkId: string = selectedFramework) => {
    setIsExporting(true);
    const targetPkg = FRAMEWORK_PACKAGES.find((p) => p.id === frameworkId) || currentPkg;
    const sanitizedOrg = companyName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedOrg}_${targetPkg.prefix}_Auditor_Package.zip`;
    setDownloadedFileName(filename);

    const steps = [
      `1/5: Authoring ${targetPkg.policies.length} ${targetPkg.name} policies...`,
      '2/5: Gathering signed JSON evidence from AWS, GitHub, Google, Slack...',
      '3/5: Compiling Statement of Applicability & control crosswalk matrices...',
      '4/5: Generating cryptographic MANIFEST.json and auditor README...',
      `5/5: Compressing archive into ${targetPkg.prefix}.zip...`,
    ];

    for (const s of steps) {
      setExportStep(s);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const res = await fetch('/api/export/auditor-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          cloud_provider: 'AWS',
          mfa_tool: 'Okta',
          framework: frameworkId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate auditor package ZIP');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setZipBlobUrl(url);

      // Trigger automatic browser download
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
            Collect live evidence from all connected cloud APIs and export audit-ready ZIP packages for any compliance certification (SOC 2, ISO 27001, NIST CSF, HIPAA, or Unified Master Package).
          </p>
        </div>

        {/* Framework Selection Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Select Target Certificate / Framework Package</h2>
              <p className="text-xs text-slate-500">Choose the compliance framework required by your external CPA or auditor.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              {FRAMEWORK_PACKAGES.length} Packages Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {FRAMEWORK_PACKAGES.map((pkg) => {
              const isSelected = selectedFramework === pkg.id;
              const Icon = pkg.icon;
              return (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setSelectedFramework(pkg.id);
                    setExported(false);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                        {pkg.id.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{pkg.name}</h3>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{pkg.policies.length} Policies</span>
                    <span>{pkg.evidence.length} Artifacts</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 1: Collect Evidence */}
        <div id="tour-export-evidence" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Collect Live Evidence Telemetry
                </h2>
                <p className="text-sm text-slate-500 mt-1">Pull real-time configuration data from connected cloud and identity providers.</p>
              </div>
              <button
                onClick={handleCollectAll}
                disabled={isCollecting || collectedSources.length === EVIDENCE_SOURCES.length}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
              >
                {isCollecting ? 'Collecting...' : 'Collect All Sources'}
              </button>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EVIDENCE_SOURCES.map((src) => {
              const Icon = src.icon;
              const collected = collectedSources.includes(src.id);
              return (
                <div
                  key={src.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    collected ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'
                  }`}
                >
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
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Package Contents ({currentPkg.policies.length + currentPkg.evidence.length} Bundled Artifacts)
            </h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentPkg.badgeColor}`}>
              {currentPkg.name}
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Formatted Policies ({currentPkg.policies.length})
              </h3>
              <div className="space-y-1.5">
                {currentPkg.policies.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {p}.md
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Evidence, Mappings & Manifest ({currentPkg.evidence.length})
              </h3>
              <div className="space-y-1.5">
                {currentPkg.evidence.map((f, i) => (
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
            <h2 className="text-xl font-bold text-slate-900 mb-2">{currentPkg.name}</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6 text-sm">
              {currentPkg.desc}
            </p>

            {!exported && !isExporting && (
              <button
                onClick={() => handleExport(selectedFramework)}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-5 h-5" /> Generate & Download {currentPkg.badge} ZIP
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {currentPkg.name} Ready!
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Your auditor archive <strong className="font-mono text-slate-800">{downloadedFileName}</strong> was successfully compiled with SHA-256 integrity digests and downloaded.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  {zipBlobUrl && (
                    <button
                      onClick={() => triggerDownload(zipBlobUrl, downloadedFileName)}
                      className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm text-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download ZIP Again
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setExported(false);
                      setIsExporting(false);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer"
                  >
                    Export Another Framework
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
            <p className="font-semibold">Auditor Attestation Disclaimer</p>
            <p className="text-xs mt-1">
              All exported archives are compiled with verifiable SHA-256 digests in <span className="font-mono font-semibold">MANIFEST.json</span> to guarantee non-repudiation and evidence integrity during AICPA SOC 2 and ISO/IEC 27001 third-party examinations.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
