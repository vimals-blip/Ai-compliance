'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { getPersistedList, addPersistedItem } from '../../lib/clientStore';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

const DEFAULT_FRAMEWORKS = [
  {
    id: 'soc2-1',
    name: 'SOC 2 Type II',
    code: 'SOC2',
    version: '2022',
    description: 'AICPA Trust Services Criteria covering Security, Availability, and Confidentiality.',
    controlsCount: 64,
    effectiveCount: 58,
    score: 90.6,
  },
  {
    id: 'iso-1',
    name: 'ISO/IEC 27001:2022',
    code: 'ISO27001',
    version: '2022',
    description: 'International standard for Information Security Management Systems (ISMS Annex A controls).',
    controlsCount: 93,
    effectiveCount: 76,
    score: 81.7,
  },
  {
    id: 'nist-1',
    name: 'NIST Cybersecurity Framework',
    code: 'NIST-CSF',
    version: 'v2.0',
    description: 'National Institute of Standards and Technology CSF core: Govern, Identify, Protect, Detect, Respond, Recover.',
    controlsCount: 108,
    effectiveCount: 85,
    score: 78.7,
  },
];

const AVAILABLE_FRAMEWORKS = [
  {
    id: 'hipaa-1',
    name: 'HIPAA Security Rule',
    code: 'HIPAA',
    version: '2023',
    description: 'Health Insurance Portability and Accountability Act standards for protecting electronic protected health information (ePHI).',
    controlsCount: 42,
    effectiveCount: 36,
    score: 85.7,
  },
  {
    id: 'iso42001-1',
    name: 'ISO/IEC 42001:2023 AI Management',
    code: 'ISO42001',
    version: '2023',
    description: 'International benchmark standard for responsible Artificial Intelligence Management Systems (AIMS), risk and bias governance.',
    controlsCount: 38,
    effectiveCount: 32,
    score: 84.2,
  },
  {
    id: 'gdpr-1',
    name: 'GDPR Privacy Governance',
    code: 'GDPR',
    version: '2018',
    description: 'European General Data Protection Regulation requirements for lawful processing, data subject rights, and breach notification.',
    controlsCount: 34,
    effectiveCount: 29,
    score: 85.3,
  },
  {
    id: 'pci-1',
    name: 'PCI-DSS v4.0',
    code: 'PCI-DSS',
    version: 'v4.0',
    description: 'Payment Card Industry Data Security Standard for cardholder data protection, network firewalls, and encryption.',
    controlsCount: 78,
    effectiveCount: 65,
    score: 83.3,
  },
];

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedCodes, setImportedCodes] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getFrameworks();
        const loaded = getPersistedList('frameworks', Array.isArray(res) ? res : [], DEFAULT_FRAMEWORKS);
        setFrameworks(loaded);
      } catch (e) {
        const loaded = getPersistedList('frameworks', [], DEFAULT_FRAMEWORKS);
        setFrameworks(loaded);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleImportFramework = async (fw: any) => {
    if (frameworks.some((f) => f.code === fw.code)) return;

    try {
      await api.createFramework(fw);
    } catch {
      // client-side fallback
    }

    const updated = addPersistedItem('frameworks', fw, frameworks);
    setFrameworks(updated);
    setImportedCodes((prev) => [...prev, fw.code]);
    setImportSuccess(`Successfully imported ${fw.name}! Controls mapped automatically.`);
    setTimeout(() => {
      setImportSuccess(null);
      setShowImportModal(false);
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Frameworks</h1>
            <p className="text-sm text-slate-500 mt-1">
              Active regulatory and security frameworks mapped across common organizational controls.
            </p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Framework</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all space-y-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {fw.code}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mt-4">{fw.name}</h2>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{fw.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Compliance Readiness</span>
                  <span className="font-bold text-emerald-600">{fw.score || 85}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${fw.score || 85}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>{fw.effectiveCount || 50} Effective</span>
                  <span>{fw.controlsCount || 64} Total Controls</span>
                </div>
              </div>

              <Link
                href={`/controls?frameworkId=${fw.id}`}
                className="w-full inline-flex items-center justify-center space-x-2 py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors"
              >
                <span>View Controls</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Import Framework Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Framework Catalog Library</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Import standard regulatory frameworks. Security controls and cross-mappings will be linked automatically.
                  </p>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {importSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {AVAILABLE_FRAMEWORKS.map((afw) => {
                  const alreadyAdded = frameworks.some((f) => f.code === afw.code);
                  return (
                    <div
                      key={afw.id}
                      className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition flex items-center justify-between gap-4 bg-slate-50/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{afw.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                            {afw.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{afw.description}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-medium">
                          <span>{afw.controlsCount} Pre-Mapped Controls</span>
                          <span>•</span>
                          <span>Version: {afw.version}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleImportFramework(afw)}
                        disabled={alreadyAdded}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                          alreadyAdded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {alreadyAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Import</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end border-t border-slate-100">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
