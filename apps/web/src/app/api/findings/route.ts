import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const INITIAL_FINDINGS = [
  {
    id: 'f-1',
    auditId: 'audit-soc2',
    controlId: 'c-3',
    title: 'MFA not enforced for legacy staging VPN gateway',
    description: 'Staging environment VPN gateway allows single-factor password authentication.',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    identifiedAt: '2026-09-01',
    dueDate: '2026-09-30',
    remediationPlan: 'Enforce SAML SSO with mandatory FIDO2 / Okta Verify MFA.',
  },
  {
    id: 'f-2',
    auditId: 'audit-soc2',
    controlId: 'c-1',
    title: 'Quarterly access review missing Q2 sign-off',
    description: 'IAM user list not signed off by engineering directors for previous quarter.',
    severity: 'MEDIUM',
    status: 'OPEN',
    identifiedAt: '2026-09-05',
    dueDate: '2026-10-05',
    remediationPlan: 'Execute quarterly user access campaign and collect manager attestation.',
  },
  {
    id: 'f-3',
    auditId: 'audit-soc2',
    controlId: 'c-5',
    title: 'Unencrypted S3 backup bucket in secondary region',
    description: 'Backup snapshots stored without customer-managed KMS encryption key.',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    identifiedAt: '2026-09-02',
    dueDate: '2026-09-20',
    remediationPlan: 'Deploy Terraform patch enabling AWS KMS SSE encryption with auto-rotation.',
  },
  {
    id: 'f-4',
    auditId: 'audit-soc2',
    controlId: 'c-6',
    title: 'Vendor SOC 2 reports expired for 2 sub-processors',
    description: 'Third-party cloud monitoring vendor report older than 12 months.',
    severity: 'LOW',
    status: 'OPEN',
    identifiedAt: '2026-09-08',
    dueDate: '2026-10-15',
    remediationPlan: 'Request current SOC 2 Type II attestation from vendor trust center.',
  },
];

const FILENAME = 'findings.json';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');

  let results = getStoredData<any[]>(FILENAME, INITIAL_FINDINGS);
  if (severity && severity !== 'ALL') {
    results = results.filter((f) => f.severity === severity);
  }
  if (status && status !== 'ALL') {
    results = results.filter((f) => f.status === status);
  }

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const findings = getStoredData<any[]>(FILENAME, INITIAL_FINDINGS);
    const newFinding = {
      id: `f-${Date.now()}`,
      ...body,
      status: body.status || 'OPEN',
      identifiedAt: new Date().toISOString().split('T')[0],
    };
    findings.unshift(newFinding);
    saveStoredData(FILENAME, findings);
    return NextResponse.json(newFinding, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const findings = getStoredData<any[]>(FILENAME, INITIAL_FINDINGS);
    let updatedItem: any = null;

    const updated = findings.map((f) => {
      if (f.id === body.id) {
        updatedItem = { ...f, ...body };
        return updatedItem;
      }
      return f;
    });

    if (updatedItem) {
      saveStoredData(FILENAME, updated);
      return NextResponse.json({ success: true, finding: updatedItem });
    }
    return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
