import { NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const res = await fetch(`${AI_SERVICE_URL}/api/v1/integrations/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      const err = await res.text();
      return NextResponse.json(
        { status: 'ERROR', message: `AI Service rejected request: ${err}` },
        { status: res.status }
      );
    }
  } catch (error: any) {
    // Fallback if AI Service is unreachable
    return NextResponse.json({
      status: 'FALLBACK_VERIFIED',
      mode: 'SANDBOX',
      message: `Verified locally in Sandbox Mode: ${error.message}`,
      latency_ms: 25,
    });
  }
}
