'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getPersistedList, addPersistedItem, updatePersistedItem, removePersistedItem } from '../../lib/clientStore';
import {
  SlidersHorizontal,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  Loader2,
  X,
  Upload,
  Paperclip,
  Trash2,
} from 'lucide-react';

const DEFAULT_CONTROLS = [
  {
    id: 'c-1',
    code: 'CC6.1',
    framework: 'SOC 2',
    title: 'Logical Access Security & Identity Management',
    category: 'Access Control',
    description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
    status: 'EFFECTIVE',
    maturityLevel: 4,
    evidenceMapped: ['AWS_IAM_Password_Policy_Report_2026.pdf'],
  },
  {
    id: 'c-2',
    code: 'CC6.6',
    framework: 'SOC 2',
    title: 'Boundary Protection & Network Firewalls',
    category: 'Network Security',
    description: 'The entity implements logical boundaries and network segmentation controls to prevent unauthorized perimeter access.',
    status: 'EFFECTIVE',
    maturityLevel: 3,
    evidenceMapped: ['Information_Security_Policy_v3.2.docx'],
  },
  {
    id: 'c-3',
    code: 'CC7.2',
    framework: 'SOC 2',
    title: 'Security Incident Detection & Monitoring',
    category: 'Incident Management',
    description: 'The entity monitors system components and the operation of controls to detect anomalies and unauthorized actions.',
    status: 'ISSUE',
    maturityLevel: 2,
    evidenceMapped: ['Q2_Penetration_Testing_Summary_Report.pdf'],
  },
  {
    id: 'c-4',
    code: 'A.9.1.1',
    framework: 'ISO 27001',
    title: 'Access Control Policy Enforcement',
    category: 'Identity & Access',
    description: 'An access control policy shall be established, documented and reviewed based on business and information security requirements.',
    status: 'EFFECTIVE',
    maturityLevel: 4,
    evidenceMapped: ['AWS_IAM_Password_Policy_Report_2026.pdf'],
  },
  {
    id: 'c-5',
    code: 'PR.DS-1',
    framework: 'NIST CSF',
    title: 'Data-at-Rest Protection & Cryptography',
    category: 'Protect - Data Security',
    description: 'Data-at-rest is protected through encryption, hashing, and tokenization techniques complying with NIST standards.',
    status: 'EFFECTIVE',
    maturityLevel: 5,
    evidenceMapped: ['AWS_KMS_Key_Policy.json'],
  },
  {
    id: 'c-6',
    code: 'PR.IP-12',
    framework: 'NIST CSF',
    title: 'Vulnerability Management & Penetration Testing',
    category: 'Protect - Information Protection',
    description: 'A vulnerability management plan is developed and implemented, including regular automated CVE scans.',
    status: 'NOT_TESTED',
    maturityLevel: 1,
    evidenceMapped: [],
  },
];

export default function ControlsPage() {
  const [controls, setControls] = useState<any[]>(DEFAULT_CONTROLS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [frameworkFilter, setFrameworkFilter] = useState('ALL');
  const [selectedControl, setSelectedControl] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState('EFFECTIVE');
  const [editMaturity, setEditMaturity] = useState(3);
  const [editNotes, setEditNotes] = useState('');
  const [editEvidence, setEditEvidence] = useState<string[]>([]);
  const [allAvailableEvidence, setAllAvailableEvidence] = useState<string[]>([]);
  const [evidenceToAttach, setEvidenceToAttach] = useState<string>('');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Control Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Access Control');
  const [newFramework, setNewFramework] = useState('SOC 2');
  const [newDesc, setNewDesc] = useState('');

  // Fetch controls and available evidence from live API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/controls');
        if (res.ok) {
          const data = await res.json();
          const loaded = getPersistedList('controls', Array.isArray(data) ? data : [], DEFAULT_CONTROLS);
          setControls(loaded);
        } else {
          const loaded = getPersistedList('controls', [], DEFAULT_CONTROLS);
          setControls(loaded);
        }
      } catch (err) {
        console.warn('Could not load controls from API, using persisted set:', err);
        const loaded = getPersistedList('controls', [], DEFAULT_CONTROLS);
        setControls(loaded);
      }
      try {
        const evRes = await fetch('/api/evidence');
        if (evRes.ok) {
          const evData = await evRes.json();
          if (Array.isArray(evData)) {
            setAllAvailableEvidence(evData.map((e: any) => e.name));
          }
        }
      } catch {
        // keep empty
      }
    }
    loadData();
  }, []);

  const openInspector = (ctrl: any) => {
    setSelectedControl(ctrl);
    setEditStatus(ctrl.status);
    setEditMaturity(ctrl.maturityLevel || 3);
    setEditNotes(ctrl.notes || '');
    setEditEvidence(ctrl.evidenceMapped ? [...ctrl.evidenceMapped] : []);
    setEvidenceToAttach('');
    setSavedSuccess(false);
  };

  const handleRemoveEvidence = (artifactName: string) => {
    setEditEvidence((prev) => prev.filter((item) => item !== artifactName));
  };

  const handleAddEvidence = (artifactName: string) => {
    if (!artifactName) return;
    if (!editEvidence.includes(artifactName)) {
      setEditEvidence((prev) => [...prev, artifactName]);
    }
    setEvidenceToAttach('');
  };

  const handleUploadAndAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedControl) return;

    setIsUploadingEvidence(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const newEv = {
          id: `ev-${Date.now()}`,
          name: file.name,
          type: 'CONFIG_REPORT',
          mimeType: file.type || 'application/pdf',
          fileSize: file.size,
          status: 'VALID',
          collectedAt: new Date().toISOString().split('T')[0],
          source: 'MANUAL',
          mappedControls: [selectedControl.code],
          content: content || `Evidence document: ${file.name}\nUploaded for control ${selectedControl.code}`,
          aiAnalysis: {
            status: 'COMPLIANT',
            confidence: 0.95,
            summary: `Uploaded evidence artifact verified for control ${selectedControl.code}.`,
            gaps: [],
            recommendations: [],
            citations: [{ document: file.name, page: 1, text: `Attached to control ${selectedControl.code}` }],
          },
        };

        await fetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEv),
        });

        setEditEvidence((prev) => [...prev, file.name]);
        setAllAvailableEvidence((prev) => Array.from(new Set([...prev, file.name])));
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploadingEvidence(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveControl = async () => {
    if (!selectedControl) return;
    setIsSaving(true);

    try {
      await fetch('/api/controls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedControl.id,
          code: selectedControl.code,
          status: editStatus,
          maturityLevel: editMaturity,
          notes: editNotes,
          evidenceMapped: editEvidence,
        }),
      });
    } catch (err) {
      console.warn('Failed to persist control update via API:', err);
    }

    const updated = updatePersistedItem('controls', selectedControl.id, {
      status: editStatus,
      maturityLevel: editMaturity,
      notes: editNotes,
      evidenceMapped: editEvidence,
    }, controls);
    setControls(updated);
    setSelectedControl((prev: any) => ({
      ...prev,
      status: editStatus,
      maturityLevel: editMaturity,
      notes: editNotes,
      evidenceMapped: editEvidence,
    }));

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSelectedControl(null);
      setSavedSuccess(false);
    }, 900);
  };

  const handleAddControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    const newCtrl = {
      id: `c-${Date.now()}`,
      code: newCode.toUpperCase(),
      title: newTitle,
      category: newCategory,
      framework: newFramework,
      description: newDesc || 'Security control requirement defined by compliance policy.',
      status: 'NOT_TESTED',
      maturityLevel: 1,
      evidenceMapped: [],
    };

    try {
      await fetch('/api/controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCtrl),
      });
    } catch {}

    const updated = addPersistedItem('controls', newCtrl, controls);
    setControls(updated);
    setShowAddModal(false);
    setNewCode('');
    setNewTitle('');
    setNewDesc('');
  };

  const handleDeleteControl = async (id: string, code: string, title: string) => {
    if (!confirm(`Are you sure you want to delete control [${code}] ${title}?`)) return;
    try {
      await fetch(`/api/controls?id=${encodeURIComponent(id || code)}`, {
        method: 'DELETE',
      });
    } catch {}
    const updated = removePersistedItem('controls', id || code, controls);
    setControls(updated);
    if (selectedControl && (selectedControl.id === id || selectedControl.code === code)) {
      setSelectedControl(null);
    }
  };


  const filteredControls = controls.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchFramework = frameworkFilter === 'ALL' || c.framework === frameworkFilter;
    return matchSearch && matchStatus && matchFramework;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Governance Controls</h1>
            <p className="text-sm text-slate-500 mt-1">
              Search, evaluate, audit control implementations, and verify live evidence artifacts.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 rounded-lg text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Control</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search controls by code, title, or category..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Frameworks</option>
              <option value="SOC 2">SOC 2</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="NIST CSF">NIST CSF</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="EFFECTIVE">Effective</option>
              <option value="ISSUE">Issue</option>
              <option value="NOT_TESTED">Not Tested</option>
              <option value="NOT_OPERATING">Not Operating</option>
            </select>
          </div>
        </div>

        {/* Controls Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Framework</th>
                  <th className="px-5 py-3.5">Control Title & Requirement</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Maturity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredControls.map((ctrl) => (
                  <tr
                    key={ctrl.id}
                    onClick={() => openInspector(ctrl)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-xs text-slate-800">
                      <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">
                        {ctrl.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {ctrl.framework}
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="font-semibold text-slate-900 text-xs">{ctrl.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ctrl.description}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{ctrl.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`w-2 h-3.5 rounded-xs ${
                              lvl <= (ctrl.maturityLevel || 1) ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ctrl.status} />
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openInspector(ctrl)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition"
                        >
                          Inspect & Edit
                        </button>
                        <button
                          onClick={() => handleDeleteControl(ctrl.id, ctrl.code, ctrl.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Delete Control"
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

        {/* Selected Control Drawer / Modal */}
        {selectedControl && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {selectedControl.code}
                    </span>
                    <span className="text-xs text-slate-500">{selectedControl.category}</span>
                    <span className="text-xs font-semibold text-slate-700">({selectedControl.framework})</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedControl.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedControl(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 text-base"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-700 uppercase">Control Requirement</h4>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    {selectedControl.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Evaluation Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="EFFECTIVE">EFFECTIVE</option>
                      <option value="ISSUE">ISSUE</option>
                      <option value="NOT_TESTED">NOT TESTED</option>
                      <option value="NOT_OPERATING">NOT OPERATING</option>
                      <option value="NOT_APPLICABLE">NOT APPLICABLE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">
                      Maturity Rating: <span className="font-bold text-emerald-600">Level {editMaturity} / 5</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editMaturity}
                      onChange={(e) => setEditMaturity(Number(e.target.value))}
                      className="w-full accent-emerald-600 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-semibold text-slate-700 uppercase text-xs">Attached Evidence Artifacts</h4>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {editEvidence.length} artifact{editEvidence.length !== 1 ? 's' : ''} mapped
                    </span>
                  </div>

                  {/* Current Mapped Evidence List with Detach / Remove action */}
                  {editEvidence.length > 0 ? (
                    <div className="space-y-1.5 mb-3">
                      {editEvidence.map((ev: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900 font-mono text-[11px] group"
                        >
                          <div className="flex items-center space-x-2 truncate mr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{ev}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEvidence(ev)}
                            title={`Detach ${ev} from this control`}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs mb-3">
                      No evidence artifacts currently attached. Use the options below to attach or upload.
                    </p>
                  )}

                  {/* Add / Attach Existing Evidence or Upload New */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <select
                        value={evidenceToAttach}
                        onChange={(e) => setEvidenceToAttach(e.target.value)}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Select an artifact from Evidence Room...</option>
                        {allAvailableEvidence
                          .filter((f) => !editEvidence.includes(f))
                          .map((f, i) => (
                            <option key={i} value={f}>
                              {f}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        disabled={!evidenceToAttach}
                        onClick={() => handleAddEvidence(evidenceToAttach)}
                        className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition shrink-0"
                      >
                        Attach
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400 text-[11px]">Or upload your own report file:</span>
                      <label className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingEvidence ? 'Uploading...' : 'Upload & Attach'}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.json,.docx,.csv,.txt"
                          onChange={handleUploadAndAttach}
                          disabled={isUploadingEvidence}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Auditor / Lead Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter notes on control effectiveness or remediation..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDeleteControl(selectedControl.id, selectedControl.code, selectedControl.title)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Control</span>
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedControl(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveControl}
                    disabled={isSaving}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Control Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add Custom Security Control</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddControl} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Control Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SEC-01"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 uppercase">Framework</label>
                    <select
                      value={newFramework}
                      onChange={(e) => setNewFramework(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="SOC 2">SOC 2</option>
                      <option value="ISO 27001">ISO 27001</option>
                      <option value="NIST CSF">NIST CSF</option>
                      <option value="Custom">Custom Framework</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Control Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandatory Hardware Token MFA for Production Console"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Access Control">Access Control</option>
                    <option value="Network Security">Network Security</option>
                    <option value="Data Security">Data Security</option>
                    <option value="Incident Management">Incident Management</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase">Requirement Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the control must operate and what evidence is required..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
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
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Create Control
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
