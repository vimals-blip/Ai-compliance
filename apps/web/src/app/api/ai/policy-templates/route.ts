import { NextResponse } from 'next/server';

export async function GET() {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/v1/policies/templates`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('AI service templates unreachable, using built-in list:', err);
  }

  return NextResponse.json({
    templates: [
      'Information Security Policy',
      'Access Control Policy',
      'Incident Response Plan',
      'Data Classification Policy',
      'Vendor Risk Management Policy',
      'Business Continuity Plan',
      'Acceptable Use Policy',
      'Change Management Policy',
      'Encryption and Key Management Policy',
      'Physical Security Policy',
    ],
  });
}
