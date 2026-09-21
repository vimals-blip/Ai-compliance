import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const FILENAME = 'organization.json';

const DEFAULT_ORG = {
  name: 'CloudSecure Enterprise',
  legalName: 'CloudSecure Enterprise Inc.',
  industry: 'Cloud & SaaS Infrastructure',
  primaryCloud: 'AWS',
  mfaTool: 'Okta',
  adminEmail: 'security@cloudsecure.io',
  frameworks: ['SOC 2 Type II', 'ISO/IEC 27001:2022', 'NIST CSF'],
  entityCount: 3,
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  const org = getStoredData(FILENAME, DEFAULT_ORG);
  return NextResponse.json(org);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getStoredData(FILENAME, DEFAULT_ORG);
    const updated = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    saveStoredData(FILENAME, updated);
    return NextResponse.json({ success: true, organization: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}
