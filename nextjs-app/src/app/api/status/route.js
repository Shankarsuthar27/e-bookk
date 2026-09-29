import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const appUrl = process.env.APP_URL || null;

  return NextResponse.json({
    service: 'nextjs-app',
    status: 'healthy',
    pathPrefix: '/auth',
    bindings: {
      APP_URL: appUrl || 'Not injected (available on Vercel deployment/vercel dev)',
    },
    timestamp: new Date().toISOString(),
  });
}
