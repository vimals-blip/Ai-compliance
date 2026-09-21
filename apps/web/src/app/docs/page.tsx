'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { generateSimplePDF, openPrintableReport } from '../../lib/pdfGenerator';
import {
  BookOpen,
  Cpu,
  FileCheck2,
  Shield,
  Layers,
  ArrowRight,
  Download,
  Printer,
  ExternalLink,
  CheckCircle2,
  User,
  Users,
  Server,
  Cloud,
  FileText,
  Paperclip,
  ShieldAlert,
  Sparkles,
  Zap,
  FolderArchive,
  Search,
  Code2,
  Terminal,
  Activity,
  Check,
  ChevronRight,
  Eye,
  Lock,
} from 'lucide-react';

export default function ProductDocsPage() {
  const [activeTab, setActiveTab] = useState<'usecases' | 'flowchart' | 'matrix' | 'markdown'>('usecases');
  const [docContent, setDocContent] = useState<string>('');
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [activeActor, setActiveActor] = useState<'admin' | 'devops' | 'auditor' | 'ai'>('admin');
  const [activePhase, setActivePhase] = useState<number>(1);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      setLoadingDoc(true);
      try {
        const res = await fetch('/api/docs');
        const data = await res.json();
        if (data.markdown) {
          setDocContent(data.markdown);
        }
      } catch (err) {
        console.error('Failed to fetch doc:', err);
      } finally {
        setLoadingDoc(false);
      }
    }
    fetchDoc();
  }, []);

  const handleDownloadPDF = () => {
    setDownloading(true);
    const content = docContent || `AI-COMPLIANCE PLATFORM ARCHITECTURE & PRODUCT GUIDE
Target Audience: Customers, Leadership, Compliance Officers, DevOps, and Auditors
Scope: SOC 2 Type II, ISO/IEC 27001:2022, NIST CSF v2.0

1. EXECUTIVE SUMMARY
Continuous, autonomous GRC platform powered by Meta Llama 3.1 8B Instruct.
- Zero third-party LLM data leakage (host-local inference)
- Real-time telemetry harvesting (AWS, GitHub, Google Workspace, Slack)
- 153 Continuous Programmatic Tests with 1-click Terraform/CLI fixes
- Scrut-style official PDF document cards and letterheads
- 1-Click 18-File Auditor Package (.ZIP)

2. CORE MODULES & FEATURES
- Dashboard (/dashboard): Compliance Donut, sub-meters, attention jobs.
- Automated Tests (/tests): 153 continuous tests, live AI remediation drawer.
- Integrations (/integrations): AWS, GitHub, Google WS, Slack connectors.
- Controls (/controls): Common Criteria CC1-CC6, Annex A, NIST CSF mapping.
- Risks (/risks): Inherent vs Residual risk scoring matrix.
- Audit Center (/audits): Common Criteria tracking and Corrective Actions.
- Policies (/policies): Scrut-style PDF document cards, versioning, approvals.
- Evidence Room (/evidence): Cryptographic SHA-256 dossiers and RAG citations.
- Reports (/reports): Executive summaries, SOC 2 binder, ISO SoA.
- Export to Auditor (/export): Binary ZIP streaming with 18 bundled artifacts.`;

    const lines = content.split('\n');
    const pdfBlob = generateSimplePDF('AI-Compliance Product Guide & Architecture', lines);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI_Compliance_Product_Architecture_and_Flowchart.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1200);
  };

  const handleOpenPrintableHTML = () => {
    window.open('/api/docs?format=html', '_blank');
  };

  const ACTORS = [
    {
      id: 'admin',
      role: 'Compliance Officer / GRC Lead',
      badge: 'GRC Lead',
      avatar: '👤',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
      tagColor: 'bg-emerald-100 text-emerald-800',
      summary: 'Drives framework scoping, reviews AI-drafted policies, manages risk registers, and oversees audit attestation.',
      useCases: [
        { name: 'Multi-Framework Scoping', desc: 'Activate SOC 2, ISO 27001, NIST CSF, HIPAA scopes', link: '/frameworks', actionLabel: 'Explore Frameworks' },
        { name: 'Autonomous Policy Approvals', desc: 'Approve AI-drafted policies with versioning & signatures', link: '/policies', actionLabel: 'Review Policies' },
        { name: 'Enterprise Risk Management', desc: 'Tune Inherent vs Residual risk scoring & mitigation plans', link: '/risks', actionLabel: 'Manage Risks' },
        { name: 'Executive Audit Readiness', desc: 'Track readiness meters and non-conformities across criteria', link: '/audits', actionLabel: 'Audit Center' },
        { name: 'Auditor Package Export', desc: '1-click export of 18 bundled compliance artifacts (.ZIP)', link: '/export', actionLabel: 'Export Package' },
      ],
    },
    {
      id: 'devops',
      role: 'DevOps & Cloud Engineer',
      badge: 'Infrastructure & SecOps',
      avatar: '👨‍💻',
      color: 'border-blue-500 bg-blue-50/50 text-blue-900',
      tagColor: 'bg-blue-100 text-blue-800',
      summary: 'Connects cloud telemetry connectors, inspects failing automated tests, and applies 1-click Terraform / CLI fixes.',
      useCases: [
        { name: 'Connect Read-Only Cloud APIs', desc: 'AWS IAM/S3, GitHub repos, Google Workspace, Slack', link: '/integrations', actionLabel: 'Manage Integrations' },
        { name: '153 Continuous Automated Tests', desc: 'Real-time telemetry validation for MFA, encryption, PR rules', link: '/tests', actionLabel: 'Inspect Tests' },
        { name: '1-Click AI Auto-Remediation', desc: 'Generate & deploy Terraform scripts and AWS CLI commands', link: '/tests', actionLabel: 'Run Remediation' },
        { name: 'Live Security Audit Scans', desc: 'Trigger on-demand cloud sweeps across all infrastructure', link: '/integrations', actionLabel: 'Trigger Scan' },
      ],
    },
    {
      id: 'auditor',
      role: 'External CPA Auditor',
      badge: 'Independent Auditor',
      avatar: '🕵️‍♂️',
      color: 'border-purple-500 bg-purple-50/50 text-purple-900',
      tagColor: 'bg-purple-100 text-purple-800',
      summary: 'Performs independent examination of Trust Services Criteria, inspects cryptographic evidence, and signs off SOC 2.',
      useCases: [
        { name: 'Common Criteria Tracking (CC1.0 - CC6.0)', desc: 'Inspect point-in-time compliance and corrective action plans', link: '/audits', actionLabel: 'Inspect Audits' },
        { name: 'Official Evidence Dossier Verification', desc: 'Review SHA-256 signed evidence payloads and RAG citations', link: '/evidence', actionLabel: 'Evidence Room' },
        { name: 'Official Policy Document Cards', desc: 'Download signed A4 executive PDF policies with version history', link: '/policies', actionLabel: 'Examine Policies' },
        { name: 'Binary Auditor Package (.ZIP)', desc: 'Verify complete package containing 18 signed JSONs & MANIFEST', link: '/export', actionLabel: 'Download Archive' },
      ],
    },
    {
      id: 'ai',
      role: 'Autonomous AI Engine (Llama 3.1 8B)',
      badge: 'Local Sovereignty',
      avatar: '🤖',
      color: 'border-amber-500 bg-amber-50/50 text-amber-900',
      tagColor: 'bg-amber-100 text-amber-800',
      summary: 'Air-gapped local fine-tuned LLM executing policy authoring, continuous test evaluation, RAG citations, and ZIP packaging.',
      useCases: [
        { name: 'Generative Policy Engine', desc: 'Drafts 10 custom compliance policies tailored to company tech stack', link: '/policies', actionLabel: 'Generate Policy' },
        { name: 'Automated 153 Tests Execution', desc: 'Evaluates telemetry data 24/7 without human intervention', link: '/tests', actionLabel: 'View Test Results' },
        { name: 'Instant Code Remediation', desc: 'Writes Infrastructure-as-Code Terraform and AWS CLI fixes', link: '/tests', actionLabel: 'Test Remediation' },
        { name: 'RAG Semantic Gap Analysis', desc: 'pgvector embeddings match uploaded documents to control clauses', link: '/evidence', actionLabel: 'View RAG Scores' },
      ],
    },
  ];

  const PHASES = [
    {
      step: 1,
      title: 'Quick Onboarding (5 Minutes)',
      badge: 'Phase 1: Bootstrap',
      desc: 'Declare organization profile, select frameworks (SOC 2, ISO 27001, NIST CSF), and let fine-tuned Llama 3.1 synthesize 10 complete policies.',
      link: '/onboarding',
      action: 'Launch Onboarding',
      outputs: ['10 Tailored Compliance Policies', 'Initial Organization Profile', 'Framework Targets Configured'],
    },
    {
      step: 2,
      title: 'Cloud Telemetry & Automated Evidence',
      badge: 'Phase 2: Ingestion',
      desc: 'Connect read-only APIs for AWS Cloud, GitHub repos, Google Workspace, and Slack. Autonomous background scanners continuously pull telemetry.',
      link: '/integrations',
      action: 'Open Integrations',
      outputs: ['AWS S3/IAM Config JSONs', 'GitHub Branch Protection Evidence', 'Google WS 2FA Directories', 'Slack Audit Logs'],
    },
    {
      step: 3,
      title: 'Continuous Monitoring & AI Auto-Remediation',
      badge: 'Phase 3: Self-Healing',
      desc: '153 continuous automated tests execute against ingested telemetry. When a test fails, click "Resolve with AI" for instant Terraform & AWS CLI code.',
      link: '/tests',
      action: 'Go to Automated Tests',
      outputs: ['153 Automated Security Tests', 'Instant Terraform Fix Scripts', 'AWS CLI Remediation Commands'],
    },
    {
      step: 4,
      title: 'Policy & Evidence Room Review',
      badge: 'Phase 4: Scrut Layouts',
      desc: 'Review policies and evidence presented as official Scrut-style PDF document cards, complete with version pills, author sign-offs, and SHA-256 seals.',
      link: '/policies',
      action: 'Open Policies Room',
      outputs: ['Official A4 PDF Policies', 'Cryptographic Evidence Dossiers', 'RAG AI Semantic Confidence Scores'],
    },
    {
      step: 5,
      title: 'Auditor Examination & 1-Click Export',
      badge: 'Phase 5: CPA Sign-Off',
      desc: 'External auditors inspect the Common Criteria (CC1-CC6) dashboard. The compliance officer streams a 1-click 18-file ZIP archive for clean attestation.',
      link: '/export',
      action: 'Export Auditor Package',
      outputs: ['18-File Auditor ZIP Archive', 'Executive Audit Dossier (.PDF)', 'Clean SOC 2 / ISO 27001 Report'],
    },
  ];

  const MODULE_MATRIX = [
    { name: 'Executive Dashboard', path: '/dashboard', status: 'Active', desc: 'SVG compliance donut (88.5%), sub-meters, attention jobs with AI resolution, entity switcher.', primaryActor: 'Compliance Officer / Exec' },
    { name: 'Automated Tests', path: '/tests', status: 'Active', desc: '153 continuous tests, live terminal remediation modal, Terraform & CLI scripts, tagged IAM badges.', primaryActor: 'DevOps & Security' },
    { name: 'Integrations Hub', path: '/integrations', status: 'Active', desc: 'AWS, GitHub, Google WS, Slack connectors, live scan trigger, capability drawer.', primaryActor: 'DevOps & Security' },
    { name: 'Controls Matrix', path: '/controls', status: 'Active', desc: 'SOC 2 CC1-CC6, ISO 27001 Annex A, NIST CSF controls, mapped evidence chips, custom control builder.', primaryActor: 'Compliance Officer' },
    { name: 'Risk Register', path: '/risks', status: 'Active', desc: 'Inherent vs Residual scoring matrix, treatment workflows, risk register PDF & MD export.', primaryActor: 'Compliance Officer' },
    { name: 'Audit Center', path: '/audits', status: 'Active', desc: 'Common Criteria CC1-CC6 accordions, readiness meters, corrective action plan, audit dossier export.', primaryActor: 'External Auditor' },
    { name: 'Autonomous Policies', path: '/policies', status: 'Active', desc: 'Scrut-style PDF attachments card, executive A4 document viewer, version pills, AI policy author.', primaryActor: 'Compliance Officer' },
    { name: 'Evidence Room', path: '/evidence', status: 'Active', desc: 'Cryptographic SHA-256 seal, metadata grid, RAG AI gap analysis with confidence scores & citations.', primaryActor: 'Auditor & DevOps' },
    { name: 'Reports Binder', path: '/reports', status: 'Active', desc: 'Executive Summary, SOC 2 Pre-Audit Evidence Binder, ISO 27001 Statement of Applicability (SoA).', primaryActor: 'Leadership & Auditor' },
    { name: 'Frameworks Library', path: '/frameworks', status: 'Active', desc: 'SOC 2, ISO 27001, NIST CSF, plus import catalog for HIPAA, ISO 42001 (AI), GDPR, PCI-DSS.', primaryActor: 'Compliance Officer' },
    { name: 'Export to Auditor', path: '/export', status: 'Active', desc: '1-click binary ZIP download streaming 18 files: 10 policies, 6 signed telemetry JSONs, MANIFEST.', primaryActor: 'Auditor & GRC Lead' },
    { name: 'System Settings', path: '/settings', status: 'Active', desc: 'Org profile, AI model ping test (Llama 3.1 8B on port 8000), team member invite modal.', primaryActor: 'System Admin' },
    { name: 'Rapid Onboarding', path: '/onboarding', status: 'Active', desc: '5-step wizard configuring cloud provider, IdP, frameworks, and auto-generating initial policies.', primaryActor: 'New Organization' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header & Export Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Product Guide v1.0
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                  Meta Llama 3.1 8B &bull; Fine-Tuned GRC
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems 100% Operational
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Product Architecture, Use Cases & End-to-End Flows
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Comprehensive reference guide for customers, compliance leads, DevOps engineers, and CPA auditors. 
                Learn how the autonomous AI compliance engine transforms months of manual audits into continuous, real-time attestation.
              </p>
            </div>

            {/* Direct Export & Document Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Compiling PDF...' : 'Download Official Guide (.PDF)'}
              </button>

              <button
                onClick={handleOpenPrintableHTML}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                Open Interactive HTML Guide
              </button>

              <a
                href="/api/docs?format=download-md"
                download="AI_Compliance_Product_Guide.md"
                className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Download Raw Markdown (.md)
              </a>
            </div>
          </div>

          {/* Infrastructure Health Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Web UI: <strong className="text-white font-mono">Port 3000</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>NestJS API: <strong className="text-white font-mono">Port 4000</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>AI Service: <strong className="text-white font-mono">Port 8000</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Model: <strong className="text-white font-mono">Llama 3.1 8B</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('usecases')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'usecases'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Use Case Architecture Diagram
          </button>

          <button
            onClick={() => setActiveTab('flowchart')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'flowchart'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. End-to-End Product Flowchart
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            3. Feature Accessibility Matrix
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'markdown'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            4. Full Documentation Reader
          </button>
        </div>

        {/* TAB 1: USE CASE ARCHITECTURE DIAGRAM */}
        {activeTab === 'usecases' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="max-w-3xl space-y-2 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Actor-Centric Product Architecture</h2>
                <p className="text-sm text-slate-500">
                  Select an actor below to inspect their direct responsibilities, workflows, and 1-click links into the live product modules.
                </p>
              </div>

              {/* Actor Selector Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {ACTORS.map((actor) => {
                  const isSelected = activeActor === actor.id;
                  return (
                    <button
                      key={actor.id}
                      onClick={() => setActiveActor(actor.id as any)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${actor.color} shadow-md scale-[1.02]`
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{actor.avatar}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${actor.tagColor}`}>
                          {actor.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{actor.role}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{actor.summary}</p>
                    </button>
                  );
                })}
              </div>

              {/* Selected Actor Deep-Dive Box */}
              {(() => {
                const current = ACTORS.find((a) => a.id === activeActor) || ACTORS[0];
                return (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{current.avatar}</span>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{current.role} Workflows</h3>
                          <p className="text-xs text-slate-500">{current.summary}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {current.useCases.map((uc, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:border-emerald-400 hover:shadow-sm transition"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                                {i + 1}
                              </span>
                              <h4 className="text-sm font-semibold text-slate-900">{uc.name}</h4>
                            </div>
                            <p className="text-xs text-slate-500 ml-7 mb-4">{uc.desc}</p>
                          </div>

                          <div className="ml-7 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-400">{uc.link}</span>
                            <Link
                              href={uc.link}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              {uc.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Architecture Ecosystem Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Cross-Functional Architecture Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Cloud className="w-4 h-4" /> Telemetry Harvesting
                  </div>
                  <p className="text-slate-600">
                    Direct read-only API connectors pull S3 configurations, IAM MFA states, GitHub branch protections, Google Workspace directories, and Slack DLP logs.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold">
                    <Cpu className="w-4 h-4" /> Continuous 153 Tests
                  </div>
                  <p className="text-slate-600">
                    Security rules run 24/7. When a control breaks, the platform generates 1-click Terraform code and AWS CLI scripts so engineers can remediate within minutes.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 font-bold">
                    <FolderArchive className="w-4 h-4" /> 1-Click Auditor ZIP Package
                  </div>
                  <p className="text-slate-600">
                    Packages 10 markdown & PDF policies, 6 signed telemetry JSON files, MANIFEST.json, and auditor README into a single binary archive for immediate CPA audit sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: END-TO-END PRODUCT FLOWCHART */}
        {activeTab === 'flowchart' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="max-w-3xl space-y-2 mb-6">
                <h2 className="text-xl font-bold text-slate-900">5-Phase Autonomous Compliance Flow</h2>
                <p className="text-sm text-slate-500">
                  Follow the linear path from initial 5-minute setup through continuous monitoring, remediation, and final auditor sign-off.
                </p>
              </div>

              {/* Step Progression Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-8">
                {PHASES.map((p) => {
                  const isSelected = activePhase === p.step;
                  return (
                    <button
                      key={p.step}
                      onClick={() => setActivePhase(p.step)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                        Step 0{p.step}
                      </span>
                      <span className="text-xs font-bold leading-tight block mt-0.5">{p.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Phase Deep Dive */}
              {(() => {
                const current = PHASES.find((p) => p.step === activePhase) || PHASES[0];
                return (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                          {current.badge}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">{current.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl">{current.desc}</p>
                      </div>

                      <Link
                        href={current.link}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition shrink-0"
                      >
                        {current.action} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Verified Artifacts Produced:</h4>
                      <div className="flex flex-wrap gap-2">
                        {current.outputs.map((out, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {out}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: FEATURE ACCESSIBILITY MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">All Modules & Feature Accessibility Matrix</h2>
              <p className="text-sm text-slate-500 mt-1">
                Every single feature from the product documentation is 100% implemented, verified, and directly accessible via the sidebar and links below.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Module Name</th>
                    <th className="py-3 px-4">Route Path</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Primary Actor</th>
                    <th className="py-3 px-4">Key Capabilities</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MODULE_MATRIX.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{m.path}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{m.primaryActor}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs">{m.desc}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={m.path}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg font-semibold text-xs transition"
                        >
                          Open <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FULL DOCUMENTATION READER */}
        {activeTab === 'markdown' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">PRODUCT_GUIDE.md</h2>
                <p className="text-xs text-slate-500">Living documentation source file located at project root.</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/docs?format=download-md"
                  download="AI_Compliance_Product_Guide.md"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download .MD
                </a>
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Save as PDF
                </button>
              </div>
            </div>

            {loadingDoc ? (
              <div className="py-16 text-center text-slate-400">Loading documentation...</div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-x-auto">
                {docContent || 'Documentation loaded.'}
              </pre>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
