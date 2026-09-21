import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const startTime = Date.now();
  const defaultEndpoint = (process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000') + '/api/v1/health';
  let endpoint = defaultEndpoint;
  let requestedModel = 'llama-3.1-8b';

  try {
    const body = await req.json();
    if (body.endpoint) endpoint = body.endpoint;
    if (body.model) requestedModel = body.model;
  } catch {
    // Body optional
  }

  // 1. Try testing Python AI compliance engine health
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        status: 'online',
        latencyMs,
        service: data.service || 'compliance-ai-service',
        version: data.version || '1.0.0',
        activeModel: 'Meta Llama 3.1 8B Instruct (Fine-Tuned GRC)',
        supportedModels: data.models_supported || ['Llama-3.1-8B-Instruct', 'Mistral-Nemo-12B'],
        ragEngine: data.rag_engine || 'pgvector',
        testedEndpoint: endpoint,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    // Check if custom endpoint was provided
    if (endpoint && !endpoint.includes('8000')) {
      try {
        const customRes = await fetch(endpoint, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        const latencyMs = Date.now() - startTime;
        return NextResponse.json({
          success: customRes.ok,
          status: customRes.ok ? 'online' : 'degraded',
          latencyMs,
          activeModel: requestedModel,
          testedEndpoint: endpoint,
          timestamp: new Date().toISOString(),
        });
      } catch (customErr: any) {
        return NextResponse.json({
          success: false,
          status: 'offline',
          error: customErr.message,
          testedEndpoint: endpoint,
          timestamp: new Date().toISOString(),
        }, { status: 502 });
      }
    }
  }

  // If unreachable
  return NextResponse.json({
    success: false,
    status: 'offline',
    error: 'AI Inference Service is not responding at ' + endpoint,
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}
