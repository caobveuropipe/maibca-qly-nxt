/**
 * Gọi Google Apps Script WebApp thông qua Vercel Serverless Proxy
 * 
 * Cơ chế: Browser → /api/gas-proxy (cùng domain) → GAS WebApp → Google Sheets
 * Giải quyết triệt để CORS, 404, Google Workspace policy
 */
export async function callGasProxy(gasUrl: string, payload: any): Promise<any> {
  const res = await fetch('/api/gas-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gasUrl, payload }),
  });

  if (!res.ok) {
    throw new Error(`Proxy HTTP error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
