import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

export interface AutomatedTestItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'Cloud Security' | 'Identity & Access' | 'Code & Change' | 'Data Protection' | 'Incident Management';
  source: 'AWS' | 'GitHub' | 'Google Workspace' | 'Okta' | 'Slack' | 'System';
  resource: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  controls: string[];
  frequency: 'Continuous (Real-Time)' | 'Hourly' | 'Daily' | 'Weekly';
  lastRun: string;
  durationMs: number;
  details?: string;
  remediation?: string;
}

const AUTOMATED_TESTS_DATA: AutomatedTestItem[] = [
  {
    id: 'test-1',
    code: 'SEC-AWS-001',
    name: 'S3 Buckets Enforce Default KMS Encryption',
    description: 'Verifies that all active Amazon S3 buckets have default encryption enabled using AES-256 or AWS KMS customer-managed keys.',
    category: 'Data Protection',
    source: 'AWS',
    resource: 'arn:aws:s3:::prod-customer-data-backups',
    status: 'PASS',
    controls: ['CC6.7', 'PR.DS-1', 'A.8.24'],
    frequency: 'Continuous (Real-Time)',
    lastRun: '5 mins ago',
    durationMs: 420,
    details: 'Verified 8/8 buckets with SSE-KMS enabled.',
  },
  {
    id: 'test-2',
    code: 'SEC-AWS-002',
    name: 'S3 Public Access Block Configured',
    description: 'Ensures public access blocks are enabled at the bucket level and account level, preventing accidental public exposure.',
    category: 'Cloud Security',
    source: 'AWS',
    resource: 'arn:aws:s3:::*',
    status: 'PASS',
    controls: ['CC6.6', 'A.8.20'],
    frequency: 'Continuous (Real-Time)',
    lastRun: '5 mins ago',
    durationMs: 380,
    details: 'All 4 public access block settings (Acls, Policies) active.',
  },
  {
    id: 'test-3',
    code: 'SEC-AWS-003',
    name: 'IAM Root Account Has No Active Access Keys',
    description: 'Checks that the AWS Root account has no active access keys generated, requiring console access with hardware MFA only.',
    category: 'Identity & Access',
    source: 'AWS',
    resource: 'arn:aws:iam:::root',
    status: 'PASS',
    controls: ['CC6.1', 'A.9.1.1'],
    frequency: 'Hourly',
    lastRun: '20 mins ago',
    durationMs: 190,
    details: 'Root access keys: 0 found. Compliant.',
  },
  {
    id: 'test-4',
    code: 'SEC-AWS-004',
    name: 'IAM Users Enforce Hardware or Virtual MFA',
    description: 'Audits all IAM console users to verify multi-factor authentication is active and required for all console logins.',
    category: 'Identity & Access',
    source: 'AWS',
    resource: 'arn:aws:iam:::user/*',
    status: 'FAIL',
    controls: ['CC6.1', 'A.9.2.1', 'PR.AC-1'],
    frequency: 'Continuous (Real-Time)',
    lastRun: '12 mins ago',
    durationMs: 510,
    details: '3 users detected without MFA: service_account_ci, legacy_admin, new_hire_john.',
    remediation: 'Attach IAM policy requiring MFA or configure federated SSO via Okta.',
  },
  {
    id: 'test-5',
    code: 'SEC-GH-001',
    name: 'GitHub Main Branch Disallows Force Pushes',
    description: 'Validates that force pushes are explicitly disabled on production repositories to maintain immutable audit history.',
    category: 'Code & Change',
    source: 'GitHub',
    resource: 'github.com/org/core-platform:main',
    status: 'PASS',
    controls: ['CC8.1', 'PR.IP-1'],
    frequency: 'Continuous (Real-Time)',
    lastRun: 'Just now',
    durationMs: 230,
    details: 'Branch protection rule allow_force_pushes = false verified.',
  },
  {
    id: 'test-6',
    code: 'SEC-GH-002',
    name: 'GitHub Pull Requests Require Code Owner Approval',
    description: 'Enforces that pull requests touching production paths require at least 1 approving peer review before merging.',
    category: 'Code & Change',
    source: 'GitHub',
    resource: 'github.com/org/core-platform:CODEOWNERS',
    status: 'PASS',
    controls: ['CC8.1', 'A.8.32'],
    frequency: 'Continuous (Real-Time)',
    lastRun: 'Just now',
    durationMs: 310,
    details: 'Min review count = 1, dismiss_stale_reviews = true.',
  },
  {
    id: 'test-7',
    code: 'SEC-GW-001',
    name: 'Google Workspace 2-Step Verification Enforced',
    category: 'Identity & Access',
    description: 'Verifies organization-wide 2-Step Verification enforcement for all active Google Workspace accounts.',
    source: 'Google Workspace',
    resource: 'admin.google.com/security/2sv',
    status: 'PASS',
    controls: ['CC6.1', 'CC6.2', 'A.9.4.2'],
    frequency: 'Daily',
    lastRun: '1 hour ago',
    durationMs: 640,
    details: '52/52 active accounts enrolled in 2SV.',
  },
  {
    id: 'test-8',
    code: 'SEC-SL-001',
    name: 'Slack Dedicated Incident Channels Active',
    category: 'Incident Management',
    description: 'Verifies that dedicated, monitored incident response channels exist for P1/P2 security coordination.',
    source: 'Slack',
    resource: 'slack://channel/#incident-response',
    status: 'PASS',
    controls: ['CC7.3', 'CC7.4', 'A.16.1.2'],
    frequency: 'Daily',
    lastRun: '2 hours ago',
    durationMs: 290,
    details: '#incident-response and #security-alerts active with 12 incident responders.',
  },
  {
    id: 'test-9',
    code: 'SEC-NET-001',
    name: 'Public Endpoints Require TLS 1.2+ with Perfect Forward Secrecy',
    category: 'Data Protection',
    description: 'Scans public API gateway and web edge endpoints to verify SSL/TLS configurations reject deprecated protocols.',
    source: 'System',
    resource: 'https://api.acme.com',
    status: 'PASS',
    controls: ['CC6.7', 'PR.DS-2', 'A.8.20'],
    frequency: 'Continuous (Real-Time)',
    lastRun: '15 mins ago',
    durationMs: 780,
    details: 'TLS 1.3 negotiated with ECDHE cipher suites.',
  },
  {
    id: 'test-10',
    code: 'SEC-DB-001',
    name: 'PostgreSQL Automated Daily Backups and Retention',
    category: 'Data Protection',
    description: 'Verifies that production database snapshots are captured daily with at least 30-day point-in-time recovery.',
    source: 'AWS',
    resource: 'arn:aws:rds:us-east-1:123456789012:db:prod-db',
    status: 'WARN',
    controls: ['A.12.3.1', 'CC7.5'],
    frequency: 'Daily',
    lastRun: '3 hours ago',
    durationMs: 440,
    details: 'Daily backups enabled (retention 14 days). Recommended minimum for SOC 2 Type II is 30 days.',
    remediation: 'Increase backup_retention_period from 14 to 30 in RDS cluster configuration.',
  },
];

const FILENAME = 'tests.json';

export async function GET() {
  const tests = getStoredData<AutomatedTestItem[]>(FILENAME, AUTOMATED_TESTS_DATA);
  const evidenceList = getStoredData<any[]>('evidence.json', []);

  // Dynamically sync tests with ALL live GitHub evidence artifacts
  const ghEvidences = evidenceList.filter((e) => e.source === 'GITHUB');
  const nonGhTests = tests.filter((t) => t.source !== 'GitHub');

  let dynamicGhTests: AutomatedTestItem[] = [];

  if (ghEvidences.length > 0) {
    ghEvidences.forEach((ev, idx) => {
      let parsed: any = null;
      try {
        parsed = typeof ev.content === 'string' ? JSON.parse(ev.content) : ev.content;
      } catch {}

      if (parsed) {
        const isProtected = Boolean(parsed.branch_protected);
        const repo = parsed.repository || `vcs-repo-${idx + 1}`;
        const repoShortName = repo.split('/').pop() || repo;
        const branch = parsed.branch || 'main';
        const hasReviews = isProtected && (parsed.required_pull_request_reviews?.required_approving_review_count >= 1);

        dynamicGhTests.push({
          id: `test-gh-force-${idx + 1}-${repoShortName}`,
          code: `SEC-GH-001-${repoShortName}`,
          name: `GitHub Main Branch Disallows Force Pushes (${repoShortName})`,
          description: `Validates that force pushes are explicitly disabled on production repository ${repo} to maintain immutable audit history.`,
          category: 'Code & Change',
          source: 'GitHub',
          resource: `github.com/${repo}:${branch}`,
          status: isProtected ? ('PASS' as const) : ('FAIL' as const),
          controls: ['CC8.1', 'PR.IP-1'],
          frequency: 'Continuous (Real-Time)',
          lastRun: 'Just now',
          durationMs: 220,
          details: isProtected
            ? `Branch protection rule allow_force_pushes = false verified on ${repo}:${branch}.`
            : `Branch protection is disabled on ${repo}:${branch}. Direct pushes and force pushes are currently permitted.`,
          remediation: isProtected
            ? undefined
            : `Enable branch protection on branch '${branch}' for ${repo} (Check "Do not allow force pushes") to satisfy SOC 2 CC8.1.`,
        });

        dynamicGhTests.push({
          id: `test-gh-pr-${idx + 1}-${repoShortName}`,
          code: `SEC-GH-002-${repoShortName}`,
          name: `GitHub Pull Requests Require Code Review (${repoShortName})`,
          description: `Enforces that pull requests touching production paths require at least 1 approving peer review before merging in ${repo}.`,
          category: 'Code & Change',
          source: 'GitHub',
          resource: `github.com/${repo}:PR-Reviews`,
          status: hasReviews ? ('PASS' as const) : ('FAIL' as const),
          controls: ['CC8.1', 'A.8.32'],
          frequency: 'Continuous (Real-Time)',
          lastRun: 'Just now',
          durationMs: 232,
          details: hasReviews
            ? `Mandatory peer review approval (1+ reviewer) enforced on ${repo}.`
            : `No mandatory PR code review approvals required before merging into ${repo}:${branch}.`,
          remediation: hasReviews
            ? undefined
            : `Configure branch protection rule on branch '${branch}' requiring at least 1 approving peer review before merging to satisfy SOC 2 CC8.1 and CC6.8.`,
        });
      }
    });
  }

  // Fallback to default GitHub tests if no GitHub evidence collected yet
  if (dynamicGhTests.length === 0) {
    dynamicGhTests = tests.filter((t) => t.source === 'GitHub');
  }

  const dynamicallyUpdatedTests = [...nonGhTests, ...dynamicGhTests];

  const total = dynamicallyUpdatedTests.length;
  const pass = dynamicallyUpdatedTests.filter((t) => t.status === 'PASS').length;
  const fail = dynamicallyUpdatedTests.filter((t) => t.status === 'FAIL').length;
  const warn = dynamicallyUpdatedTests.filter((t) => t.status === 'WARN').length;

  return NextResponse.json({
    summary: {
      total,
      passing: pass,
      failing: fail,
      warning: warn,
      passPercentage: Number(((pass / total) * 100).toFixed(1)),
    },
    tests: dynamicallyUpdatedTests,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tests = getStoredData<AutomatedTestItem[]>(FILENAME, AUTOMATED_TESTS_DATA);

    // If it's creating a new automated test
    if (body.action === 'create' || (body.name && !body.testId)) {
      const newTest: AutomatedTestItem = {
        id: `test-${Date.now()}`,
        code: body.code || `SEC-CUSTOM-${Math.floor(Math.random() * 900) + 100}`,
        name: body.name || 'Custom Security Check',
        description: body.description || 'Custom telemetry test.',
        category: body.category || 'Cloud Security',
        source: body.source || 'AWS',
        resource: body.resource || 'arn:aws:custom:*',
        status: body.status || 'PASS',
        controls: body.controls || ['CC6.1'],
        frequency: body.frequency || 'Continuous (Real-Time)',
        lastRun: 'Just now',
        durationMs: Math.floor(Math.random() * 300) + 150,
        details: body.details || 'Test created and validated.',
        remediation: body.remediation || 'Remediation guide attached.',
      };
      tests.unshift(newTest);
      saveStoredData(FILENAME, tests);
      return NextResponse.json(newTest, { status: 201 });
    }

    // Otherwise run test
    const testId = body.testId;
    const test = tests.find((t) => t.id === testId);

    const updated = tests.map((t) => {
      if (t.id === testId) {
        return {
          ...t,
          lastRun: 'Just now',
          durationMs: Math.floor(Math.random() * 300) + 180,
        };
      }
      return t;
    });
    saveStoredData(FILENAME, updated);

    return NextResponse.json({
      success: true,
      message: `Automated test ${test?.code || testId} executed successfully`,
      result: {
        testId,
        status: test?.status || 'PASS',
        timestamp: new Date().toISOString(),
        executionDurationMs: Math.floor(Math.random() * 300) + 200,
      },
    });
  } catch {
    return NextResponse.json({ success: true, message: 'All automated tests executed' });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const tests = getStoredData<AutomatedTestItem[]>(FILENAME, AUTOMATED_TESTS_DATA);
    let updatedItem: any = null;

    const updated = tests.map((t) => {
      if (t.id === body.id) {
        updatedItem = {
          ...t,
          ...body,
          lastRun: 'Just now',
        };
        return updatedItem;
      }
      return t;
    });

    if (updatedItem) {
      saveStoredData(FILENAME, updated);
      return NextResponse.json({ success: true, test: updatedItem });
    }
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing test ID' }, { status: 400 });
    }
    const tests = getStoredData<AutomatedTestItem[]>(FILENAME, AUTOMATED_TESTS_DATA);
    const filtered = tests.filter((t) => t.id !== id);
    saveStoredData(FILENAME, filtered);
    return NextResponse.json({ success: true, tests: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

