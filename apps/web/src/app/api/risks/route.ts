import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const INITIAL_RISKS = [
  {
    id: 'r-1',
    title: 'Unencrypted S3 backup bucket in secondary region',
    description: 'Backup snapshots stored without customer-managed KMS encryption key.',
    category: 'Infrastructure',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    residualLikelihood: 3,
    residualImpact: 4,
    residualRiskScore: 12,
    treatment: 'MITIGATED',
    severity: 'HIGH',
    status: 'OPEN',
  },
  {
    id: 'r-2',
    title: 'MFA not enforced for legacy staging VPN',
    description: 'Staging environment VPN gateway allows single-factor password authentication.',
    category: 'Access Control',
    inherentLikelihood: 3,
    inherentImpact: 4,
    inherentRiskScore: 12,
    residualLikelihood: 2,
    residualImpact: 2,
    residualRiskScore: 4,
    treatment: 'MITIGATED',
    severity: 'LOW',
    status: 'OPEN',
  },
  {
    id: 'r-3',
    title: 'Quarterly access review missing Q2 sign-off',
    description: 'IAM user list not signed off by engineering directors for previous quarter.',
    category: 'Governance',
    inherentLikelihood: 3,
    inherentImpact: 2,
    inherentRiskScore: 6,
    residualLikelihood: 1,
    residualImpact: 2,
    residualRiskScore: 2,
    treatment: 'ACCEPTED',
    severity: 'LOW',
    status: 'MITIGATED',
  },
  {
    id: 'r-4',
    title: 'Vendor SOC 2 reports expired for 2 sub-processors',
    description: 'Third-party cloud monitoring vendor report older than 12 months.',
    category: 'Third-Party Risk',
    inherentLikelihood: 2,
    inherentImpact: 2,
    inherentRiskScore: 4,
    residualLikelihood: 2,
    residualImpact: 2,
    residualRiskScore: 4,
    treatment: 'OPEN',
    severity: 'LOW',
    status: 'OPEN',
  },
];

const FILENAME = 'risks.json';

export async function GET() {
  const risks = getStoredData(FILENAME, INITIAL_RISKS);
  return NextResponse.json(risks);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const risks = getStoredData<any[]>(FILENAME, INITIAL_RISKS);
    const created = {
      id: `r-${Date.now()}`,
      ...body,
      status: body.status || 'OPEN',
      createdAt: new Date().toISOString(),
    };
    risks.unshift(created);
    saveStoredData(FILENAME, risks);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const risks = getStoredData<any[]>(FILENAME, INITIAL_RISKS);
    let updatedItem: any = null;

    const updated = risks.map((r) => {
      if (r.id === body.id) {
        updatedItem = { ...r, ...body };
        return updatedItem;
      }
      return r;
    });

    if (!updatedItem && body.id) {
      updatedItem = {
        id: body.id,
        title: body.title || 'Identified Security Risk',
        description: body.description || 'Risk factor.',
        category: body.category || 'Infrastructure',
        inherentLikelihood: 3,
        inherentImpact: 3,
        inherentRiskScore: 9,
        residualLikelihood: 2,
        residualImpact: 2,
        residualRiskScore: 4,
        treatment: 'MITIGATED',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        ...body,
      };
      updated.unshift(updatedItem);
    }

    saveStoredData(FILENAME, updated);
    return NextResponse.json({ success: true, updated: updatedItem || body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Risk ID is required' }, { status: 400 });
    }
    const risks = getStoredData<any[]>(FILENAME, INITIAL_RISKS);
    const filtered = risks.filter((r) => r.id !== id);
    saveStoredData(FILENAME, filtered);
    return NextResponse.json({ success: true, risks: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

