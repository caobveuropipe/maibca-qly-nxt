/**
 * Gọi Google Apps Script WebApp
 *
 * Khi chạy bên trong GAS WebApp (iframe): dùng google.script.run trực tiếp.
 * Khi chạy bên ngoài (Vercel/localhost): dùng Vercel Serverless Proxy để bypass CORS.
 *
 * Phát hiện GAS context bằng 2 cách (để phòng timing issues):
 *  1. window.google?.script?.run tồn tại
 *  2. URL chứa script.google.com
 */

declare const google: any;

function isInsideGas(): boolean {
  try {
    if (typeof window !== 'undefined' && typeof google !== 'undefined' && google?.script?.run) {
      return true;
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'script.google.com') {
      return true;
    }
  } catch (_) { /* ignore */ }
  return false;
}

function callViaGoogleScriptRun(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result: string) => {
        try {
          resolve(typeof result === 'string' ? JSON.parse(result) : result);
        } catch (e) {
          reject(new Error('GAS response parse error: ' + result));
        }
      })
      .withFailureHandler((err: any) => {
        reject(new Error('GAS script error: ' + (err?.message || String(err))));
      })
      .executeGasAction(JSON.stringify(payload));
  });
}

async function callViaVercelProxy(gasUrl: string, payload: any): Promise<any> {
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

export async function callGasProxy(gasUrl: string, payload: any): Promise<any> {
  if (isInsideGas()) {
    return callViaGoogleScriptRun(payload);
  }
  return callViaVercelProxy(gasUrl, payload);
}
