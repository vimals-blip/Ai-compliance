import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const rootDir = path.resolve(process.cwd(), '../..');
  const mdPath = path.join(rootDir, 'PRODUCT_GUIDE.md');
  const htmlPath = path.join(rootDir, 'docs', 'PRODUCT_GUIDE.html');

  if (format === 'html') {
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  }

  if (format === 'download-md') {
    if (fs.existsSync(mdPath)) {
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      return new NextResponse(mdContent, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': 'attachment; filename="AI_Compliance_Product_Guide.md"',
        },
      });
    }
  }

  if (fs.existsSync(mdPath)) {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    return NextResponse.json({
      title: 'AI-Compliance Product Architecture, Use Cases & End-to-End Flow',
      version: '1.0',
      lastUpdated: '2026-09-17',
      markdown: mdContent,
    });
  }

  return NextResponse.json({ error: 'Product guide not found' }, { status: 404 });
}
