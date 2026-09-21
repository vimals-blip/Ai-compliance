import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const payload = {
      company_name: (body as any).company_name || 'Acme Corp',
      policy_type: 'SOC 2 Complete Suite',
      cloud_provider: (body as any).cloud_provider || 'AWS',
      mfa_tool: (body as any).mfa_tool || 'Okta',
      version: '1.0',
    };

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    // Forward request to Python FastAPI backend
    const pyRes = await fetch(`${AI_SERVICE_URL}/api/v1/export/auditor-package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!pyRes.ok) {
      throw new Error(`Python backend returned ${pyRes.status}: ${await pyRes.text()}`);
    }

    // Stream binary ZIP back to browser
    const zipArrayBuffer = await pyRes.arrayBuffer();

    return new NextResponse(zipArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${payload.company_name.replace(/\s+/g, '_')}_SOC2_Evidence_Package.zip"`,
        'Content-Length': zipArrayBuffer.byteLength.toString(),
      },
    });
  } catch (err: any) {
    console.error('Export auditor package error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
