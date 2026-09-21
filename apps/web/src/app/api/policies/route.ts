import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const INITIAL_POLICIES = [
  {
    id: 'p-1',
    title: 'Information Security (IS) Policy',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    approver: 'Security Steering Committee',
    department: 'GOV',
    version: 'v3.2',
    recurrence: 'Annually',
    entities: 'Organization Wide',
    updatedAt: '2026-09-10',
    requirement: "Establishes the organization's formal commitment to protecting information assets from unauthorized access, loss, or alteration across all departments.",
    content: `# Information Security Policy\n**Version:** 3.2 | **Status:** Published | **Framework:** SOC 2, ISO 27001\n\n## 1. Objective and Scope\nThis policy defines the security principles and administrative controls governing all digital assets, databases, and employees at the organization.\n\n## 2. Access and Cryptography\n- All employees must authenticate via Okta SSO enforcing FIDO2/WebAuthn MFA.\n- Data stored in production object storage (AWS S3) must enforce default AWS KMS SSE encryption.\n- Public ingress endpoints require TLS 1.2+ with strict cipher suite constraints.`,
  },
  {
    id: 'p-2',
    title: 'Access Control and Identity Management Policy',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    approver: 'Head of Infrastructure',
    department: 'IT',
    version: 'v2.1',
    recurrence: 'Quarterly',
    entities: 'Organization Wide',
    updatedAt: '2026-09-08',
    requirement: 'Defines least-privilege role-based access control (RBAC), quarterly access reviews, and automated de-provisioning upon employee termination.',
    content: `# Access Control and Identity Management Policy\n**Version:** 2.1 | **Status:** Published\n\n## 1. Principle of Least Privilege\nAccess rights to production environments and customer data are granted strictly based on the principle of least privilege. Access requests require manager approval and are re-certified quarterly.\n\n## 2. Deprovisioning SLA\nUpon notification of employee departure, all IAM credentials and SaaS licenses must be revoked within 4 hours.`,
  },
  {
    id: 'p-3',
    title: 'Incident Response and Disaster Recovery Plan',
    framework: 'SOC 2',
    status: 'NEEDS_REVIEW',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    approver: 'CISO / Auditor',
    department: 'SECURITY',
    version: 'v1.4',
    recurrence: 'Annually',
    entities: 'Engineering & Cloud',
    updatedAt: '2026-09-15',
    requirement: 'Provides step-by-step procedures for detecting, triaging, mitigating, and documenting security incidents, including tabletop simulation schedules.',
    content: `# Incident Response and Disaster Recovery Plan\n**Version:** 1.4 | **Status:** Needs Review\n\n## 1. Severity Levels\n- **P1 (Critical):** Data breach, complete service outage. Response SLA: 15 minutes.\n- **P2 (Major):** Degraded customer functionality. Response SLA: 1 hour.\n\n## 2. Communication\nIncident coordination occurs in the dedicated Slack channel #incident-response. Formal post-mortems are conducted within 48 hours.`,
  },
  {
    id: 'p-4',
    title: 'Data Classification and Handling Policy',
    framework: 'ISO 27001',
    status: 'APPROVED',
    assignee: { name: 'David Kim', initials: 'DK' },
    approver: 'Legal Counsel',
    department: 'GOV',
    version: 'v2.0',
    recurrence: 'Annually',
    entities: 'Organization Wide',
    updatedAt: '2026-09-12',
    requirement: 'Categorizes data into Public, Internal, Confidential, and Restricted tiers with explicit tagging, encryption, and retention schedules.',
    content: `# Data Classification and Handling Policy\n**Version:** 2.0 | **Status:** Approved\n\n## 1. Classification Tiers\n- **Restricted:** Customer PII, payment tokens, cryptographic keys. AES-256 encryption required.\n- **Confidential:** Financial statements, source code.\n- **Internal:** Internal wikis, roadmap notes.\n- **Public:** Marketing assets, public documentation.`,
  },
  {
    id: 'p-5',
    title: 'Mobile Device and Teleworking (MDM) Policy',
    framework: 'SOC 2',
    status: 'DRAFT',
    assignee: { name: 'James Wilson', initials: 'JW' },
    approver: 'IT Director',
    department: 'IT',
    version: 'v1.0',
    recurrence: 'Annually',
    entities: 'All Employees',
    updatedAt: '2026-09-16',
    requirement: 'Governs remote employee workstations, mandatory full-disk encryption (FileVault/BitLocker), and screen lock timeouts.',
    content: `# Mobile Device and Teleworking Policy\n**Version:** 1.0 | **Status:** Draft\n\n## 1. Device Security\nAll company laptops must run automated MDM profiles enforcing automatic OS security updates, local disk encryption, and 10-minute inactivity auto-lock.`,
  },
  {
    id: 'p-6',
    title: 'Threat Intelligence & Vulnerability Management Policy',
    framework: 'SOC 2',
    status: 'DRAFT',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    approver: 'Lead Security Engineer',
    department: 'SECURITY',
    version: 'v1.0',
    recurrence: 'Quarterly',
    entities: 'Production Cloud',
    updatedAt: '2026-09-16',
    requirement: 'Defines vulnerability SLA resolution timelines (Critical CVEs < 48 hours) and annual external penetration testing windows.',
    content: `# Vulnerability Management Policy\n**Version:** 1.0 | **Status:** Draft\n\n## 1. Scanning and SLAs\nAutomated CI/CD dependency scans run on every pull request. Critical severity vulnerabilities must be remediated or mitigated within 48 hours of public advisory.`,
  },
  {
    id: 'p-7',
    title: 'Vendor and Third-Party Risk Management Policy',
    framework: 'SOC 2',
    status: 'NOT_UPLOADED',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    approver: 'CFO / Compliance Lead',
    department: 'LEGAL',
    version: 'v0.0',
    recurrence: 'Annually',
    entities: 'Procurement',
    updatedAt: '-',
    requirement: 'Mandates due diligence audits, SOC 2 / ISO 27001 certificate verification, and standard DPA terms before onboarding third-party SaaS vendors.',
    content: '',
  },
  {
    id: 'p-8',
    title: 'Secure Software Development Lifecycle (SSDLC) Policy',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'David Kim', initials: 'DK' },
    approver: 'VP of Engineering',
    department: 'IT',
    version: 'v2.4',
    recurrence: 'Annually',
    entities: 'Engineering',
    updatedAt: '2026-09-02',
    requirement: 'Enforces code reviews, secret scanning, static analysis (SAST), and prohibition of direct commits to production branches.',
    content: `# Secure Software Development Lifecycle Policy\n**Version:** 2.4 | **Status:** Published\n\n## 1. Branch Protection\nDirect push to production branches is disabled via GitHub branch protection. All code changes require at least 1 approving peer review and green CI testing suite before merge.`,
  },
  {
    id: 'p-9',
    title: 'Code of Business Conduct and Ethics',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'Emily Watson', initials: 'EW' },
    approver: 'CEO & HR',
    department: 'HR',
    version: 'v3.0',
    recurrence: 'Annually',
    entities: 'Organization Wide',
    updatedAt: '2026-08-20',
    requirement: 'Standard organizational ethics, anti-bribery, conflict of interest, and whistleblower protection guidelines.',
    content: `# Code of Business Conduct\n**Version:** 3.0 | **Status:** Published\n\n## 1. Commitment\nAll employees must read, acknowledge, and adhere to the Code of Conduct upon hiring and annually thereafter.`,
  },
  {
    id: 'p-10',
    title: 'Business Continuity and Disaster Recovery Testing',
    framework: 'ISO 27001',
    status: 'NOT_UPLOADED',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    approver: 'Director of Ops',
    department: 'IT',
    version: 'v0.0',
    recurrence: 'Annually',
    entities: 'Infrastructure',
    updatedAt: '-',
    requirement: 'Annual validation of multi-region database failover, RTO (< 4 hrs) and RPO (< 1 hr) objectives.',
    content: '',
  },
];

const FILENAME = 'policies.json';

export async function GET() {
  const policies = getStoredData(FILENAME, INITIAL_POLICIES);
  return NextResponse.json(policies);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'reset_missing') {
      const policies = getStoredData<any[]>(FILENAME, INITIAL_POLICIES);
      const updated = policies.map((p) => {
        if (p.id === 'p-7' || p.id === 'p-10') {
          return {
            ...p,
            status: 'NOT_UPLOADED',
            version: 'v0.0',
            updatedAt: '-',
            content: '',
            attachment: null,
          };
        }
        return p;
      });
      saveStoredData(FILENAME, updated);
      return NextResponse.json(updated);
    }

    const policies = getStoredData<any[]>(FILENAME, INITIAL_POLICIES);
    const newPolicy = {
      id: `p-${Date.now()}`,
      title: body.title || 'Custom Policy',
      framework: body.framework || 'SOC 2',
      status: body.status || 'DRAFT',
      assignee: body.assignee || { name: 'Sarah Chen', initials: 'SC' },
      approver: body.approver || 'Compliance Lead',
      department: body.department || 'GOV',
      version: body.version || 'v1.0',
      recurrence: body.recurrence || 'Annually',
      entities: body.entities || 'Organization Wide',
      updatedAt: new Date().toISOString().split('T')[0],
      requirement: body.requirement || 'Standard compliance mandate.',
      content: body.content || '',
    };
    policies.unshift(newPolicy);
    saveStoredData(FILENAME, policies);
    return NextResponse.json(newPolicy, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const policies = getStoredData<any[]>(FILENAME, INITIAL_POLICIES);
    let updatedItem: any = null;

    const updated = policies.map((p) => {
      if (p.id === body.id) {
        updatedItem = {
          ...p,
          ...body,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        return updatedItem;
      }
      return p;
    });

    if (!updatedItem && body.id) {
      updatedItem = {
        id: body.id,
        title: body.title || 'Compliance Policy',
        framework: body.framework || 'SOC 2',
        status: body.status || 'PUBLISHED',
        assignee: { name: 'Alex Rivera', initials: 'AR' },
        approver: 'Compliance Lead',
        department: 'GOV',
        version: 'v1.0',
        recurrence: 'Annually',
        entities: 'Organization Wide',
        updatedAt: new Date().toISOString().split('T')[0],
        requirement: 'Organizational compliance policy requirement.',
        content: body.content || '',
        ...body,
      };
      updated.unshift(updatedItem);
    }

    saveStoredData(FILENAME, updated);
    return NextResponse.json({ success: true, policy: updatedItem || body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }
    const policies = getStoredData<any[]>(FILENAME, INITIAL_POLICIES);
    const filtered = policies.filter((p) => p.id !== id);
    saveStoredData(FILENAME, filtered);
    return NextResponse.json({ success: true, policies: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


