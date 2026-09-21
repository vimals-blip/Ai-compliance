'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldAlert,
  SlidersHorizontal,
  FileCheck,
  FileText,
  Paperclip,
  BarChart3,
  Layers,
  Settings,
  Sparkles,
  Cpu,
  Plug,
  BookOpen,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Automated Tests', href: '/tests', icon: Cpu },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Controls', href: '/controls', icon: SlidersHorizontal },
  { name: 'Risks', href: '/risks', icon: ShieldAlert },
  { name: 'Audit Center', href: '/audits', icon: FileCheck },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Evidence', href: '/evidence', icon: Paperclip },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Frameworks', href: '/frameworks', icon: Layers },
  { name: 'Export to Auditor', href: '/export', icon: FileText },
  { name: 'Product Guide & Docs', href: '/docs', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div id="tour-sidebar-ai-engine" className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">AI Compliance Engine</p>
            <p className="text-[11px] text-emerald-400">Active &bull; pgvector RAG</p>
          </div>
        </div>

        <nav id="tour-sidebar-nav" className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const navId = `tour-nav-${item.href.replace('/', '') || 'dashboard'}`;
            return (
              <Link
                key={item.name}
                id={navId}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          <p className="font-medium text-slate-400">AI-Compliance V1</p>
          <p className="text-[11px] mt-0.5">SOC2 &bull; ISO 27001 &bull; NIST CSF</p>
        </div>
      </div>
    </aside>
  );
};
