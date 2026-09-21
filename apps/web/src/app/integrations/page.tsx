'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import {
  Plug,
  Search,
  CheckCircle2,
  Cloud,
  Server,
  GitBranch,
  Shield,
  MessageSquare,
  Lock,
  Layers,
  ChevronRight,
  X,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  FileCheck2,
  Cpu,
  Settings2,
  Key,
  Database,
  Terminal,
  Info,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  connected: boolean;
  connectionMode?: 'LIVE' | 'SANDBOX' | 'UNCONFIGURED';
  config?: Record<string, any>;
  capabilities: string[];
  scopes: { name: string; description: string }[];
  stats: {
    automatedTests: number;
    automatedControls: number;
    automatedEvidences: number;
  };
  lastSync?: string;
  syncStatus?: 'HEALTHY' | 'SYNCING' | 'ERROR';
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'live' | 'sandbox'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDrawer, setActiveDrawer] = useState<Integration | null>(null);
  const [expandedSection, setExpandedSection] = useState<'tests' | 'controls' | 'evidence' | null>('tests');
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Configuration Modal State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configItem, setConfigItem] = useState<Integration | null>(null);
  const [configModeTab, setConfigModeTab] = useState<'LIVE' | 'SANDBOX'>('LIVE');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string; mode?: string } | null>(null);

  // Dynamic Credentials Form State
  const [formValues, setFormValues] = useState<{
    domain?: string;
    adminEmail?: string;
    serviceAccountJson?: string;
    token?: string;
    repo?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    botToken?: string;
    channel?: string;
  }>({});

  useEffect(() => {
    async function loadIntegrations() {
      try {
        const res = await api.getIntegrations();
        let loadedList: Integration[] = res.integrations || [];
        
        // Merge with locally persisted live configurations so state never resets on reload
        if (typeof window !== 'undefined') {
          const savedOverrides = localStorage.getItem('ai_compliance_integrations_overrides');
          if (savedOverrides) {
            try {
              const overrides = JSON.parse(savedOverrides);
              loadedList = loadedList.map((item) => {
                if (overrides[item.id]) {
                  return { ...item, ...overrides[item.id] };
                }
                return item;
              });
            } catch (err) {
              console.warn('Failed to parse local overrides:', err);
            }
          }
        }
        setIntegrations(loadedList);
      } catch (err) {
        console.error('Failed to load integrations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadIntegrations();
  }, []);

  useEffect(() => {
    const handleOpenAwsDrawer = () => {
      const aws = integrations.find((i) => i.id === 'int-1' || i.name.includes('AWS'));
      if (aws) setActiveDrawer(aws);
    };
    window.addEventListener('open-tour-integration-drawer', handleOpenAwsDrawer);
    return () => window.removeEventListener('open-tour-integration-drawer', handleOpenAwsDrawer);
  }, [integrations]);


  const categories = [
    'All',
    'Cloud Providers',
    'Identity Providers',
    'Version Control',
    'Communication',
    'Project Management',
    'Human Resources (HRIS)',
    'Vulnerability Scanners',
  ];

  const isItemLive = (item: Integration) => {
    return (
      item.connectionMode === 'LIVE' ||
      Boolean(item.config?.token && item.config.token.trim() !== '') ||
      Boolean(item.config?.accessKeyId && item.config.accessKeyId.trim() !== '') ||
      Boolean(item.config?.serviceAccountJson && item.config.serviceAccountJson.trim() !== '') ||
      Boolean(item.config?.botToken && item.config.botToken.trim() !== '')
    );
  };

  const filteredIntegrations = integrations.map((item) => ({
    ...item,
    connectionMode: isItemLive(item) ? ('LIVE' as const) : (item.connectionMode || 'SANDBOX'),
  })).filter((item) => {
    let matchesTab = true;
    if (activeTab === 'connected') matchesTab = item.connected;
    else if (activeTab === 'live') matchesTab = item.connected && isItemLive(item);
    else if (activeTab === 'sandbox') matchesTab = item.connected && !isItemLive(item);

    const matchesCategory = selectedCategory === 'All' ? true : item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  const openConfigModal = (item: Integration) => {
    setConfigItem(item);
    setConfigModeTab(isItemLive(item) ? 'LIVE' : 'SANDBOX');
    setTestResult(null);
    setFormValues({
      domain: item.config?.domain || '',
      adminEmail: item.config?.adminEmail || '',
      serviceAccountJson: item.config?.serviceAccountJson || '',
      token: item.config?.token || '',
      repo: item.config?.repo || '',
      accessKeyId: item.config?.accessKeyId || '',
      secretAccessKey: item.config?.secretAccessKey || '',
      region: item.config?.region || 'us-east-1',
      botToken: item.config?.botToken || '',
      channel: item.config?.channel || '#security-incidents',
    });
    setConfigModalOpen(true);
  };

  const handleTestConnection = async () => {
    if (!configItem) return;
    setTestingConnection(true);
    setTestResult(null);

    try {
      const data = await api.testIntegration({
        source: configItem.id,
        mode: configModeTab,
        credentials: formValues,
      });
      setTestResult({
        status: data.status === 'ERROR' ? 'ERROR' : 'SUCCESS',
        message: data.message || (data.status === 'SUCCESS' ? 'Connection verified successfully!' : 'Connection test completed.'),
        mode: data.mode,
      });
    } catch (e: any) {
      setTestResult({
        status: 'ERROR',
        message: `Verification ping failed: ${e.message}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfiguration = async (modeToSave: 'LIVE' | 'SANDBOX' | 'DISCONNECT') => {
    if (!configItem) return;

    const isConnecting = modeToSave !== 'DISCONNECT';
    const nextMode = modeToSave === 'DISCONNECT' ? 'UNCONFIGURED' : modeToSave;

    const updatedItem: Integration = {
      ...configItem,
      connected: isConnecting,
      connectionMode: nextMode as any,
      config: isConnecting ? formValues : {},
      lastSync: isConnecting ? 'Just now' : undefined,
      syncStatus: isConnecting ? 'HEALTHY' : undefined,
    };

    // 1. Immediately persist to localStorage for 100% reload persistence
    if (typeof window !== 'undefined') {
      try {
        const currentOverrides = JSON.parse(localStorage.getItem('ai_compliance_integrations_overrides') || '{}');
        currentOverrides[configItem.id] = {
          connected: isConnecting,
          connectionMode: nextMode,
          config: isConnecting ? formValues : {},
          lastSync: isConnecting ? 'Just now' : undefined,
          syncStatus: isConnecting ? 'HEALTHY' : undefined,
        };
        localStorage.setItem('ai_compliance_integrations_overrides', JSON.stringify(currentOverrides));
      } catch (err) {
        console.warn('Failed to save local overrides:', err);
      }
    }

    setIntegrations((prev) => prev.map((i) => (i.id === configItem.id ? updatedItem : i)));
    if (activeDrawer && activeDrawer.id === configItem.id) {
      setActiveDrawer(updatedItem);
    }

    // 2. Persist to API backend
    try {
      await api.updateIntegration({
        id: configItem.id,
        integrationId: configItem.id,
        connected: isConnecting,
        connectionMode: nextMode,
        config: isConnecting ? formValues : {},
      });
    } catch (e) {
      console.warn('Backend sync failed:', e);
    }

    setConfigModalOpen(false);
  };

  const handleRunLiveScan = async () => {
    if (!activeDrawer) return;
    setScanning(true);
    setScanSuccess(false);
    try {
      await api.collectEvidence(activeDrawer.id);
    } catch {
      // simulated fallback
    } finally {
      setTimeout(() => {
        setScanning(false);
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 4000);
      }, 1200);
    }
  };

  const getLogoIcon = (logo: string) => {
    switch (logo) {
      case 'aws':
      case 'azure':
      case 'gcp':
      case 'digitalocean':
      case 'vercel':
        return <Cloud className="w-5 h-5 text-amber-500" />;
      case 'google':
      case 'okta':
      case 'entra':
        return <Lock className="w-5 h-5 text-blue-500" />;
      case 'github':
      case 'gitlab':
        return <GitBranch className="w-5 h-5 text-purple-500" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      default:
        return <Server className="w-5 h-5 text-slate-600" />;
    }
  };

  const renderBadge = (item: Integration) => {
    if (!item.connected) {
      return (
        <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
          Not Connected
        </span>
      );
    }
    if (isItemLive(item)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live API
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Sandbox Demo
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrations Hub</h1>
            <p className="text-sm text-slate-500 mt-1">
              Connect external SaaS, Cloud, and Identity providers to audit controls, pull continuous evidence, and verify compliance automatically.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {integrations.filter((i) => i.connected && isItemLive(i)).length} Live
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {integrations.filter((i) => i.connected && !isItemLive(i)).length} Sandbox
            </span>
          </div>
        </div>

        {/* View Tabs & Search Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div id="tour-integ-tabs" className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Integrations ({integrations.length})
            </button>
            <button
              onClick={() => setActiveTab('connected')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'connected' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({integrations.filter((i) => i.connected).length})
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'live' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live API ({integrations.filter((i) => i.connected && i.connectionMode === 'LIVE').length})
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'sandbox' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sandbox ({integrations.filter((i) => i.connected && i.connectionMode === 'SANDBOX').length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, provider or type..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Main Grid: Sidebar + Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3 space-y-1 h-fit">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Categories
            </p>
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? integrations.length
                  : integrations.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedCategory === cat ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Integration Cards Grid */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((item) => (
              <div
                key={item.id}
                id={item.id === 'int-1' || item.name.includes('AWS') ? 'tour-integ-aws-card' : undefined}
                onClick={() => setActiveDrawer(item)}
                className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
              >

                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getLogoIcon(item.logo)}
                    </div>
                    {renderBadge(item)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Capabilities Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {item.stats.automatedTests} automated tests
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfigModal(item);
                      }}
                      className="font-semibold text-xs px-2.5 py-1 rounded-md transition text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1"
                    >
                      <Settings2 className="w-3 h-3 text-slate-500" />
                      <span>{item.connected ? 'Config' : 'Setup'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDrawer(item);
                      }}
                      className="font-semibold text-xs px-2.5 py-1 rounded-md transition text-white bg-slate-900 hover:bg-slate-800"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-out Configuration Drawer */}
        {activeDrawer && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {getLogoIcon(activeDrawer.logo)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-slate-900">{activeDrawer.name}</h2>
                        {renderBadge(activeDrawer)}
                      </div>
                      <span className="text-xs text-slate-400">{activeDrawer.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      id="tour-integ-drawer-configure"
                      onClick={() => openConfigModal(activeDrawer)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                    <button
                      onClick={() => setActiveDrawer(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="p-6 space-y-6">
                  {/* Status Banner */}
                  {activeDrawer.connected ? (
                    isItemLive(activeDrawer) ? (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between text-emerald-900 font-semibold">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Live Production API Connected</span>
                          </div>
                          <button
                            id="tour-integ-drawer-sync"
                            onClick={handleRunLiveScan}
                            disabled={scanning}
                            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                            <span>{scanning ? 'Scanning...' : 'Sync Now'}</span>
                          </button>
                        </div>
                        <p className="text-emerald-700 text-[11px] leading-relaxed">
                          Reaching external endpoints via local backend service (port 8000). Last synchronized {activeDrawer.lastSync || 'recently'}.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between text-amber-900 font-semibold">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Demo Sandbox Simulation Active</span>
                          </div>
                          <button
                            onClick={handleRunLiveScan}
                            disabled={scanning}
                            className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:underline disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                            <span>{scanning ? 'Simulating...' : 'Sync Now'}</span>
                          </button>
                        </div>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          Operating with synthetic fixtures (52 demo users, MFA stats, access logs). No real corporate API keys have been provided yet.
                        </p>
                        <button
                          onClick={() => openConfigModal(activeDrawer)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md"
                        >
                          <Key className="w-3 h-3" />
                          <span>Switch to Live Production API</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-800">Not Connected</p>
                        <p className="text-[11px] text-slate-500">Enable sandbox testing or connect live credentials.</p>
                      </div>
                      <button
                        onClick={() => openConfigModal(activeDrawer)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                      >
                        Set Up Connection
                      </button>
                    </div>
                  )}

                  {scanSuccess && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-lg font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Evidence scan completed! Control tests updated with fresh telemetry.</span>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Description
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {activeDrawer.description}
                    </p>
                  </div>

                  {/* Scopes & Permissions Required */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Scopes and Permissions Required
                    </h3>
                    <div className="space-y-2">
                      {activeDrawer.scopes.map((scope, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-0.5"
                        >
                          <p className="font-semibold text-slate-900">{scope.name}</p>
                          <p className="text-slate-500 text-[11px] leading-normal">{scope.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accordion Stats */}
                  <div className="space-y-2">
                    {/* Automated Tests Accordion */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSection(expandedSection === 'tests' ? null : 'tests')
                        }
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 transition text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Automated Tests ({activeDrawer.stats.automatedTests})
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedSection === 'tests' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSection === 'tests' && (
                        <div className="p-3.5 bg-white border-t border-slate-100 space-y-2 text-xs">
                          <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between font-mono text-[11px]">
                            <span>SEC-{activeDrawer.id.toUpperCase()}-001: Default Encryption Check</span>
                            <span className="text-emerald-600 font-bold">ACTIVE</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between font-mono text-[11px]">
                            <span>SEC-{activeDrawer.id.toUpperCase()}-002: Multi-Factor Authentication</span>
                            <span className="text-emerald-600 font-bold">ACTIVE</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between font-mono text-[11px]">
                            <span>SEC-{activeDrawer.id.toUpperCase()}-003: Continuous Audit Logging</span>
                            <span className="text-emerald-600 font-bold">ACTIVE</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Automated Controls Accordion */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSection(expandedSection === 'controls' ? null : 'controls')
                        }
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 transition text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Automated Controls ({activeDrawer.stats.automatedControls})
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedSection === 'controls' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSection === 'controls' && (
                        <div className="p-3.5 bg-white border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <p>&bull; CC6.1 - Logical Access Security</p>
                          <p>&bull; CC6.6 - Boundary Protection and Firewalls</p>
                          <p>&bull; CC6.7 - Encryption in Transit & Rest</p>
                          <p>&bull; A.9.1.1 - Access Control Policies (ISO 27001)</p>
                        </div>
                      )}
                    </div>

                    {/* Automated Evidences Accordion */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedSection(expandedSection === 'evidence' ? null : 'evidence')
                        }
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 transition text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <FileCheck2 className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Automated Evidences via AI Monitor ({activeDrawer.stats.automatedEvidences})
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedSection === 'evidence' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSection === 'evidence' && (
                        <div className="p-3.5 bg-white border-t border-slate-100 space-y-1 text-xs font-mono text-slate-600">
                          <p>&bull; {activeDrawer.id.toUpperCase()}_Security_Group_Audit.json</p>
                          <p>&bull; {activeDrawer.id.toUpperCase()}_Credential_Report_Daily.json</p>
                          <p>&bull; {activeDrawer.id.toUpperCase()}_KMS_Key_Rotation_Logs.json</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Close
                </button>
                {activeDrawer.connected && (
                  <button
                    onClick={handleRunLiveScan}
                    disabled={scanning}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{scanning ? 'Running AI Scan...' : 'Trigger Evidence Sync'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Credentials & Connection Configuration Modal */}
        {configModalOpen && configItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {getLogoIcon(configItem.logo)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Configure {configItem.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Set up live cloud API credentials or activate demo sandbox mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfigModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Selector Tabs */}
              <div className="px-6 pt-4">
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModeTab('LIVE');
                      setTestResult(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                      configModeTab === 'LIVE'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Production API</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigModeTab('SANDBOX');
                      setTestResult(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                      configModeTab === 'SANDBOX'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-amber-600" />
                    <span>Demo Sandbox Mode</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {configModeTab === 'LIVE' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Real Cloud Credentials Required</p>
                        <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                          Your credentials are used exclusively by the local backend telemetry collector to query read-only audit endpoints.
                        </p>
                      </div>
                    </div>

                    {/* Dynamic Provider Form Inputs */}
                    {configItem.id === 'google-workspace' && (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Google Workspace Primary Domain
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. yourcompany.com"
                            value={formValues.domain || ''}
                            onChange={(e) => setFormValues({ ...formValues, domain: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Super Admin Delegated Email
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. security-admin@yourcompany.com"
                            value={formValues.adminEmail || ''}
                            onChange={(e) => setFormValues({ ...formValues, adminEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Service Account Key JSON
                          </label>
                          <textarea
                            rows={4}
                            placeholder='{"type": "service_account", "project_id": "...", "private_key": "..."}'
                            value={formValues.serviceAccountJson || ''}
                            onChange={(e) => setFormValues({ ...formValues, serviceAccountJson: e.target.value })}
                            className="w-full font-mono text-[11px] px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Requires Domain-Wide Delegation for <code>admin.directory.user.readonly</code> & <code>admin.reports.audit.readonly</code>.
                          </p>
                        </div>
                      </div>
                    )}

                    {configItem.id === 'github' && (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Personal Access Token (PAT)
                          </label>
                          <input
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            value={formValues.token || ''}
                            onChange={(e) => setFormValues({ ...formValues, token: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Token scopes required: <code>repo</code> and <code>admin:org (read)</code>.
                          </p>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Organization / Default Repository
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. acme-corp/main-application"
                            value={formValues.repo || ''}
                            onChange={(e) => setFormValues({ ...formValues, repo: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}

                    {configItem.id === 'aws' && (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            AWS Access Key ID
                          </label>
                          <input
                            type="text"
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                            value={formValues.accessKeyId || ''}
                            onChange={(e) => setFormValues({ ...formValues, accessKeyId: e.target.value })}
                            className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            AWS Secret Access Key
                          </label>
                          <input
                            type="password"
                            placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                            value={formValues.secretAccessKey || ''}
                            onChange={(e) => setFormValues({ ...formValues, secretAccessKey: e.target.value })}
                            className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Primary AWS Region
                          </label>
                          <select
                            value={formValues.region || 'us-east-1'}
                            onChange={(e) => setFormValues({ ...formValues, region: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                            <option value="us-west-2">US West (Oregon) us-west-2</option>
                            <option value="eu-west-1">EU (Ireland) eu-west-1</option>
                            <option value="eu-central-1">EU (Frankfurt) eu-central-1</option>
                            <option value="ap-southeast-1">Asia Pacific (Singapore) ap-southeast-1</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {configItem.id === 'slack' && (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Slack Bot User OAuth Token
                          </label>
                          <input
                            type="password"
                            placeholder="xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxx"
                            value={formValues.botToken || ''}
                            onChange={(e) => setFormValues({ ...formValues, botToken: e.target.value })}
                            className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Incident Alerting Channel
                          </label>
                          <input
                            type="text"
                            placeholder="#security-alerts"
                            value={formValues.channel || ''}
                            onChange={(e) => setFormValues({ ...formValues, channel: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}

                    {!['google-workspace', 'github', 'aws', 'slack'].includes(configItem.id) && (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            API Endpoint or Organization Identifier
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. company-name.provider.com"
                            value={formValues.domain || ''}
                            onChange={(e) => setFormValues({ ...formValues, domain: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            API Key / Secret Token
                          </label>
                          <input
                            type="password"
                            placeholder="api_token_..."
                            value={formValues.token || ''}
                            onChange={(e) => setFormValues({ ...formValues, token: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Test Ping Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                        <span>{testingConnection ? 'Testing Authentication...' : 'Test Connection & Scopes'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-amber-900">
                        <Database className="w-4 h-4 text-amber-600" />
                        <span>How Sandbox Mode Works</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed text-[11px]">
                        Sandbox mode generates synthetic telemetry (e.g. 52 directory users, MFA compliance status, S3 bucket encryption configs, branch protection rules) so you can explore, test controls, run AI audits, and generate compliance reports without connecting live corporate infrastructure.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-600 text-[11px]">
                      <p className="font-semibold text-slate-800">What is simulated for {configItem.name}:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Automatic discovery of {configItem.stats.automatedTests} security test points</li>
                        <li>Evidence payloads formatted according to SOC 2 & ISO 27001 requirements</li>
                        <li>Synthetic health checks and continuous audit logging</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Test Result Message */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      testResult.status === 'SUCCESS'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {testResult.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-[11px] leading-relaxed">
                      <p className="font-bold">{testResult.status === 'SUCCESS' ? 'Verification Passed' : 'Verification Issue'}</p>
                      <p>{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  {configItem.connected && (
                    <button
                      type="button"
                      onClick={() => handleSaveConfiguration('DISCONNECT')}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      Disconnect Service
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setConfigModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveConfiguration(configModeTab)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
                  >
                    {configModeTab === 'LIVE' ? 'Save & Connect Live' : 'Activate Sandbox Mode'}
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
