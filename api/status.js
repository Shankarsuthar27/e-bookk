export default async function handler(req, res) {
  const nextjsAppUrl = process.env.NEXTJS_APP_URL || null;

  let nextjsResponse = null;
  if (nextjsAppUrl) {
    try {
      const response = await fetch(new URL('/auth/api/status', nextjsAppUrl));
      if (response.ok) {
        nextjsResponse = await response.json();
      } else {
        nextjsResponse = { status: response.status, statusText: response.statusText };
      }
    } catch (err) {
      nextjsResponse = { error: err.message };
    }
  }

  return res.status(200).json({
    service: 'app',
    status: 'healthy',
    bindings: {
      NEXTJS_APP_URL: nextjsAppUrl || 'Not injected (available on Vercel deployment/vercel dev)',
      nextjsServiceData: nextjsResponse,
    },
    timestamp: new Date().toISOString(),
  });
}
