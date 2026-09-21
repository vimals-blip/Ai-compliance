'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, HelpCircle, User, ShieldCheck, ArrowRight, X, Compass, Sparkles } from 'lucide-react';



export const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [orgName, setOrgName] = useState('CloudSecure Enterprise');

  React.useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setOrgName(data.name);
        }
      } catch {
        // keep default
      }
    }
    loadOrg();
  }, []);

  const searchableIndex = [
    { title: 'CC6.1 Logical Access Security & Identity Management', type: 'Control', href: '/controls' },
    { title: 'CC6.6 Boundary Protection & Network Segmentation', type: 'Control', href: '/controls' },
    { title: 'CC7.2 Security Incident Detection & Monitoring', type: 'Control', href: '/controls' },
    { title: 'A.9.1.1 Access Control Policy Enforcement', type: 'Control', href: '/controls' },
    { title: 'PR.DS-1 Data-at-Rest Protection & Cryptography', type: 'Control', href: '/controls' },
    { title: 'Unencrypted S3 backup bucket in secondary region', type: 'Risk', href: '/risks' },
    { title: 'MFA not enforced for legacy staging VPN', type: 'Risk', href: '/risks' },
    { title: 'AWS_IAM_Password_Policy_Report_2026.pdf', type: 'Evidence', href: '/evidence' },
    { title: 'Information_Security_Policy_v3.2.docx', type: 'Policy', href: '/policies' },
    { title: 'Annual SOC 2 Type II Examination 2026', type: 'Audit', href: '/audits' },
    { title: 'SOC 2 Type II Pre-Audit Evidence Binder', type: 'Report', href: '/reports' },
  ];

  const results = searchTerm
    ? searchableIndex.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div id="tour-header-org" className="flex items-center space-x-4">
        <Link href="/dashboard" className="flex items-center space-x-2 text-slate-900 font-semibold text-lg tracking-tight">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span>{orgName}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">GRC Ops</span>
        </Link>
      </div>

      {/* Global Search with Live Dropdown */}
      <div id="tour-header-search" className="flex-1 max-w-md mx-8 relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search controls, risks, evidence, policies (Cmd+K)..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowResults(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {showResults && searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {results.length > 0 ? (
              results.map((r, i) => (
                <Link
                  key={i}
                  href={r.href}
                  onClick={() => setShowResults(false)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 text-xs transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{r.title}</p>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {r.type}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching controls, risks, or evidence found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Icons & Profile */}
      <div className="flex items-center space-x-2.5">
        <button
          id="tour-header-guide-btn"
          title="Interactive Tour of this Page's Insider Buttons"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('open-driverjs-tour'));
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-xs"
        >
          <Compass className="w-3.5 h-3.5 text-white animate-spin-slow" />
          <span className="hidden sm:inline">Page Guide</span>
        </button>

        <button
          title="Advance to Next Stage in Connected Multi-Tab Journey"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('open-full-journey-tour'));
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-xs border border-slate-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">Next Stage &rarr;</span>
        </button>
        <button
          title="Notifications"
          onClick={() => alert('All compliance continuous scanners active. Zero overdue items.')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1.5 right-1.5" />
        </button>
        <Link
          href="/docs"
          title="Product Guide & Architecture Documentation"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
        <div className="h-5 w-px bg-slate-200 mx-1" />
        <div className="flex items-center space-x-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">Alex Rivera</p>
            <p className="text-[11px] text-slate-500 leading-tight">Compliance Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
};
