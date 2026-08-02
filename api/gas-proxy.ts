import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Proxy for Google Apps Script WebApp
 * 
 * Cơ chế: Browser → /api/gas-proxy (cùng domain, không CORS)
 *                  → Google Apps Script WebApp (server-to-server, không bị chặn)
 *                  → Google Sheets
 * 
 * Giải quyết triệt để:
 * - Lỗi CORS khi gọi trực tiếp từ browser
 * - Lỗi 404/Page Not Found do Google Workspace chính sách doanh nghiệp
 * - Lỗi redirect 302 → script.googleusercontent.com bị chặn
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { gasUrl, payload } = req.body || {};

    if (!gasUrl || !gasUrl.startsWith('https://script.google.com/')) {
      return res.status(400).json({
        success: false,
        error: 'gasUrl không hợp lệ. Phải bắt đầu bằng https://script.google.com/',
      });
    }

    // Server-to-server fetch — no CORS, no browser cookies, no Workspace policy
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await response.text();

    // Try to parse JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('[GAS Proxy] Non-JSON response:', text.substring(0, 300));
      return res.status(200).json({
        success: false,
        error: `GAS WebApp trả về nội dung không phải JSON. Có thể bạn chưa Deploy WebApp ở chế độ "Anyone" (Bất kỳ ai). Chi tiết: ${text.substring(0, 200)}`,
      });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[GAS Proxy Error]', err.message);
    return res.status(200).json({
      success: false,
      error: `Lỗi kết nối server proxy: ${err.message}`,
    });
  }
}
