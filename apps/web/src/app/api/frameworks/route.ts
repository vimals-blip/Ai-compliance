import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '../../../lib/serverStore';

const INITIAL_FRAMEWORKS = [
  {
    id: 'soc2-1',
    name: 'SOC 2 Type II',
    code: 'SOC2',
    version: '2022',
    description: 'AICPA Trust Services Criteria covering Security, Availability, and Confidentiality.',
    controlsCount: 64,
    effectiveCount: 58,
    score: 90.6,
  },
  {
    id: 'iso-1',
    name: 'ISO/IEC 27001:2022',
    code: 'ISO27001',
    version: '2022',
    description: 'International standard for Information Security Management Systems (ISMS Annex A controls).',
    controlsCount: 93,
    effectiveCount: 76,
    score: 81.7,
  },
  {
    id: 'nist-1',
    name: 'NIST Cybersecurity Framework',
    code: 'NIST-CSF',
    version: 'v2.0',
    description: 'National Institute of Standards and Technology CSF core: Govern, Identify, Protect, Detect, Respond, Recover.',
    controlsCount: 108,
    effectiveCount: 85,
    score: 78.7,
  },
];

const FILENAME = 'frameworks.json';

export async function GET() {
  const frameworks = getStoredData(FILENAME, INITIAL_FRAMEWORKS);
  const controls = getStoredData<any[]>('controls.json', []);

  // Dynamically compute scores from live controls
  const dynamicFrameworks = frameworks.map((f) => {
    let matchingControls: any[] = [];
    if (f.code === 'SOC2' || f.name.includes('SOC 2')) {
      matchingControls = controls.filter((c) => c.framework === 'SOC 2');
    } else if (f.code === 'ISO27001' || f.name.includes('ISO')) {
      matchingControls = controls.filter((c) => c.framework === 'ISO 27001' || c.code.startsWith('A.'));
    } else if (f.code === 'NIST-CSF' || f.name.includes('NIST')) {
      matchingControls = controls.filter((c) => c.framework === 'NIST CSF' || c.code.startsWith('PR.') || c.code.startsWith('GV.'));
    } else {
      matchingControls = controls.filter((c) => c.framework?.toLowerCase() === f.name?.toLowerCase());
    }

    if (matchingControls.length > 0) {
      const effective = matchingControls.filter((c) => c.status === 'EFFECTIVE').length;
      const score = Number(((effective / matchingControls.length) * 100).toFixed(1));
      return {
        ...f,
        controlsCount: matchingControls.length,
        effectiveCount: effective,
        score,
      };
    }
    return f;
  });

  return NextResponse.json(dynamicFrameworks);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const frameworks = getStoredData<any[]>(FILENAME, INITIAL_FRAMEWORKS);

    // Prevent duplicates by code
    if (frameworks.some((f) => f.code === body.code)) {
      return NextResponse.json({ error: 'Framework already exists' }, { status: 409 });
    }

    const newFramework = {
      id: body.id || `fw-${Date.now()}`,
      name: body.name,
      code: body.code,
      version: body.version || '1.0',
      description: body.description || '',
      controlsCount: body.controlsCount || 0,
      effectiveCount: body.effectiveCount || 0,
      score: body.score || 0,
    };

    frameworks.push(newFramework);
    saveStoredData(FILENAME, frameworks);
    return NextResponse.json(newFramework, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const frameworks = getStoredData<any[]>(FILENAME, INITIAL_FRAMEWORKS);
    const filtered = frameworks.filter((f) => f.id !== id);
    saveStoredData(FILENAME, filtered);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
