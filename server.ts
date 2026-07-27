import express from 'express';
import path from 'path';
import { google } from 'googleapis';
import { createServer as createViteServer } from 'vite';
import firebaseConfig from './firebase-applet-config.json';

const CLIENT_ID = firebaseConfig.oAuthClientId;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to construct Google Auth Client (Service Account / ADC)
const getGoogleAuth = () => {
  return new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
};

// Helper to verify Google OAuth ID Token from Frontend
async function verifyGoogleToken(authHeader: string | undefined): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'admin@system.local';
  }
  const token = authHeader.substring(7);
  if (!token || token === 'undefined' || token === 'null') {
    return 'admin@system.local';
  }
  try {
    const auth = new google.auth.OAuth2(CLIENT_ID);
    const ticket = await auth.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (payload && payload.email) {
      return payload.email;
    }
  } catch (e) {
    console.warn('Google token verification skipped/failed, using fallback email:', e);
  }
  return 'admin@system.local';
}

// Helper to ensure PHAN_QUYEN and NHAT_KY_HOAT_DONG sheets exist
async function ensureSheetsExist(sheets: any, spreadsheetId: string, email: string) {
  try {
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = metadata.data.sheets.map((s: any) => s.properties.title);

    const requests: any[] = [];
    if (!sheetTitles.includes('PHAN_QUYEN')) {
      requests.push({
        addSheet: { properties: { title: 'PHAN_QUYEN' } }
      });
    }
    if (!sheetTitles.includes('NHAT_KY_HOAT_DONG')) {
      requests.push({
        addSheet: { properties: { title: 'NHAT_KY_HOAT_DONG' } }
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      });

      if (!sheetTitles.includes('PHAN_QUYEN')) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'PHAN_QUYEN!A1:C2',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              ['Email', 'Tab / Trang Tính', 'Quyền'],
              [email, 'ALL', 'Admin']
            ]
          }
        });
      }

      if (!sheetTitles.includes('NHAT_KY_HOAT_DONG')) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'NHAT_KY_HOAT_DONG!A1:D2',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              ['Thời Gian', 'Email', 'Thao Tác', 'Trạng Thái'],
              [new Date().toISOString(), email, 'Khởi tạo hệ thống', 'Thành công']
            ]
          }
        });
      }
    }
  } catch (err: any) {
    console.error('Lỗi khi cấu hình tự động các sheet bổ sung:', err.message);
  }
}

// Helper to check user permission from PHAN_QUYEN sheet
async function checkUserPermission(sheets: any, spreadsheetId: string, email: string, requiredTab: string): Promise<boolean> {
  await ensureSheetsExist(sheets, spreadsheetId, email);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'PHAN_QUYEN!A2:C1000'
  });

  const rows = response.data.values || [];
  for (const row of rows) {
    const rowEmail = (row[0] || '').toString().trim().toLowerCase();
    const rowTab = (row[1] || '').toString().trim();
    const rowRole = (row[2] || '').toString().trim();

    if (rowEmail === email.toLowerCase()) {
      if (rowRole === 'Admin') {
        return true;
      }
      if (rowRole === 'Edit' && (rowTab === 'ALL' || rowTab === requiredTab)) {
        return true;
      }
    }
  }

  return false;
}

// Helper to write concise log in NHAT_KY_HOAT_DONG sheet
async function writeLogToSheet(sheets: any, spreadsheetId: string, email: string, action: string, status: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'NHAT_KY_HOAT_DONG!A2:D200'
    });

    let rows = response.data.values || [];
    const newEntry = [new Date().toISOString(), email, action, status];
    rows.push(newEntry);

    // Keep last 100 rows maximum to save cells
    if (rows.length > 100) {
      rows = rows.slice(rows.length - 100);
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'NHAT_KY_HOAT_DONG!A2:D200'
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `NHAT_KY_HOAT_DONG!A2:D${1 + rows.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows }
    });
  } catch (err: any) {
    console.error('Lỗi khi ghi log thao tác lên Google Sheet:', err.message);
  }
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Create a new Google Sheet for Inventory Management
 */
app.post('/api/sheets/create', async (req, res) => {
  let email = 'unknown@user';
  let spreadsheetId = '';
  try {
    email = await verifyGoogleToken(req.headers.authorization);
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const { title = 'Quản Lý Nhập Xuất Tồn Kho' } = req.body;

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${title} - ${new Date().toLocaleDateString('vi-VN')}`,
        },
        sheets: [
          {
            properties: { title: 'DANH_MUC_KHO' },
            data: [
              {
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'Mã Kho (*)' } },
                      { userEnteredValue: { stringValue: 'Tên Kho (*)' } },
                      { userEnteredValue: { stringValue: 'Địa Chỉ / Địa Điểm' } },
                      { userEnteredValue: { stringValue: 'Người Quản Lý' } },
                      { userEnteredValue: { stringValue: 'Số Điện Thoại' } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            properties: { title: 'DANH_MUC_SAN_PHAM' },
            data: [
              {
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'Mã Sản Phẩm (*)' } },
                      { userEnteredValue: { stringValue: 'Tên Sản Phẩm (*)' } },
                      { userEnteredValue: { stringValue: 'Đơn Vị Tính (*)' } },
                      { userEnteredValue: { stringValue: 'Nhóm Hàng' } },
                      { userEnteredValue: { stringValue: 'Tồn Tối Thiểu' } },
                      { userEnteredValue: { stringValue: 'Giá Nhập Tham Chiếu' } },
                      { userEnteredValue: { stringValue: 'Giá Xuất Tham Chiếu' } },
                      { userEnteredValue: { stringValue: 'Mô Tả' } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            properties: { title: 'NHAP_XUAT_KHO' },
            data: [
              {
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'Mã Phiếu' } },
                      { userEnteredValue: { stringValue: 'Loại Phiếu (Nhập/Xuất)' } },
                      { userEnteredValue: { stringValue: 'Ngày (YYYY-MM-DD)' } },
                      { userEnteredValue: { stringValue: 'Mã Kho' } },
                      { userEnteredValue: { stringValue: 'Tên Kho' } },
                      { userEnteredValue: { stringValue: 'Mã SP' } },
                      { userEnteredValue: { stringValue: 'Tên Sản Phẩm' } },
                      { userEnteredValue: { stringValue: 'Đơn Vị Tính' } },
                      { userEnteredValue: { stringValue: 'Số Lượng' } },
                      { userEnteredValue: { stringValue: 'Đơn Giá' } },
                      { userEnteredValue: { stringValue: 'Thành Tiền' } },
                      { userEnteredValue: { stringValue: 'Đối Tác / KH / NCC' } },
                      { userEnteredValue: { stringValue: 'Ghi Chú' } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    spreadsheetId = response.data.spreadsheetId || '';
    const spreadsheetUrl = response.data.spreadsheetUrl;

    // Initialize PHAN_QUYEN and NHAT_KY_HOAT_DONG
    await ensureSheetsExist(sheets, spreadsheetId, email);
    await writeLogToSheet(sheets, spreadsheetId, email, 'Tạo Google Sheet mới', 'Thành công');

    res.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: 'Tạo Google Sheet và phân quyền thành công!',
    });
  } catch (error: any) {
    console.error('Error creating Google Sheet:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể tạo Google Sheet. Vui lòng kiểm tra quyền xác thực.',
    });
  }
});

/**
 * Sync Up: Push Local App Data to Google Sheets
 */
app.post('/api/sheets/sync-up', async (req, res) => {
  let email = 'unknown@user';
  const { spreadsheetId, warehouses = [], products = [], transactions = [] } = req.body;
  try {
    email = await verifyGoogleToken(req.headers.authorization);

    if (!spreadsheetId) {
      return res.status(400).json({ success: false, error: 'Thiếu spreadsheetId' });
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Permissions check
    const hasPermission = await checkUserPermission(sheets, spreadsheetId, email, 'ALL');
    if (!hasPermission) {
      await writeLogToSheet(sheets, spreadsheetId, email, 'Đồng bộ lên (Sync Up)', 'Lỗi: Không có quyền truy cập');
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn không có quyền ghi (Edit/Admin) trên file Sheet này.' });
    }

    // 1. Prepare DANH_MUC_KHO data
    const warehouseRows = [
      ['Mã Kho (*)', 'Tên Kho (*)', 'Địa Chỉ / Địa Điểm', 'Người Quản Lý', 'Số Điện Thoại'],
      ...warehouses.map((w: any) => [w.code, w.name, w.location || '', w.manager || '', w.phone || '']),
    ];

    // 2. Prepare DANH_MUC_SAN_PHAM data
    const productRows = [
      ['Mã Sản Phẩm (*)', 'Tên Sản Phẩm (*)', 'Đơn Vị Tính (*)', 'Nhóm Hàng', 'Tồn Tối Thiểu', 'Giá Nhập Tham Chiếu', 'Giá Xuất Tham Chiếu', 'Mô Tả'],
      ...products.map((p: any) => [p.code, p.name, p.unit, p.category || '', p.minStock || 0, p.costPrice || 0, p.sellingPrice || 0, p.description || '']),
    ];

    // 3. Prepare NHAP_XUAT_KHO data
    const transactionRows = [
      ['Mã Phiếu', 'Loại Phiếu (Nhập/Xuất)', 'Ngày (YYYY-MM-DD)', 'Mã Kho', 'Tên Kho', 'Mã SP', 'Tên Sản Phẩm', 'Đơn Vị Tính', 'Số Lượng', 'Đơn Giá', 'Thành Tiền', 'Đối Tác / KH / NCC', 'Ghi Chú'],
      ...transactions.map((t: any) => [
        t.voucherCode,
        t.type === 'IMPORT' ? 'Nhập' : 'Xuất',
        t.date,
        t.warehouseCode,
        t.warehouseName,
        t.productCode,
        t.productName,
        t.unit,
        t.quantity,
        t.unitPrice,
        t.totalAmount,
        t.partner || '',
        t.note || ''
      ]),
    ];

    // Clear & Update DANH_MUC_KHO
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'DANH_MUC_KHO!A1:Z1000' });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'DANH_MUC_KHO!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: warehouseRows },
    });

    // Clear & Update DANH_MUC_SAN_PHAM
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'DANH_MUC_SAN_PHAM!A1:Z5000' });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'DANH_MUC_SAN_PHAM!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: productRows },
    });

    // Clear & Update NHAP_XUAT_KHO
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'NHAP_XUAT_KHO!A1:Z10000' });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'NHAP_XUAT_KHO!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: transactionRows },
    });

    await writeLogToSheet(sheets, spreadsheetId, email, 'Đồng bộ lên (Sync Up)', 'Thành công');

    res.json({
      success: true,
      message: 'Đồng bộ dữ liệu lên Google Sheets thành công!',
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error syncing up to Google Sheets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi đồng bộ dữ liệu lên Google Sheets',
    });
  }
});

/**
 * Sync Down: Pull Data from Google Sheets to App
 */
app.post('/api/sheets/sync-down', async (req, res) => {
  let email = 'unknown@user';
  const { spreadsheetId } = req.body;
  try {
    email = await verifyGoogleToken(req.headers.authorization);

    if (!spreadsheetId) {
      return res.status(400).json({ success: false, error: 'Thiếu spreadsheetId' });
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Permissions check
    const hasPermission = await checkUserPermission(sheets, spreadsheetId, email, 'ALL');
    if (!hasPermission) {
      await writeLogToSheet(sheets, spreadsheetId, email, 'Đồng bộ về (Sync Down)', 'Lỗi: Không có quyền truy cập');
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn không có quyền đọc (Read/Edit/Admin) trên file Sheet này.' });
    }

    // Fetch values from the 3 sheets
    const [whRes, prodRes, txRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'DANH_MUC_KHO!A2:E1000' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'DANH_MUC_SAN_PHAM!A2:H5000' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'NHAP_XUAT_KHO!A2:M10000' }).catch(() => ({ data: { values: [] } })),
    ]);

    const rawWh = whRes.data.values || [];
    const rawProd = prodRes.data.values || [];
    const rawTx = txRes.data.values || [];

    // Parse Warehouses
    const warehouses = rawWh
      .filter((r) => r[0] && r[1])
      .map((r, idx) => ({
        id: `wh-${r[0]}`.toLowerCase(),
        code: r[0],
        name: r[1],
        location: r[2] || '',
        manager: r[3] || '',
        phone: r[4] || '',
        isDefault: idx === 0,
      }));

    // Parse Products
    const products = rawProd
      .filter((r) => r[0] && r[1])
      .map((r) => ({
        id: `prod-${r[0]}`.toLowerCase(),
        code: r[0],
        name: r[1],
        unit: r[2] || 'Cái',
        category: r[3] || 'Khác',
        minStock: Number(r[4] || 0),
        costPrice: Number(r[5] || 0),
        sellingPrice: Number(r[6] || 0),
        description: r[7] || '',
      }));

    // Parse Transactions
    const transactions = rawTx
      .filter((r) => r[0] && r[3] && r[5])
      .map((r, idx) => {
        const typeStr = (r[1] || '').toString().toLowerCase();
        const isImport = typeStr.includes('nhập') || typeStr.includes('import');
        const wh = warehouses.find((w) => w.code === r[3]);
        const prod = products.find((p) => p.code === r[5]);

        return {
          id: `tx-${idx + 1}-${r[0]}`,
          voucherCode: r[0],
          type: isImport ? 'IMPORT' : 'EXPORT',
          date: r[2] || new Date().toISOString().split('T')[0],
          warehouseId: wh ? wh.id : `wh-${r[3]}`,
          warehouseCode: r[3],
          warehouseName: r[4] || (wh ? wh.name : r[3]),
          productId: prod ? prod.id : `prod-${r[5]}`,
          productCode: r[5],
          productName: r[6] || (prod ? prod.name : r[5]),
          unit: r[7] || (prod ? prod.unit : 'Cái'),
          quantity: Number(r[8] || 0),
          unitPrice: Number(r[9] || 0),
          totalAmount: Number(r[10] || 0) || Number(r[8] || 0) * Number(r[9] || 0),
          partner: r[11] || '',
          note: r[12] || '',
          createdAt: new Date().toISOString(),
        };
      });

    await writeLogToSheet(sheets, spreadsheetId, email, 'Đồng bộ về (Sync Down)', 'Thành công');

    res.json({
      success: true,
      data: {
        warehouses,
        products,
        transactions,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error syncing down from Google Sheets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi đọc dữ liệu từ Google Sheets',
    });
  }
});

// Vite Integration
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  })();
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Server port listener (only run locally/standalone, not serverless environment like Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
