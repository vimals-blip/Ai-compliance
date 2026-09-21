'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const DriverTour: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // ─── 1. CURRENT PAGE INSIDER BUTTON TOUR ───
  const startPageTour = useCallback(() => {
    let steps: DriveStep[] = [];

    if (pathname === '/export') {
      steps = [
        {
          element: '#tour-export-evidence',
          popover: {
            title: '1️⃣ Step 1: Collect Live Evidence',
            description:
              'Click "Collect All" to pull cryptographic JSON configuration evidence from connected AWS, GitHub, Google Workspace, and Slack APIs.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-export-contents',
          popover: {
            title: '2️⃣ Step 2: Review 18 Bundled Artifacts',
            description:
              'Verify all 10 AI-authored policies, evidence files, and the cryptographic MANIFEST.json before packaging.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#tour-export-generate-btn',
          popover: {
            title: '3️⃣ Step 3: 1-Click Generate & Download ZIP',
            description:
              'Click this button to compile and download the complete auditor-sealed .ZIP package ready for CPA examination sign-off.',
            side: 'top',
            align: 'center',
          },
        },
      ];
    } else if (pathname === '/integrations') {
      steps = [
        {
          element: '#tour-integ-tabs',
          popover: {
            title: '🔌 Mode Switcher (Live API vs Sandbox)',
            description:
              'Toggle between Live Production API collectors and Sandbox testing modes to safely simulate telemetry collection.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-integ-aws-card',
          popover: {
            title: '☁️ AWS Cloud Telemetry Collector Card',
            description:
              'Click to open the configuration drawer. Connect IAM credentials to continuously harvest S3 encryption, IAM MFA status, and KMS keys 24/7.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-integ-drawer-configure',
          popover: {
            title: '⚙️ Internal Action: Configure Credentials',
            description:
              'Click "Configure" to enter AWS Access Keys or IAM Role ARNs for authenticated cloud telemetry.',
            side: 'left',
            align: 'center',
          },
        },
        {
          element: '#tour-integ-drawer-sync',
          popover: {
            title: '🔄 Internal Action: Sync Now (Live Scan)',
            description:
              'Click "Sync Now" to trigger an instant on-demand telemetry scan. Fresh data feeds directly into Automated Tests and Evidence Repository.',
            side: 'left',
            align: 'center',
          },
        },
      ];
    } else if (pathname === '/tests') {
      steps = [
        {
          element: '#tour-tests-filters',
          popover: {
            title: '🔍 Filter Controls by Source & Status',
            description:
              'Filter through 150+ continuous tests by Source (AWS, GitHub, Google) or Status (FAIL, PASS, WARN).',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-tests-table',
          popover: {
            title: '🛡️ Continuous Automated Tests Ledger',
            description:
              'Continuous scanners test 150+ controls daily. When a control fails, click any row to inspect defects.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-tests-drawer-tabs',
          popover: {
            title: '📑 Internal Drawer: Inspection Findings vs IaC Remediation',
            description:
              'Switch between Live Inspection Findings terminal logs, synthesized AI Terraform code, and AWS CLI fix scripts.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-tests-apply-fix',
          popover: {
            title: '⚡ Internal Action: Apply AI Remediation',
            description:
              'Click "Apply AI Remediation" to automatically deploy the Terraform fix, re-scan the cloud resource, and turn the test green (PASS)!',
            side: 'left',
            align: 'center',
          },
        },
      ];
    } else if (pathname === '/policies') {
      steps = [
        {
          element: '#tour-policy-autowrite-btn',
          popover: {
            title: '✨ 1-Click AI Auto-Write Missing Policies',
            description:
              'Click this button to generate auditor-approved security policies in seconds using local fine-tuned Llama 3.1 mapped to SOC 2 & ISO 27001.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-policy-upload-btn',
          popover: {
            title: '📁 Upload Corporate Policy Document',
            description:
              'Upload your existing company PDFs, DOCX, or Markdown files with versioning and cryptographic SHA-256 attestation.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-policy-metrics',
          popover: {
            title: '📊 Policy Approval Pipeline',
            description:
              'Track policies as they move through: Not Uploaded → Draft → Needs Review → Approved → Published.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-policy-table',
          popover: {
            title: '📜 Policies Management Ledger',
            description:
              'Click any policy row to open the live editor, inspect clauses, approve policies, and export official Scrut-styled PDF letterheads.',
            side: 'top',
            align: 'center',
          },
        },
      ];
    } else if (pathname === '/evidence') {
      steps = [
        {
          element: '#tour-ev-autocollect',
          popover: {
            title: '🔄 Continuous Compliance: Auto-Collect Evidence',
            description:
              'Click "Pull from GitHub" or "Pull from AWS" to harvest signed, timestamped configuration evidence directly into your repository.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-ev-upload-btn',
          popover: {
            title: '📎 Upload Evidence Artifact',
            description:
              'Upload third-party penetration test reports, SOC 2 vendor reviews, and disaster recovery sign-offs.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-ev-gap-btn',
          popover: {
            title: '🧠 Run AI Gap Analysis (RAG Verification)',
            description:
              'Click to run automated pgvector RAG gap analysis against SOC 2 CC6.1 criteria, extract citations, and verify control compliance.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-ev-download-btn',
          popover: {
            title: '📥 Download Authentic PDF Evidence Artifact',
            description:
              'Download cryptographically sealed PDF proof files ready for submission to external auditors.',
            side: 'left',
            align: 'center',
          },
        },
      ];
    } else if (pathname === '/audits') {
      steps = [
        {
          element: '#tour-audit-create-btn',
          popover: {
            title: '➕ Create New Scheduled Audit',
            description:
              'Schedule a formal compliance audit with external CPA firms (SOC 2 Type II, ISO 27001 Stage 2, NIST CSF) and define observation windows.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-audit-readiness-card',
          popover: {
            title: '📊 Audit Readiness Posture (98%)',
            description:
              'Live readiness breakdown showing: Policies (97%), Automated Tests (100%), and Evidences (100%).',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '#tour-audit-ca-btn',
          popover: {
            title: '⚠️ Corrective Action & Non-Conformity Tracker',
            description:
              'Log non-conformities identified during audit examinations, assign remediation owners, and track due dates.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-audit-export-pdf-btn',
          popover: {
            title: '📄 Export Formal CPA Dossier (.PDF)',
            description:
              'Download the official branded executive audit dossier PDF containing attestation metrics, control evaluations, and corrective action logs.',
            side: 'bottom',
            align: 'center',
          },
        },
      ];
    } else {
      // Dashboard Default Overview
      steps = [
        {
          element: '#tour-header-org',
          popover: {
            title: '🛡️ CloudSecure Enterprise GRC',
            description:
              'Welcome! This platform automates your entire compliance lifecycle from initial setup to final 1-click auditor ZIP package export.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-header-search',
          popover: {
            title: '🔍 Global Cross-Framework Search',
            description:
              'Instant search across controls (SOC 2 CC6.1, ISO A.9), enterprise risks, uploaded evidence files, and generated policies.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-sidebar-ai-engine',
          popover: {
            title: '⚡ pgvector AI Compliance Engine',
            description:
              'Powered by fine-tuned LLMs & pgvector embeddings to auto-write policies, evaluate evidence gaps, and synthesize 1-click Terraform remediations.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-dashboard-progress',
          popover: {
            title: '📊 Overall Audit Readiness Score',
            description:
              'Real-time weighted compliance score across active frameworks. Dynamically tracks compliant controls (88.5%) vs non-compliant gaps (11.5%).',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-dashboard-meters',
          popover: {
            title: '📈 3 Core Pillars Sub-Meters',
            description:
              'Monitor progress across: 1) Approved Policies (100%), 2) Cryptographic Evidence (84%), and 3) Automated Tests Passing Rate (92%).',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tour-dashboard-jobs',
          popover: {
            title: '🎯 Actionable Remediation Queue (Issue Generator)',
            description:
              'When tests fail or policies need review, issues are logged here automatically with severity ratings and compliance criteria.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '#tour-dash-resolve-btn',
          popover: {
            title: '⚡ 1-Click Interactive Resolution',
            description:
              'Click "Resolve" to automatically apply remediation fixes, re-test the control, mark the issue closed, and boost your compliance score!',
            side: 'left',
            align: 'center',
          },
        },
        {
          element: '#tour-sidebar-nav',
          popover: {
            title: '🗺️ Complete 7-Stage Compliance Workflow',
            description:
              'Navigate step-by-step through Integrations → Automated Tests → Policies → Evidence → Risks → Audit Center → ZIP Export.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-dash-export-banner',
          popover: {
            title: '📦 Final Milestone: 1-Click Auditor ZIP Package Export',
            description:
              'When readiness exceeds 80%, export the complete sealed 18-artifact CPA package (.ZIP) ready for external auditor sign-off!',
            side: 'top',
            align: 'center',
          },
        },
      ];
    }

    const validSteps = steps.filter((s) => {
      if (typeof s.element === 'string') {
        return !!document.querySelector(s.element);
      }
      return true;
    });

    const driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: '#0f172a',
      overlayOpacity: 0.72,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: 'driverjs-compliance-theme',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      progressText: '{{current}} of {{total}}',
      steps: validSteps.length > 0 ? validSteps : steps,
      onDestroyStarted: () => {
        localStorage.setItem('ai_compliance_driver_tour_done', 'true');
        driverInstance.destroy();
      },
    });

    driverInstance.drive();
  }, [pathname]);

  // ─── 2. FULL LINKED CROSS-TAB JOURNEY ORCHESTRATOR ───
  const startFullJourney = useCallback(() => {
    // Navigate stage by stage across linked tabs
    const sequence = [
      { route: '/dashboard', label: 'Dashboard & Readiness' },
      { route: '/integrations', label: 'Cloud Integrations' },
      { route: '/tests', label: 'Continuous Automated Tests' },
      { route: '/policies', label: 'Autonomous Policy Center' },
      { route: '/evidence', label: 'Evidence Repository & RAG' },
      { route: '/audits', label: 'Audit Center & Observations' },
      { route: '/export', label: '1-Click Auditor ZIP Export' },
    ];

    const currentIndex = sequence.findIndex((s) => s.route === pathname);
    if (currentIndex < sequence.length - 1) {
      const nextStage = sequence[currentIndex + 1];
      router.push(nextStage.route);
      setTimeout(() => {
        startPageTour();
      }, 500);
    } else {
      router.push('/dashboard');
      setTimeout(() => {
        startPageTour();
      }, 500);
    }
  }, [pathname, router, startPageTour]);

  // Automatic First-Time Onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem('ai_compliance_driver_tour_done');
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        startPageTour();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [startPageTour]);

  // Listeners for triggers from Header
  useEffect(() => {
    const handleTriggerPageTour = () => startPageTour();
    const handleTriggerFullJourney = () => startFullJourney();

    window.addEventListener('open-driverjs-tour', handleTriggerPageTour);
    window.addEventListener('open-full-journey-tour', handleTriggerFullJourney);

    return () => {
      window.removeEventListener('open-driverjs-tour', handleTriggerPageTour);
      window.removeEventListener('open-full-journey-tour', handleTriggerFullJourney);
    };
  }, [startPageTour, startFullJourney]);

  return null;
};
