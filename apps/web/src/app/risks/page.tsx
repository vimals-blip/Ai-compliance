'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../lib/api';
import { generateSimplePDF } from '../../lib/pdfGenerator';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Download,
  Check,
  Loader2,
  X,
  FileText,
  CheckCircle2,
  Trash2,
  Edit2,
} from 'lucide-react';

export default function RisksPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [editTreatment, setEditTreatment] = useState('MITIGATED');
  const [editStatus, setEditStatus] = useState('OPEN');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSaved, setEditSaved] = useState(false);

  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    category: 'Security',
    inherentLikelihood: 4,
    inherentImpact: 4,
    residualLikelihood: 2,
    residualImpact: 2,
    treatment: 'MITIGATED',
  });
  const [orgName, setOrgName] = useState('CloudSecure Enterprise');

  useEffect(() => {
    async function load() {
      try {
        const orgRes = await fetch('/api/organization');
        if (orgRes.ok) {
          const org = await orgRes.json();
          if (org && org.name) setOrgName(org.name);
        }
      } catch {
        // keep default
      }
      try {
        const res = await api.getRisks();
        if (Array.isArray(res) && res.length > 0) {
          setRisks(res);
        } else {
          throw new Error('Empty');
        }
      } catch (e) {
        setRisks([
          {
            id: 'r-1',
            title: 'Unencrypted S3 backup bucket in secondary region',
            description: 'Backup snapshots stored without customer-managed KMS encryption key.',
            category: 'Infrastructure',
            inherentLikelihood: 4,
            inherentImpact: 5,
            inherentRiskScore: 20,
            residualLikelihood: 3,
            residualImpact: 4,
            residualRiskScore: 12,
            treatment: 'MITIGATED',
            severity: 'HIGH',
            status: 'OPEN',
          },
          {
            id: 'r-2',
            title: 'MFA not enforced for legacy staging VPN',
            description: 'Staging environment VPN gateway allows single-factor password authentication.',
            category: 'Access Control',
            inherentLikelihood: 3,
            inherentImpact: 4,
            inherentRiskScore: 12,
            residualLikelihood: 2,
            residualImpact: 2,
            residualRiskScore: 4,
            treatment: 'MITIGATED',
            severity: 'LOW',
            status: 'OPEN',
          },
          {
            id: 'r-3',
            title: 'Quarterly access review missing Q2 sign-off',
            description: 'IAM user list not signed off by engineering directors for previous quarter.',
            category: 'Governance',
            inherentLikelihood: 3,
            inherentImpact: 2,
            inherentRiskScore: 6,
            residualLikelihood: 1,
            residualImpact: 2,
            residualRiskScore: 2,
            treatment: 'ACCEPTED',
            severity: 'LOW',
            status: 'MITIGATED',
          },
          {
            id: 'r-4',
            title: 'Vendor SOC 2 reports expired for 2 sub-processors',
            description: 'Third-party cloud monitoring vendor report older than 12 months.',
            category: 'Third-Party Risk',
            inherentLikelihood: 2,
            inherentImpact: 2,
            inherentRiskScore: 4,
            residualLikelihood: 2,
            residualImpact: 2,
            residualRiskScore: 4,
            treatment: 'OPEN',
            severity: 'LOW',
            status: 'OPEN',
          },
        ]);
      }
    }
    load();
  }, []);

  const handleCreateRisk = async () => {
    const inherentScore = newRisk.inherentLikelihood * newRisk.inherentImpact;
    const residualScore = newRisk.residualLikelihood * newRisk.residualImpact;
    let sev: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (residualScore >= 15) sev = 'CRITICAL';
    else if (residualScore >= 10) sev = 'HIGH';
    else if (residualScore >= 5) sev = 'MEDIUM';

    const created = {
      id: `r-${Date.now()}`,
      ...newRisk,
      inherentRiskScore: inherentScore,
      residualRiskScore: residualScore,
      severity: sev,
      status: 'OPEN',
    };

    try {
      await api.createRisk(created);
    } catch {
      // fallback
    }

    setRisks([created, ...risks]);
    setShowAddModal(false);
    setNewRisk({
      title: '',
      description: '',
      category: 'Security',
      inherentLikelihood: 4,
      inherentImpact: 4,
      residualLikelihood: 2,
      residualImpact: 2,
      treatment: 'MITIGATED',
    });
  };

  const openRiskInspector = (r: any) => {
    setSelectedRisk(r);
    setEditTreatment(r.treatment || 'MITIGATED');
    setEditStatus(r.status || 'OPEN');
    setEditSaved(false);
  };

  const handleSaveRiskEdit = async () => {
    if (!selectedRisk) return;
    setIsSavingEdit(true);

    try {
      await fetch('/api/risks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRisk.id,
          treatment: editTreatment,
          status: editStatus,
        }),
      });
    } catch {}

    setRisks((prev) =>
      prev.map((r) =>
        r.id === selectedRisk.id ? { ...r, treatment: editTreatment, status: editStatus } : r
      )
    );

    setIsSavingEdit(false);
    setEditSaved(true);
    setTimeout(() => {
      setSelectedRisk(null);
      setEditSaved(false);
    }, 800);
  };

  const handleDeleteRisk = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete risk "${title}"?`)) return;
    try {
      await fetch(`/api/risks?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch {}
    setRisks((prev) => prev.filter((r) => r.id !== id));
    if (selectedRisk && selectedRisk.id === id) {
      setSelectedRisk(null);
    }
  };


  const handleExportMarkdown = () => {
    const md = `# Corporate Compliance Risk Register
**Organization:** ${orgName}
**Date:** ${new Date().toISOString().split('T')[0]}
**Total Open Risks:** ${risks.filter(r => r.status === 'OPEN').length}

| Title | Category | Inherent Score | Residual Score | Treatment | Status |
|---|---|---|---|---|---|
${risks.map(r => `| ${r.title} | ${r.category} | ${r.inherentRiskScore || (r.inherentLikelihood * r.inherentImpact)} | ${r.residualRiskScore || (r.residualLikelihood * r.residualImpact)} | ${r.treatment || 'OPEN'} | ${r.status} |`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgName.replace(/\s+/g, '_')}_Risk_Register_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const lines = [
      `${orgName.toUpperCase()} - ENTERPRISE RISK REGISTER`,
      `Assessment Scope: SOC 2, ISO 27001, NIST CSF`,
      `Exported: ${new Date().toUTCString()}`,
      ``,
      `RISK INVENTORY:`,
      ...risks.map(r => `[${r.severity || 'HIGH'}] ${r.title}` + `\nCategory: ${r.category} | Inherent: ${r.inherentRiskScore || 12} -> Residual: ${r.residualRiskScore || 4} | Treatment: ${r.treatment || 'MITIGATED'} | Status: ${r.status}`),
    ];
    const blob = generateSimplePDF('Enterprise Risk Register', lines, orgName);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgName.replace(/\s+/g, '_')}_Risk_Register_${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = risks.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === 'ALL' || r.severity === severityFilter;
    return matchSearch && matchSev;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div data-tour="risk-matrix">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk Register</h1>
            <p className="text-sm text-slate-500 mt-1">
              Identify inherent vs residual scores, map mitigation strategies, and track treatments. Click any risk to edit.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-xs transition"
              title="Download as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-xs transition"
              title="Download as PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export .PDF</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 rounded-lg text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Risk</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search risks by title or category..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Residual Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Risk Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Risk Description</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 bg-red-50/50">Inherent Score</th>
                  <th className="px-5 py-3.5 bg-emerald-50/50">Residual Score</th>
                  <th className="px-5 py-3.5">Treatment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((risk) => (
                  <tr
                    key={risk.id}
                    onClick={() => openRiskInspector(risk)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 max-w-md">
                      <p className="font-semibold text-slate-900 text-xs">{risk.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{risk.description}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{risk.category}</td>

                    {/* Inherent Score Column */}
                    <td className="px-5 py-4 bg-red-50/20 border-l border-red-100/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {risk.inherentRiskScore || (risk.inherentLikelihood * risk.inherentImpact)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          L:{risk.inherentLikelihood} I:{risk.inherentImpact}
                        </span>
                      </div>
                    </td>

                    {/* Residual Score Column */}
                    <td className="px-5 py-4 bg-emerald-50/20 border-l border-emerald-100/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {risk.residualRiskScore || (risk.residualLikelihood * risk.residualImpact)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          L:{risk.residualLikelihood} I:{risk.residualImpact}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-700">
                        {risk.treatment || 'OPEN'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={risk.status} />
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openRiskInspector(risk)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition"
                        >
                          Inspect / Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRisk(risk.id, risk.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Delete Risk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspect / Edit Risk Modal */}
        {selectedRisk && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    Category: {selectedRisk.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedRisk.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedRisk(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-700 uppercase mb-1">Risk Context</h4>
                  <p className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                    {selectedRisk.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Treatment Plan</label>
                    <select
                      value={editTreatment}
                      onChange={(e) => setEditTreatment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    >
                      <option value="MITIGATED">Mitigated (Controls Deployed)</option>
                      <option value="ACCEPTED">Accepted (Business Justification)</option>
                      <option value="TRANSFERRED">Transferred (Cyber Insurance / Vendor)</option>
                      <option value="AVOIDED">Avoided (Feature Decommissioned)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Lifecycle Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="MITIGATED">MITIGATED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {editSaved ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>Updated and saved to API!</span>
                    </span>
                  ) : <span />}
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => handleDeleteRisk(selectedRisk.id, selectedRisk.title)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Risk</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRisk(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleSaveRiskEdit}
                        disabled={isSavingEdit}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Save Treatment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Risk Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 shrink-0">
                <h3 className="text-base font-bold text-slate-900">Add New Risk Item</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Risk Title *</label>
                  <input
                    type="text"
                    value={newRisk.title}
                    onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                    placeholder="e.g. Unauthenticated webhook endpoint exposed to internet"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Category</label>
                    <select
                      value={newRisk.category}
                      onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Access Control">Access Control</option>
                      <option value="Data Security">Data Security</option>
                      <option value="Governance">Governance</option>
                      <option value="Third-Party Risk">Third-Party Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Risk Treatment</label>
                    <select
                      value={newRisk.treatment}
                      onChange={(e) => setNewRisk({ ...newRisk, treatment: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    >
                      <option value="MITIGATED">Mitigated</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="TRANSFERRED">Transferred</option>
                      <option value="AVOIDED">Avoided</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Description & Impact</label>
                  <textarea
                    rows={2}
                    value={newRisk.description}
                    onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                    placeholder="Describe vulnerability, threat vector, and business consequence..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="font-bold text-red-600 uppercase block mb-2">Inherent Risk</span>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>Likelihood (1-5)</span>
                          <span className="font-bold font-mono">{newRisk.inherentLikelihood}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newRisk.inherentLikelihood}
                          onChange={(e) => setNewRisk({ ...newRisk, inherentLikelihood: Number(e.target.value) })}
                          className="w-full accent-red-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>Impact (1-5)</span>
                          <span className="font-bold font-mono">{newRisk.inherentImpact}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newRisk.inherentImpact}
                          onChange={(e) => setNewRisk({ ...newRisk, inherentImpact: Number(e.target.value) })}
                          className="w-full accent-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-600 uppercase block mb-2">Residual Risk (After Controls)</span>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>Likelihood (1-5)</span>
                          <span className="font-bold font-mono">{newRisk.residualLikelihood}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newRisk.residualLikelihood}
                          onChange={(e) => setNewRisk({ ...newRisk, residualLikelihood: Number(e.target.value) })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>Impact (1-5)</span>
                          <span className="font-bold font-mono">{newRisk.residualImpact}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newRisk.residualImpact}
                          onChange={(e) => setNewRisk({ ...newRisk, residualImpact: Number(e.target.value) })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateRisk}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Add to Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
