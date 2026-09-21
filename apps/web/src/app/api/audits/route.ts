import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const INITIAL_AUDITS = [
  {
    id: 'audit-soc2',
    name: 'SOC 2 Type II Examination 2026',
    status: 'In Progress',
    type: 'External',
    auditDate: '1 Oct 2026',
    observationPeriod: '1 Sept 2025 - 1 Oct 2026',
    owner: 'Sarah Chen (Lead)',
    framework: 'SOC 2',
    entities: 'Organization Wide',
    auditTeam: 'KPMG LLP & Compliance Lead',
    readiness: {
      overall: 98,
      policies: 97,
      tests: 100,
      evidences: 100,
    },
    correctiveActions: [
      {
        id: 'ca-1',
        nonConformityName: 'Share documented peer code review processes',
        status: 'Open',
        assignee: 'Security Engineering',
        dueDate: '25 Sep 2026',
        criticality: 'Low',
      },
      {
        id: 'ca-2',
        nonConformityName: 'VAPT Annual Penetration Testing Sign-off',
        status: 'Closed',
        assignee: 'Security Lead',
        dueDate: '15 Aug 2026',
        criticality: 'Medium',
      },
    ],
    requirements: [
      { id: 'req-1', code: 'CC1.0', title: 'Control Environment & Integrity', controlsCount: 5, controls: ['CC1.1', 'CC1.2', 'CC1.3', 'CC1.4', 'CC1.5'] },
      { id: 'req-2', code: 'CC2.0', title: 'Communication and Information Sharing', controlsCount: 3, controls: ['CC2.1', 'CC2.2', 'CC2.3'] },
      { id: 'req-3', code: 'CC3.0', title: 'Risk Assessment & Objectives', controlsCount: 4, controls: ['CC3.1', 'CC3.2', 'CC3.3', 'CC3.4'] },
      { id: 'req-4', code: 'CC4.0', title: 'Monitoring Activities & Deep Inspection', controlsCount: 2, controls: ['CC4.1', 'CC4.2'] },
      { id: 'req-5', code: 'CC5.0', title: 'Control Activities & Policy Mandates', controlsCount: 3, controls: ['CC5.1', 'CC5.2', 'CC5.3'] },
      { id: 'req-6', code: 'CC6.0', title: 'Logical & Physical Access Controls', controlsCount: 8, controls: ['CC6.1', 'CC6.2', 'CC6.3', 'CC6.4', 'CC6.5', 'CC6.6', 'CC6.7', 'CC6.8'] },
    ],
  },
  {
    id: 'audit-iso',
    name: 'ISO/IEC 27001:2022 Stage 2 Audit',
    status: 'Planned',
    type: 'External',
    auditDate: '15 Nov 2026',
    observationPeriod: '1 Nov 2025 - 1 Nov 2026',
    owner: 'Alex Rivera',
    framework: 'ISO 27001',
    entities: 'Cloud Operations & R&D',
    auditTeam: 'BSI Group Lead Assessor',
    readiness: {
      overall: 84,
      policies: 92,
      tests: 88,
      evidences: 72,
    },
    correctiveActions: [
      {
        id: 'ca-iso-1',
        nonConformityName: 'Document internal mTLS cipher whitelist',
        status: 'Open',
        assignee: 'DevOps Lead',
        dueDate: '30 Oct 2026',
        criticality: 'Medium',
      },
    ],
    requirements: [
      { id: 'req-iso-1', code: 'A.5', title: 'Organizational Controls (37 Controls)', controlsCount: 37, controls: ['A.5.1', 'A.5.2', 'A.5.8', 'A.5.15'] },
      { id: 'req-iso-2', code: 'A.6', title: 'People Controls (8 Controls)', controlsCount: 8, controls: ['A.6.1', 'A.6.2', 'A.6.4'] },
      { id: 'req-iso-3', code: 'A.7', title: 'Physical Controls (14 Controls)', controlsCount: 14, controls: ['A.7.1', 'A.7.2', 'A.7.4'] },
      { id: 'req-iso-4', code: 'A.8', title: 'Technological Controls (34 Controls)', controlsCount: 34, controls: ['A.8.1', 'A.8.2', 'A.8.9', 'A.8.20', 'A.8.24'] },
    ],
  },
  {
    id: 'audit-nist',
    name: 'NIST CSF v2.0 Internal Cybersecurity Review',
    status: 'Completed',
    type: 'Internal',
    auditDate: '20 Jun 2026',
    observationPeriod: '1 Jan 2026 - 1 Jun 2026',
    owner: 'Sarah Chen',
    framework: 'NIST CSF',
    entities: 'Organization Wide',
    auditTeam: 'Internal Audit Committee',
    readiness: {
      overall: 100,
      policies: 100,
      tests: 100,
      evidences: 100,
    },
    correctiveActions: [],
    requirements: [
      { id: 'req-nist-1', code: 'GV', title: 'Govern (Organizational Context & Strategy)', controlsCount: 16, controls: ['GV.OC', 'GV.RM', 'GV.SC'] },
      { id: 'req-nist-2', code: 'ID', title: 'Identify (Asset Management & Risk Assessment)', controlsCount: 20, controls: ['ID.AM', 'ID.RA'] },
      { id: 'req-nist-3', code: 'PR', title: 'Protect (Identity, Data Security & Training)', controlsCount: 32, controls: ['PR.AA', 'PR.AT', 'PR.DS', 'PR.PS'] },
      { id: 'req-nist-4', code: 'DE', title: 'Detect (Adverse Event Analysis & Monitoring)', controlsCount: 14, controls: ['DE.AE', 'DE.CM'] },
      { id: 'req-nist-5', code: 'RS', title: 'Respond (Incident Management & Mitigation)', controlsCount: 16, controls: ['RS.MA', 'RS.AN'] },
      { id: 'req-nist-6', code: 'RC', title: 'Recover (Restoration & Communications)', controlsCount: 10, controls: ['RC.RP', 'RC.CO'] },
    ],
  },
];

const FILENAME = 'audits.json';

export async function GET() {
  const audits = getStoredData(FILENAME, INITIAL_AUDITS);
  return NextResponse.json(audits);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const audits = getStoredData<any[]>(FILENAME, INITIAL_AUDITS);
    const newAudit = {
      id: `audit-${Date.now()}`,
      name: body.name || 'New Compliance Audit',
      status: body.status || 'Planned',
      type: body.type || 'Internal',
      auditDate: body.auditDate || new Date().toISOString().split('T')[0],
      observationPeriod: body.observationPeriod || 'Current Period',
      owner: body.owner || 'Compliance Lead',
      framework: body.framework || 'SOC 2',
      entities: body.entities || 'Organization Wide',
      auditTeam: body.auditTeam || 'Internal GRC',
      readiness: body.readiness || { overall: 50, policies: 50, tests: 50, evidences: 50 },
      correctiveActions: body.correctiveActions || [],
      requirements: body.requirements || [],
    };
    audits.unshift(newAudit);
    saveStoredData(FILENAME, audits);
    return NextResponse.json(newAudit, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const audits = getStoredData<any[]>(FILENAME, INITIAL_AUDITS);
    let updatedItem: any = null;

    const updated = audits.map((a) => {
      if (a.id === body.id) {
        updatedItem = { ...a, ...body };
        return updatedItem;
      }
      return a;
    });

    if (updatedItem) {
      saveStoredData(FILENAME, updated);
      return NextResponse.json({ success: true, audit: updatedItem });
    }
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing audit id' }, { status: 400 });
    }
    const audits = getStoredData<any[]>(FILENAME, INITIAL_AUDITS);
    const filtered = audits.filter((a) => a.id !== id);
    saveStoredData(FILENAME, filtered);
    return NextResponse.json({ success: true, remaining: filtered.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
