import Link from 'next/link';
import { ShieldCheck, Server, Cpu, ArrowRight, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-lg tracking-tight">AI-Compliance</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-emerald-600 py-2">Product Guide & Docs</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Sign In</Link>
            <Link href="/onboarding" className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-8">
            <Cpu className="w-4 h-4" /> Open-Source AI Native
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Compliance, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">fully automated.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto mb-10">
            Don't pay human consultants to copy-paste policies. Our Open-Source LLM engine integrates with your AWS & GitHub to write policies, detect gaps, and export auditor-ready evidence—autonomously.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all">
              Start Autonomous Audit <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all">
              View Demo Dashboard
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all">
              Product Guide & Flows
            </Link>
          </div>
        </div>

        {/* Comparison Section (Vs Probo) */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Why AI-Compliance beats traditional platforms</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-emerald-600">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">100% Open Source Models</h3>
                <p className="text-slate-600">Train your own HuggingFace Llama 3 models. Keep your sensitive SOC 2 data completely private, with no vendor lock-in to OpenAI or Anthropic.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-emerald-600">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Generative Policy Engine</h3>
                <p className="text-slate-600">Unlike legacy platforms that give you generic PDF templates, our AI dynamically writes auditor-ready policies tailored precisely to your tech stack.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-emerald-600">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Auto-Remediation</h3>
                <p className="text-slate-600">We don't just find gaps. Our AI integrates with AWS and GitHub to generate the exact Terraform or CLI scripts needed to fix compliance failures instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
