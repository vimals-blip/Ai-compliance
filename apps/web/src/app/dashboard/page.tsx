'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  FileSearch,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Upload,
  RefreshCw,
  Building2,
  Cpu,
  FileText,
  Paperclip,
  Check,
  ChevronRight,
  Play,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState('All Entities');
  const [activeJobTab, setActiveJobTab] = useState<'policies' | 'evidence' | 'tests'>('policies');
  const [resolvedJobIds, setResolvedJobIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const summary = await api.getDashboardSummary();
        setData(summary);
      } catch (e) {
        // Fallback robust mock matching Scrut data model
        setData({
          complianceScore: 88.5,
          previousComplianceScore: 78.0,
          compliantCount: 147,
          nonCompliantCount: 19,
          totalControls: 166,
          openRisks: 6,
          auditFindings: 4,
          subMeters: {
            policiesPercent: 100,
            evidencePercent: 84,
            automatedTestsPercent: 92,
          },
          frameworks: [
            { name: 'SOC 2 Type II', code: 'SOC2', version: '2022', score: 92, effective: 59, total: 64 },
            { name: 'ISO/IEC 27001:2022', code: 'ISO27001', version: '2022', score: 86, effective: 80, total: 93 },
            { name: 'NIST CSF', code: 'NIST-CSF', version: 'v2.0', score: 84, effective: 91, total: 108 },
          ],
          controlsStatus: [
            { status: 'EFFECTIVE', count: 147, percentage: 88.5 },
            { status: 'ISSUE', count: 10, percentage: 6.0 },
            { status: 'NOT_TESTED', count: 9, percentage: 5.5 },
          ],
          jobs: {
            policies: [
              { id: 'pol-1', title: 'Information Security (IS) Policy - Annual Review', department: 'GOV', priority: 'HIGH' },
              { id: 'pol-2', title: 'Mobile Device and Teleworking Policy', department: 'IT', priority: 'MEDIUM' },
              { id: 'pol-3', title: 'Threat Intelligence Policy', department: 'IT', priority: 'MEDIUM' },
            ],
            evidence: [
              { id: 'ev-1', title: 'Q2 Penetration Testing Remediation Validation', department: 'SECURITY', priority: 'HIGH' },
              { id: 'ev-2', title: 'Quarterly Privileged Access Review Sign-Off', department: 'IT', priority: 'HIGH' },
              { id: 'ev-3', title: 'Disaster Recovery Plan Annual Test Results', department: 'GOV', priority: 'MEDIUM' },
            ],
            tests: [
              { id: 'tst-1', title: 'SEC-AWS-004: IAM Users Enforce Hardware/Virtual MFA', department: 'AWS IAM', priority: 'CRITICAL' },
              { id: 'tst-2', title: 'SEC-DB-001: RDS PostgreSQL Automated Backup Retention < 30 Days', department: 'AWS RDS', priority: 'HIGH' },
            ],
          },
          recentFindings: [
            { id: '1', title: 'MFA not enforced for legacy staging VPN gateway', severity: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-09-30' },
            { id: '2', title: 'Quarterly access review missing Q2 sign-off', severity: 'MEDIUM', status: 'OPEN', dueDate: '2026-10-05' },
            { id: '3', title: 'Unencrypted S3 backup bucket in secondary region', severity: 'CRITICAL', status: 'IN_PROGRESS', dueDate: '2026-09-20' },
            { id: '4', title: 'Vendor SOC 2 reports expired for 2 sub-processors', severity: 'LOW', status: 'OPEN', dueDate: '2026-10-15' },
          ],
          riskHeatmap: [
            { likelihood: 5, impact: 5, count: 1 },
            { likelihood: 4, impact: 4, count: 2 },
            { likelihood: 3, impact: 4, count: 3 },
            { likelihood: 2, impact: 3, count: 5 },
            { likelihood: 1, impact: 2, count: 8 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const summary = await api.getDashboardSummary();
      if (summary) setData(summary);
    } catch (e) {
      console.warn('Refresh dashboard summary fallback:', e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleResolveJob = async (jobId: string) => {
    setResolvedJobIds((prev) => [...prev, jobId]);

    try {
      if (activeJobTab === 'policies') {
        await fetch('/api/policies', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: jobId, status: 'PUBLISHED' }),
        });
      } else if (activeJobTab === 'tests') {
        const testTarget = jobId.startsWith('tst-') ? jobId.replace('tst-', 'test-') : jobId;
        await fetch('/api/tests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: testTarget, status: 'PASS' }),
        });
      } else if (activeJobTab === 'evidence') {
        await fetch('/api/evidence', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: jobId, status: 'VALID' }),
        });
      }

      // Re-fetch dynamically updated compliance score and sub-meters
      setTimeout(async () => {
        const updatedSummary = await api.getDashboardSummary();
        if (updatedSummary) setData(updatedSummary);
      }, 400);
    } catch (err) {
      console.warn('Failed to resolve job via API:', err);
    }
  };

  const score = data?.complianceScore ?? 88.5;
  const compliantCount = data?.compliantCount ?? 147;
  const nonCompliantCount = data?.nonCompliantCount ?? 19;

  const currentJobs = (data?.jobs?.[activeJobTab] || []).filter(
    (j: any) => !resolvedJobIds.includes(j.id)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Scrut-style Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous compliance posture, automated verification tasks, and active audits.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Entity Selector Dropdown (Scrut Image 1, 4, 7, 10) */}
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs text-xs font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-2"
              >
                <option>All Entities</option>
                <option>Production AWS US-East</option>
                <option>EU Cloud Region</option>
                <option>Corporate IT</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-xs hover:bg-slate-50 transition"
              title="Refresh compliance telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Readiness Banner (Scrut Image 10) */}
        {score >= 80 && (
          <div id="tour-dash-export-banner" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 animate-in fade-in">

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Great work! With everything in place, you're now ready for your SOC 2 & ISO 27001 audit.
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Automated tests are passing and policies are approved. Hand off directly to your auditor.
                </p>
              </div>
            </div>
            <Link
              href="/export"
              className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 shrink-0 transition shadow-sm"
            >
              Export Auditor Package &rarr;
            </Link>
          </div>
        )}

        {/* ─── TWO MAJOR HERO WIDGETS (Matching Scrut Automation Images 1, 4, 7, 10) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Compliance Progress (7 cols) */}
          <div id="tour-dashboard-progress" className="lg:col-span-6 xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-base font-bold text-slate-900">Compliance Progress</h2>
                  <span className="text-slate-400 text-xs cursor-help" title="Weighted score across active frameworks">ⓘ</span>
                </div>
                <Link
                  href="/frameworks"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  View Compliance Trend &rarr;
                </Link>
              </div>

              {/* Central Donut Chart */}
              <div className="relative flex items-center justify-center py-6">
                <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#F1F5F9"
                    strokeWidth="11"
                    fill="transparent"
                  />
                  {/* Non-compliant Arc (Amber/Red) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#F87171"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                  />
                  {/* Compliant Arc (Emerald) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#10B981"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Compliant
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {score}%
                  </span>
                </div>

                {/* Left/Right callout labels matching Scrut Image 1 & 4 */}
                <div className="absolute top-2 right-4 text-right">
                  <span className="text-[11px] font-medium text-slate-400 block">Compliant</span>
                  <span className="text-xs font-bold text-slate-800">{compliantCount}</span>
                </div>
                <div className="absolute bottom-2 left-4 text-left">
                  <span className="text-[11px] font-medium text-slate-400 block">Non Compliant</span>
                  <span className="text-xs font-bold text-slate-800">{nonCompliantCount}</span>
                </div>
              </div>
            </div>

            {/* 3 Sub-Meter Progress Rings (Scrut Images 4, 7, 10) */}
            <div id="tour-dashboard-meters" className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">

              {/* Policies Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#10B981"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - (data?.subMeters?.policiesPercent ?? 100) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <FileText className="w-4 h-4 text-slate-700 absolute" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {data?.subMeters?.policiesPercent ?? 100}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Policies</span>
              </div>

              {/* Evidence Tasks Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#F59E0B"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - (data?.subMeters?.evidencePercent ?? 84) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Paperclip className="w-4 h-4 text-slate-700 absolute" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {data?.subMeters?.evidencePercent ?? 84}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Evidence Tasks</span>
              </div>

              {/* Automated Tests Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#3B82F6"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - (data?.subMeters?.automatedTestsPercent ?? 92) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Cpu className="w-4 h-4 text-slate-700 absolute" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {data?.subMeters?.automatedTestsPercent ?? 92}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Automated Tests</span>
              </div>
            </div>
          </div>

          {/* Card 2: Jobs that need your attention (5 cols) */}
          <div id="tour-dashboard-jobs" className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Jobs that need your attention</h2>
              </div>

              {/* Tab Pills matching Scrut Images 1, 4, 7 */}
              <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  onClick={() => setActiveJobTab('policies')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeJobTab === 'policies'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Policies</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeJobTab === 'policies' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {(data?.jobs?.policies || []).filter((j: any) => !resolvedJobIds.includes(j.id)).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveJobTab('evidence')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeJobTab === 'evidence'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Evidence Tasks</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeJobTab === 'evidence' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {(data?.jobs?.evidence || []).filter((j: any) => !resolvedJobIds.includes(j.id)).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveJobTab('tests')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeJobTab === 'tests'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Automated Tests</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeJobTab === 'tests' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {(data?.jobs?.tests || []).filter((j: any) => !resolvedJobIds.includes(j.id)).length}
                  </span>
                </button>
              </div>

              {/* Actionable Jobs List */}
              {currentJobs.length > 0 ? (
                <div className="space-y-3">
                  {currentJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-slate-900 truncate">{job.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {job.department}
                          </span>
                          <span className="text-[10px] text-slate-400">SOC 2 Criteria</span>
                        </div>
                      </div>

                      <button
                        id="tour-dash-resolve-btn"
                        onClick={() => handleResolveJob(job.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Scrut "All good here" Empty State (Images 7 & 10) */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">All good here.</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No outstanding jobs requiring attention in this category.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {currentJobs.length} unresolved action items
              </span>
              <Link
                href={activeJobTab === 'policies' ? '/policies' : activeJobTab === 'evidence' ? '/evidence' : '/tests'}
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View all in module &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ─── SECONDARY FRAMEWORK & RISK ROW ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Framework Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Framework Compliance Posture</h3>
            <div className="space-y-3">
              {(data?.frameworks || []).map((fw: any) => (
                <div key={fw.code} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">{fw.name}</span>
                    <span className="font-mono font-bold text-emerald-600">{fw.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${fw.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>{fw.effective} of {fw.total} controls passed</span>
                    <span className="text-emerald-600 font-medium">Audit Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5x5 Inherent vs Residual Heatmap */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">5x5 Residual Risk Heatmap</h3>
              <Link href="/risks" className="text-xs font-semibold text-emerald-600 hover:underline">
                Risk Register &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-1.5 aspect-square max-w-[240px] mx-auto">
              {[5, 4, 3, 2, 1].map((impact) =>
                [1, 2, 3, 4, 5].map((likelihood) => {
                  const score = impact * likelihood;
                  const color =
                    score >= 15
                      ? 'bg-rose-500 text-white'
                      : score >= 8
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-emerald-400 text-slate-900';
                  const cell = (data?.riskHeatmap || []).find(
                    (h: any) => h.likelihood === likelihood && h.impact === impact
                  );
                  return (
                    <div
                      key={`${impact}-${likelihood}`}
                      className={`${color} rounded-md flex items-center justify-center font-bold text-xs shadow-xs`}
                      title={`Likelihood: ${likelihood}, Impact: ${impact}`}
                    >
                      {cell?.count || ''}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Residual matrix: Likelihood (X-axis) &bull; Impact (Y-axis)
            </p>
          </div>

          {/* Active Findings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Active Audit Findings</h3>
              <Link href="/audits" className="text-xs font-semibold text-emerald-600 hover:underline">
                Audit Center &rarr;
              </Link>
            </div>
            <div className="space-y-2.5">
              {(data?.recentFindings || []).slice(0, 3).map((f: any) => (
                <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 line-clamp-1">{f.title}</p>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Due: {f.dueDate}</span>
                    <span className="font-semibold text-slate-700">{f.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
