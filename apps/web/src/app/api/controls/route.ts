import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const INITIAL_CONTROLS = [
  {
    id: 'c-1',
    code: 'CC6.1',
    framework: 'SOC 2',
    title: 'Logical Access Security & Identity Management',
    category: 'Access Control',
    description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
    status: 'EFFECTIVE',
    maturityLevel: 4,
    notes: 'Enforces 14-character passwords, MFA via Okta, and automated quarterly access reviews.',
    evidenceMapped: ['AWS_IAM_Password_Policy_Report_2026.pdf'],
  },
  {
    id: 'c-2',
    code: 'CC6.6',
    framework: 'SOC 2',
    title: 'Boundary Protection & Network Firewalls',
    category: 'Network Security',
    description: 'The entity implements logical boundaries and network segmentation controls to prevent unauthorized perimeter access.',
    status: 'EFFECTIVE',
    maturityLevel: 3,
    notes: 'Perimeter protected by AWS WAF and CloudFront. TLS 1.3 enforced for customer ingress.',
    evidenceMapped: ['Information_Security_Policy_v3.2.docx'],
  },
  {
    id: 'c-3',
    code: 'CC7.2',
    framework: 'SOC 2',
    title: 'Security Incident Detection & Monitoring',
    category: 'Incident Management',
    description: 'The entity monitors system components and the operation of controls to detect anomalies and unauthorized actions.',
    status: 'ISSUE',
    maturityLevel: 2,
    notes: 'Q2 pen test showed medium vulnerability findings that required remediation.',
    evidenceMapped: ['Q2_Penetration_Testing_Summary_Report.pdf'],
  },
  {
    id: 'c-4',
    code: 'A.9.1.1',
    framework: 'ISO 27001',
    title: 'Access Control Policy Enforcement',
    category: 'Identity & Access',
    description: 'An access control policy shall be established, documented and reviewed based on business and information security requirements.',
    status: 'EFFECTIVE',
    maturityLevel: 4,
    notes: 'Formal policy signed off by CISO; re-certified annually.',
    evidenceMapped: ['AWS_IAM_Password_Policy_Report_2026.pdf'],
  },
  {
    id: 'c-5',
    code: 'PR.DS-1',
    framework: 'NIST CSF',
    title: 'Data-at-Rest Protection & Cryptography',
    category: 'Protect - Data Security',
    description: 'Data-at-rest is protected through encryption, hashing, and tokenization techniques complying with NIST standards.',
    status: 'EFFECTIVE',
    maturityLevel: 5,
    notes: 'AES-256 customer managed KMS keys active on all production RDS databases and S3 buckets.',
    evidenceMapped: ['AWS_KMS_Key_Policy.json'],
  },
  {
    id: 'c-6',
    code: 'PR.IP-12',
    framework: 'NIST CSF',
    title: 'Vulnerability Management & Penetration Testing',
    category: 'Protect - Information Protection',
    description: 'A vulnerability management plan is developed and implemented, including regular automated CVE scans.',
    status: 'NOT_TESTED',
    maturityLevel: 1,
    notes: 'Scheduled for Q4 automated adversary simulation.',
    evidenceMapped: [],
  },
];

const FILENAME = 'controls.json';

export async function GET() {
  const controls = getStoredData(FILENAME, INITIAL_CONTROLS);
  return NextResponse.json(controls);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const controls = getStoredData<any[]>(FILENAME, INITIAL_CONTROLS);
    const newControl = {
      id: `c-${Date.now()}`,
      code: body.code || 'CC_CUSTOM',
      framework: body.framework || 'SOC 2',
      title: body.title || 'New Custom Control',
      category: body.category || 'Access Control',
      description: body.description || '',
      status: body.status || 'EFFECTIVE',
      maturityLevel: body.maturityLevel || 3,
      notes: body.notes || '',
      evidenceMapped: body.evidenceMapped || [],
      createdAt: new Date().toISOString(),
    };
    controls.unshift(newControl);
    saveStoredData(FILENAME, controls);
    return NextResponse.json(newControl, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const controls = getStoredData<any[]>(FILENAME, INITIAL_CONTROLS);
    let updatedItem: any = null;

    const updated = controls.map((c) => {
      if (c.id === body.id || c.code === body.code) {
        updatedItem = {
          ...c,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return c;
    });

    if (updatedItem) {
      saveStoredData(FILENAME, updated);
      return NextResponse.json({ success: true, control: updatedItem });
    }
    return NextResponse.json({ error: 'Control not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Control ID is required' }, { status: 400 });
    }
    const controls = getStoredData<any[]>(FILENAME, INITIAL_CONTROLS);
    const filtered = controls.filter((c) => c.id !== id && c.code !== id);
    saveStoredData(FILENAME, filtered);
    return NextResponse.json({ success: true, controls: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

