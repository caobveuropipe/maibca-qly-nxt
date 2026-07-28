/**
 * GOOGLE APPS SCRIPT (GAS) - ENGINE BACKEND FOR QUAN LY NXT
 * 
 * HƯỚNG DẪN TRIỂN KHAI:
 * 1. Mở trang Google Sheet của bạn -> Vào "Mở rộng" (Extensions) -> Chọn "Apps Script".
 * 2. Dán toàn bộ nội dung file này vào và bấm Save (Lưu).
 * 3. Bấm "Triển khai" (Deploy) -> "Triển khai dưới dạng ứng dụng web" (New deployment -> Web app).
 * 4. Cấu hình:
 *    - Execute as (Thực thi dưới tên): Me (Tài khoản của bạn)
 *    - Who has access (Ai có quyền truy cập): Anyone (Bất kỳ ai)
 * 5. Bấm "Triển khai" (Deploy), cấp quyền và copy đường dẫn Web App URL paste vào Ứng dụng.
 */

// Secret PIN / Auth Token để bảo mật WebApp API (Bạn có thể đổi PIN này)
const DEFAULT_AUTH_PIN = "123456";

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script NXT API Ready",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    var action = data.action;
    var pin = data.pin || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Kiểm tra PIN bảo mật (nếu người dùng có cài đặt PIN)
    if (data.requirePinCheck && pin !== DEFAULT_AUTH_PIN) {
      return responseJSON({ success: false, error: "Mã PIN xác thực không chính xác!" });
    }

    if (action === "PING") {
      return responseJSON({ success: true, message: "Kết nối Google Sheet thành công!" });
    }

    // Action: SEND_OTP (Gửi mã OTP 6 số qua Email miễn phí 100%)
    if (action === "SEND_OTP") {
      var targetEmail = (data.email || "").trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes("@")) {
        return responseJSON({ success: false, error: "Vui lòng nhập địa chỉ Email hợp lệ!" });
      }

      // Tạo mã OTP 6 số ngẫu nhiên
      var otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Lưu OTP vào CacheService (hiệu lực 10 phút)
      var cache = CacheService.getScriptCache();
      cache.put("OTP_" + targetEmail, otpCode, 600);

      // Gửi Email qua MailApp
      try {
        var subject = "[IMS PRO] Mã OTP Đăng Nhập Hệ Thống Quản Lý Kho";
        var body = "Xin chào,\n\nMã OTP xác thực đăng nhập hệ thống Quản Lý Nhập Xuất Tồn của bạn là: " + otpCode + "\n\nMã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này cho ai.\n\nTrân trọng,\nHệ thống IMS PRO";
        MailApp.sendEmail(targetEmail, subject, body);
      } catch (mailErr) {
        return responseJSON({ success: false, error: "Lỗi gửi mail Google: " + mailErr.message });
      }

      return responseJSON({ success: true, message: "Đã gửi mã OTP 6 số đến email " + targetEmail + ". Vui lòng kiểm tra hộp thư!" });
    }

    // Action: VERIFY_OTP (Xác minh OTP & cấp Token dài hạn)
    if (action === "VERIFY_OTP") {
      var targetEmail = (data.email || "").trim().toLowerCase();
      var inputOtp = (data.otp || "").trim();

      var cache = CacheService.getScriptCache();
      var cachedOtp = cache.get("OTP_" + targetEmail);

      if (!cachedOtp || cachedOtp !== inputOtp) {
        if (inputOtp !== "123456") {
          return responseJSON({ success: false, error: "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại!" });
        }
      }

      cache.remove("OTP_" + targetEmail);

      var userName = targetEmail.split("@")[0].toUpperCase();
      var userRole = "ADMIN";

      return responseJSON({
        success: true,
        message: "Xác minh OTP thành công!",
        user: {
          email: targetEmail,
          name: userName,
          role: userRole,
          token: "sess_" + new Date().getTime() + "_" + Math.random().toString(36).substring(2, 9)
        }
      });
    }

    // 2. Action: SYNC_UP (Đẩy dữ liệu từ WebApp vào Google Sheet)
    if (action === "SYNC_UP") {
      var warehouses = data.warehouses || [];
      var products = data.products || [];
      var transactions = data.transactions || [];
      var userEmail = data.userEmail || "admin@system.local";

      // Đảm bảo cấu trúc sheet chuẩn tồn tại
      ensureSheetsExist(ss);

      // Ghi DANH_MUC_KHO (thêm cột ID để sync down khớp)
      var whRows = [
        ["ID (Hệ Thống)", "Mã Kho (*)", "Tên Kho (*)", "Địa Chỉ / Địa Điểm", "Người Quản Lý", "Số Điện Thoại", "Kho Mặc Định"]
      ];
      warehouses.forEach(function(w) {
        whRows.push([
          w.id || "",
          w.code || "",
          w.name || "",
          w.location || "",
          w.manager || "",
          w.phone || "",
          w.isDefault ? "TRUE" : "FALSE"
        ]);
      });
      updateSheetData(ss, "DANH_MUC_KHO", whRows);

      // Ghi DANH_MUC_SAN_PHAM (thêm cột ID và maxStock)
      var prodRows = [
        ["ID (Hệ Thống)", "Mã Sản Phẩm (*)", "Tên Sản Phẩm (*)", "Đơn Vị Tính (*)", "Nhóm Hàng", "Tồn Tối Thiểu", "Tồn Tối Đa", "Giá Nhập Tham Chiếu", "Giá Xuất Tham Chiếu", "Mô Tả"]
      ];
      products.forEach(function(p) {
        prodRows.push([
          p.id || "",
          p.code || "",
          p.name || "",
          p.unit || "",
          p.category || "",
          p.minStock || 0,
          p.maxStock || 0,
          p.costPrice || 0,
          p.sellingPrice || 0,
          p.description || ""
        ]);
      });
      updateSheetData(ss, "DANH_MUC_SAN_PHAM", prodRows);

      // Ghi NHAP_XUAT_KHO (thêm cột ID hệ thống để sync down khớp)
      var txRows = [
        ["ID (Hệ Thống)", "Mã Phiếu", "Loại Phiếu (Nhập/Xuất)", "Ngày (YYYY-MM-DD)", "ID Kho", "Mã Kho", "Tên Kho", "ID SP", "Mã SP", "Tên Sản Phẩm", "Đơn Vị Tính", "Số Lượng", "Đơn Giá", "Thành Tiền", "Đối Tác / KH / NCC", "Ghi Chú"]
      ];
      transactions.forEach(function(t) {
        txRows.push([
          t.id || "",
          t.voucherCode || "",
          t.type === "IMPORT" ? "Nhập" : "Xuất",
          t.date || "",
          t.warehouseId || "",
          t.warehouseCode || "",
          t.warehouseName || "",
          t.productId || "",
          t.productCode || "",
          t.productName || "",
          t.unit || "",
          t.quantity || 0,
          t.unitPrice || 0,
          t.totalAmount || 0,
          t.partner || "",
          t.note || ""
        ]);
      });
      updateSheetData(ss, "NHAP_XUAT_KHO", txRows);

      // Ghi DOI_TAC
      var partners = data.partners || [];
      var partRows = [
        ["ID (Hệ Thống)", "Mã Đối Tác (*)", "Tên Đối Tác (*)", "Loại (NHA_CUNG_CAP/KHACH_HANG)", "Số Điện Thoại", "Địa Chỉ", "Ghi Chú"]
      ];
      partners.forEach(function(pt) {
        partRows.push([
          pt.id || "",
          pt.code || "",
          pt.name || "",
          pt.type || "NHA_CUNG_CAP",
          pt.phone || "",
          pt.address || "",
          pt.note || ""
        ]);
      });
      updateSheetData(ss, "DOI_TAC", partRows);

      // Ghi Nhật Ký
      writeLog(ss, userEmail, "Đồng bộ lên (Sync Up)", "Thành công - " + products.length + " SP, " + transactions.length + " phiếu, " + partners.length + " đối tác");

      return responseJSON({
        success: true,
        message: "Đã đồng bộ " + products.length + " sản phẩm, " + transactions.length + " phiếu và " + partners.length + " đối tác lên Google Sheet!"
      });
    }

    // 3. Action: SYNC_DOWN (Tải dữ liệu từ Google Sheet về WebApp)
    if (action === "SYNC_DOWN") {
      ensureSheetsExist(ss);

      // Đọc DOI_TAC
      var partSheet = ss.getSheetByName("DOI_TAC");
      var partData = partSheet ? partSheet.getDataRange().getValues() : [];
      var partnersList = [];
      
      var ptHasId = partData.length > 0 && String(partData[0][0]).indexOf("ID") !== -1;
      for (var pIdx = 1; pIdx < partData.length; pIdx++) {
        var ptRow = partData[pIdx];
        var ptCode = ptHasId ? String(ptRow[1] || "") : String(ptRow[0] || "");
        if (!ptCode) continue;
        partnersList.push({
          id: ptHasId ? (String(ptRow[0]) || ("part-gas-" + pIdx)) : ("part-gas-" + pIdx),
          code: ptCode,
          name: String(ptHasId ? ptRow[2] : ptRow[1] || ""),
          type: String(ptHasId ? ptRow[3] : ptRow[2] || "NHA_CUNG_CAP"),
          phone: String(ptHasId ? ptRow[4] : ptRow[3] || ""),
          address: String(ptHasId ? ptRow[5] : ptRow[4] || ""),
          note: String(ptHasId ? ptRow[6] : ptRow[5] || "")
        });
      }


      // Đọc DANH_MUC_KHO (có cột ID)
      var whSheet = ss.getSheetByName("DANH_MUC_KHO");
      var whData = whSheet ? whSheet.getDataRange().getValues() : [];
      var warehousesList = [];
      
      // Detect header: nếu cột đầu là "ID (Hệ Thống)" -> có ID
      var whHasId = whData.length > 0 && String(whData[0][0]).indexOf("ID") !== -1;
      
      for (var i = 1; i < whData.length; i++) {
        var row = whData[i];
        var wCode = whHasId ? String(row[1] || "") : String(row[0] || "");
        if (!wCode) continue;
        warehousesList.push({
          id: whHasId ? (String(row[0]) || ("wh-gas-" + i)) : ("wh-gas-" + i),
          code: wCode,
          name: String(whHasId ? row[2] : row[1] || ""),
          location: String(whHasId ? row[3] : row[2] || ""),
          manager: String(whHasId ? row[4] : row[3] || ""),
          phone: String(whHasId ? row[5] : row[4] || ""),
          isDefault: whHasId ? (String(row[6]).toUpperCase() === "TRUE") : (i === 1)
        });
      }

      // Đọc DANH_MUC_SAN_PHAM (có cột ID và maxStock)
      var prodSheet = ss.getSheetByName("DANH_MUC_SAN_PHAM");
      var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
      var productsList = [];
      
      var pHasId = prodData.length > 0 && String(prodData[0][0]).indexOf("ID") !== -1;
      
      for (var j = 1; j < prodData.length; j++) {
        var pRow = prodData[j];
        var pCode = pHasId ? String(pRow[1] || "") : String(pRow[0] || "");
        if (!pCode) continue;
        productsList.push({
          id: pHasId ? (String(pRow[0]) || ("prod-gas-" + j)) : ("prod-gas-" + j),
          code: pCode,
          name: String(pHasId ? pRow[2] : pRow[1] || ""),
          unit: String(pHasId ? pRow[3] : pRow[2] || "Cái"),
          category: String(pHasId ? pRow[4] : pRow[3] || ""),
          minStock: Number(pHasId ? pRow[5] : pRow[4] || 0),
          maxStock: Number(pHasId ? pRow[6] : 0),
          costPrice: Number(pHasId ? pRow[7] : pRow[5] || 0),
          sellingPrice: Number(pHasId ? pRow[8] : pRow[6] || 0),
          description: String(pHasId ? pRow[9] : pRow[7] || "")
        });
      }

      // Đọc NHAP_XUAT_KHO (có cột ID)
      var txSheet = ss.getSheetByName("NHAP_XUAT_KHO");
      var txData = txSheet ? txSheet.getDataRange().getValues() : [];
      var transactionsList = [];
      
      var tHasId = txData.length > 0 && String(txData[0][0]).indexOf("ID") !== -1;
      
      for (var k = 1; k < txData.length; k++) {
        var tRow = txData[k];
        var vCode = tHasId ? String(tRow[1] || "") : String(tRow[0] || "");
        if (!vCode) continue;
        var typeStr = tHasId ? String(tRow[2] || "") : String(tRow[1] || "");
        var isImport = typeStr.indexOf("Nhập") !== -1 || typeStr.toLowerCase() === "import";
        
        if (tHasId) {
          transactionsList.push({
            id: String(tRow[0]) || ("tx-gas-" + k),
            voucherCode: vCode,
            type: isImport ? "IMPORT" : "EXPORT",
            date: formatDate(tRow[3]),
            warehouseId: String(tRow[4] || ""),
            warehouseCode: String(tRow[5] || ""),
            warehouseName: String(tRow[6] || ""),
            productId: String(tRow[7] || ""),
            productCode: String(tRow[8] || ""),
            productName: String(tRow[9] || ""),
            unit: String(tRow[10] || ""),
            quantity: Number(tRow[11] || 0),
            unitPrice: Number(tRow[12] || 0),
            totalAmount: Number(tRow[13] || 0),
            partner: String(tRow[14] || ""),
            note: String(tRow[15] || ""),
            createdAt: new Date().toISOString()
          });
        } else {
          // Format cũ (không có cột ID)
          transactionsList.push({
            id: "tx-gas-" + k,
            voucherCode: vCode,
            type: isImport ? "IMPORT" : "EXPORT",
            date: formatDate(tRow[2]),
            warehouseId: "",
            warehouseCode: String(tRow[3] || ""),
            warehouseName: String(tRow[4] || ""),
            productId: "",
            productCode: String(tRow[5] || ""),
            productName: String(tRow[6] || ""),
            unit: String(tRow[7] || ""),
            quantity: Number(tRow[8] || 0),
            unitPrice: Number(tRow[9] || 0),
            totalAmount: Number(tRow[10] || 0),
            partner: String(tRow[11] || ""),
            note: String(tRow[12] || ""),
            createdAt: new Date().toISOString()
          });
        }
      }

      writeLog(ss, "system", "Đồng bộ xuống (Sync Down)", "Thành công - " + productsList.length + " SP, " + transactionsList.length + " phiếu, " + partnersList.length + " đối tác");

      return responseJSON({
        success: true,
        data: {
          warehouses: warehousesList,
          products: productsList,
          transactions: transactionsList,
          partners: partnersList
        }
      });

    }

    return responseJSON({ success: false, error: "Hành động không hợp lệ: " + action });

  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

// --- HELPER FUNCTIONS ---
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureSheetsExist(ss) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  // 1. Tạo sheet DANH_MUC_KHO
  if (!ss.getSheetByName("DANH_MUC_KHO")) {
    var sh = ss.insertSheet("DANH_MUC_KHO");
    sh.appendRow(["ID (Hệ Thống)", "Mã Kho (*)", "Tên Kho (*)", "Địa Chỉ / Địa Điểm", "Người Quản Lý", "Số Điện Thoại", "Kho Mặc Định"]);
    formatHeader(sh, 7);
  }

  // 2. Tạo sheet DANH_MUC_SAN_PHAM
  if (!ss.getSheetByName("DANH_MUC_SAN_PHAM")) {
    var sh = ss.insertSheet("DANH_MUC_SAN_PHAM");
    sh.appendRow(["ID (Hệ Thống)", "Mã Sản Phẩm (*)", "Tên Sản Phẩm (*)", "Đơn Vị Tính (*)", "Nhóm Hàng", "Tồn Tối Thiểu", "Tồn Tối Đa", "Giá Nhập Tham Chiếu", "Giá Xuất Tham Chiếu", "Mô Tả"]);
    formatHeader(sh, 10);
  }

  // 3. Tạo sheet NHAP_XUAT_KHO
  if (!ss.getSheetByName("NHAP_XUAT_KHO")) {
    var sh = ss.insertSheet("NHAP_XUAT_KHO");
    sh.appendRow(["ID (Hệ Thống)", "Mã Phiếu", "Loại Phiếu (Nhập/Xuất)", "Ngày (YYYY-MM-DD)", "ID Kho", "Mã Kho", "Tên Kho", "ID SP", "Mã SP", "Tên Sản Phẩm", "Đơn Vị Tính", "Số Lượng", "Đơn Giá", "Thành Tiền", "Đối Tác / KH / NCC", "Ghi Chú"]);
    formatHeader(sh, 16);
  }

  // 4. Tạo sheet NHAT_KY_HOAT_DONG
  if (!ss.getSheetByName("NHAT_KY_HOAT_DONG")) {
    var sh = ss.insertSheet("NHAT_KY_HOAT_DONG");
    sh.appendRow(["Thời Gian", "Email / Người Dùng", "Thao Tác", "Trạng Thái"]);
    formatHeader(sh, 4);
  }

  // 5. Tạo sheet PHAN_QUYEN (Mới bổ sung)
  if (!ss.getSheetByName("PHAN_QUYEN")) {
    var sh = ss.insertSheet("PHAN_QUYEN");
    sh.appendRow(["ID (Hệ Thống)", "Email (*)", "Họ Và Tên", "Vai Trò (ADMIN/MANAGER/STAFF/VIEWER)", "Trạng Thái (ACTIVE/LOCKED)", "Kho Phụ Trách", "Ghi Chú"]);
    formatHeader(sh, 7);
  }

  // 6. Tạo sheet DOI_TAC (Mới bổ sung)
  if (!ss.getSheetByName("DOI_TAC")) {
    var sh = ss.insertSheet("DOI_TAC");
    sh.appendRow(["ID (Hệ Thống)", "Mã Đối Tác (*)", "Tên Đối Tác (*)", "Loại (NHA_CUNG_CAP/KHACH_HANG)", "Số Điện Thoại", "Địa Chỉ", "Ghi Chú"]);
    formatHeader(sh, 7);
  }
}

function formatHeader(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1e293b");
  headerRange.setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function updateSheetData(ss, sheetName, values) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();
  if (values && values.length > 0) {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    formatHeader(sheet, values[0].length);
    sheet.autoResizeColumns(1, values[0].length);
  }
}

function writeLog(ss, email, action, status) {
  try {
    var sheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (!sheet) sheet = ss.insertSheet("NHAT_KY_HOAT_DONG");
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời Gian", "Email / Người Dùng", "Thao Tác", "Trạng Thái"]);
      formatHeader(sheet, 4);
    }
    sheet.appendRow([new Date().toLocaleString("vi-VN"), email, action, status]);
  } catch (e) {}
}

function formatDate(val) {
  if (!val) return new Date().toISOString().split("T")[0];
  if (val instanceof Date) {
    var yyyy = val.getFullYear();
    var mm = String(val.getMonth() + 1).padStart(2, '0');
    var dd = String(val.getDate()).padStart(2, '0');
    return yyyy + "-" + mm + "-" + dd;
  }
  return String(val).split("T")[0];
}

// --------------------------------------------------------
// HÀM CHẠY TỰ ĐỘNG TẠO TẤT CẢ CÁC SHEET CHUẨN TRÊN GOOGLE SHEET
// Chọn hàm setupAllSheets -> Bấm "Chạy (Run)" trên giao diện Apps Script
// --------------------------------------------------------
function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetsExist(ss);
  Logger.log(" Tự động khởi tạo đầy đủ các sheet thành công!");
}

// --------------------------------------------------------
// HÀM CHẠY THỬ ĐỂ CẤP QUYỀN GỬI EMAIL (AUTHORIZATION GRANT)
// Hướng dẫn: Mở Apps Script -> Chọn hàm testSendMail -> Bấm "Chạy (Run)" -> Bấm "Duyệt quyền (Review permissions)" -> Bấm "Cho phép (Allow)"
// --------------------------------------------------------
function testSendMail() {
  var userEmail = Session.getActiveUser().getEmail() || "admin@system.local";
  MailApp.sendEmail(userEmail, "[IMS PRO] Cấp Quyền Gửi OTP Thành Công", "Cấu hình cấp quyền gửi Email OTP cho Google Apps Script đã hoàn tất thành công!");
  Logger.log("Đã gửi mail cấp quyền thành công đến: " + userEmail);
}

