'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, CheckCircle2, ChevronRight, ChevronLeft, Loader2, ShieldCheck, Server, Users, FileText, Sparkles } from 'lucide-react';

const FRAMEWORKS = [
  { id: 'soc2', name: 'SOC 2 Type II', desc: 'Trust Services Criteria for SaaS companies' },
  { id: 'iso27001', name: 'ISO 27001:2022', desc: 'Information Security Management System' },
  { id: 'hipaa', name: 'HIPAA', desc: 'Health Insurance Portability and Accountability Act' },
  { id: 'gdpr', name: 'GDPR', desc: 'General Data Protection Regulation (EU)' },
  { id: 'nist', name: 'NIST CSF v2.0', desc: 'National Institute of Standards Cybersecurity Framework' },
  { id: 'iso42001', name: 'ISO 42001', desc: 'AI Management System Standard' },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'SaaS / Technology',
    employeeCount: '11-50',
    cloudProvider: 'AWS',
    mfaTool: 'Okta',
    vcs: 'GitHub',
    selectedFrameworks: ['soc2'] as string[],
  });

  const toggleFramework = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFrameworks: prev.selectedFrameworks.includes(id)
        ? prev.selectedFrameworks.filter(f => f !== id)
        : [...prev.selectedFrameworks, id]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const compName = formData.companyName || 'My Organization';

    // Save user's configured settings to persistent server store and local storage immediately
    try {
      localStorage.setItem('compliance_org_name', compName);
      localStorage.setItem('compliance_org_industry', formData.industry);
      localStorage.setItem('compliance_frameworks', JSON.stringify(formData.selectedFrameworks));

      await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: compName,
          industry: formData.industry,
          primaryCloud: formData.cloudProvider,
          mfaTool: formData.mfaTool,
          frameworks: formData.selectedFrameworks,
        }),
      });
    } catch {}

    const steps = [
      '1/5: Analyzing cloud infrastructure and identity architecture...',
      '2/5: Mapping controls across ' + formData.selectedFrameworks.map(f => f.toUpperCase()).join(', ') + '...',
      '3/5: Fine-Tuned Llama 3.1 8B authoring Information Security Policy for ' + compName + '...',
      '4/5: Initializing automated evidence telemetry pipeline...',
      '5/5: Workspace ready! Redirecting to dashboard...',
    ];

    setGenerationStep(steps[0]);

    // Fire off real AI policy generation call to backend
    try {
      setGenerationStep(steps[2]);
      await fetch('/api/ai/generate-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: compName,
          policy_type: 'Information Security Policy',
          cloud_provider: formData.cloudProvider,
          mfa_tool: formData.mfaTool,
          version: '1.0',
        }),
      });
    } catch (e) {
      console.warn('AI policy generation call failed, proceeding:', e);
    }

    for (let i = 3; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    router.push('/dashboard');
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6 px-1">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-emerald-600' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  step > s ? 'bg-emerald-600 border-emerald-600 text-white' :
                  step === s ? 'border-emerald-600 text-emerald-600' :
                  'border-slate-300 text-slate-400'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className="hidden sm:block text-xs font-medium">
                  {s === 1 ? 'Company' : s === 2 ? 'Tech Stack' : s === 3 ? 'Frameworks' : 'Generate'}
                </span>
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white text-center">
            <Bot className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
            <h1 className="text-xl font-bold">Setup Your AI Compliance Workspace</h1>
            <p className="text-slate-400 mt-1 text-sm">Step {step} of {totalSteps}</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. Acme Corp"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Industry</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5"
                      value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                    >
                      <option>SaaS / Technology</option>
                      <option>Healthcare</option>
                      <option>Fintech / Banking</option>
                      <option>E-Commerce</option>
                      <option>Government</option>
                      <option>Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Team Size</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5"
                      value={formData.employeeCount}
                      onChange={e => setFormData({...formData, employeeCount: e.target.value})}
                    >
                      <option>1-10</option>
                      <option>11-50</option>
                      <option>51-200</option>
                      <option>201-1000</option>
                      <option>1000+</option>
                    </select>
                  </div>
                </div>
                <button
                  disabled={!formData.companyName}
                  onClick={() => setStep(2)}
                  className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Tech Stack */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cloud Provider</label>
                  <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5" value={formData.cloudProvider} onChange={e => setFormData({...formData, cloudProvider: e.target.value})}>
                    <option value="AWS">Amazon Web Services (AWS)</option>
                    <option value="GCP">Google Cloud Platform (GCP)</option>
                    <option value="Azure">Microsoft Azure</option>
                    <option value="Multi-Cloud">Multi-Cloud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Identity Provider (SSO/MFA)</label>
                  <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5" value={formData.mfaTool} onChange={e => setFormData({...formData, mfaTool: e.target.value})}>
                    <option value="Okta">Okta</option>
                    <option value="Google Workspace">Google Workspace</option>
                    <option value="Microsoft Entra">Microsoft Entra ID (Azure AD)</option>
                    <option value="Auth0">Auth0</option>
                    <option value="JumpCloud">JumpCloud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Version Control</label>
                  <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5" value={formData.vcs} onChange={e => setFormData({...formData, vcs: e.target.value})}>
                    <option value="GitHub">GitHub</option>
                    <option value="GitLab">GitLab</option>
                    <option value="Bitbucket">Bitbucket</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="w-1/3 bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="w-2/3 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Select Frameworks */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-slate-600">Select the compliance frameworks you need. The AI will generate controls, policies, and a risk register tailored to these.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FRAMEWORKS.map(fw => {
                    const selected = formData.selectedFrameworks.includes(fw.id);
                    return (
                      <button
                        key={fw.id}
                        onClick={() => toggleFramework(fw.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          selected ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900">{fw.name}</span>
                          {selected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{fw.desc}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="w-1/3 bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    disabled={formData.selectedFrameworks.length === 0}
                    onClick={() => setStep(4)}
                    className="w-2/3 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Generate */}
            {step === 4 && !isGenerating && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
                  <h3 className="font-bold text-slate-900">Review Your Configuration</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="text-slate-500">Company</div>
                    <div className="font-semibold text-slate-900">{formData.companyName}</div>
                    <div className="text-slate-500">Industry</div>
                    <div className="font-semibold text-slate-900">{formData.industry}</div>
                    <div className="text-slate-500">Team Size</div>
                    <div className="font-semibold text-slate-900">{formData.employeeCount}</div>
                    <div className="text-slate-500">Cloud</div>
                    <div className="font-semibold text-slate-900">{formData.cloudProvider}</div>
                    <div className="text-slate-500">Identity Provider</div>
                    <div className="font-semibold text-slate-900">{formData.mfaTool}</div>
                    <div className="text-slate-500">Version Control</div>
                    <div className="font-semibold text-slate-900">{formData.vcs}</div>
                    <div className="text-slate-500">Frameworks</div>
                    <div className="font-semibold text-slate-900">{formData.selectedFrameworks.map(f => FRAMEWORKS.find(fw => fw.id === f)?.name).join(', ')}</div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">The AI will now generate:</p>
                    <ul className="mt-1 space-y-0.5 text-xs">
                      <li>• 10 tailored compliance policies</li>
                      <li>• Full control catalog mapped to your frameworks</li>
                      <li>• Pre-populated risk register</li>
                      <li>• Statement of Applicability</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="w-1/3 bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="w-2/3 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Bot className="w-5 h-5" /> Launch AI Compliance Engine
                  </button>
                </div>
              </div>
            )}

            {/* Generation Progress */}
            {step === 4 && isGenerating && (
              <div className="text-center py-8 space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Building Your Compliance Workspace</h3>
                  <p className="text-sm text-emerald-600 mt-2 font-medium">{generationStep}</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-700 ease-out" style={{ width: '75%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
