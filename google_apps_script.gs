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

    // 2. Action: SYNC_UP (Đẩy dữ liệu từ WebApp vào Google Sheet)
    if (action === "SYNC_UP") {
      var warehouses = data.warehouses || [];
      var products = data.products || [];
      var transactions = data.transactions || [];
      var userEmail = data.userEmail || "admin@system.local";

      // Đảm bảo cấu trúc sheet chuẩn tồn tại
      ensureSheetsExist(ss);

      // Ghi DANH_MUC_KHO
      var whRows = [
        ["Mã Kho (*)", "Tên Kho (*)", "Địa Chỉ / Địa Điểm", "Người Quản Lý", "Số Điện Thoại"]
      ];
      warehouses.forEach(function(w) {
        whRows.push([w.code || "", w.name || "", w.location || "", w.manager || "", w.phone || ""]);
      });
      updateSheetData(ss, "DANH_MUC_KHO", whRows);

      // Ghi DANH_MUC_SAN_PHAM
      var prodRows = [
        ["Mã Sản Phẩm (*)", "Tên Sản Phẩm (*)", "Đơn Vị Tính (*)", "Nhóm Hàng", "Tồn Tối Thiểu", "Giá Nhập Tham Chiếu", "Giá Xuất Tham Chiếu", "Mô Tả"]
      ];
      products.forEach(function(p) {
        prodRows.push([p.code || "", p.name || "", p.unit || "", p.category || "", p.minStock || 0, p.costPrice || 0, p.sellingPrice || 0, p.description || ""]);
      });
      updateSheetData(ss, "DANH_MUC_SAN_PHAM", prodRows);

      // Ghi NHAP_XUAT_KHO
      var txRows = [
        ["Mã Phiếu", "Loại Phiếu (Nhập/Xuất)", "Ngày (YYYY-MM-DD)", "Mã Kho", "Tên Kho", "Mã SP", "Tên Sản Phẩm", "Đơn Vị Tính", "Số Lượng", "Đơn Giá", "Thành Tiền", "Đối Tác / KH / NCC", "Ghi Chú"]
      ];
      transactions.forEach(function(t) {
        txRows.push([
          t.voucherCode || "",
          t.type === "IMPORT" ? "Nhập" : "Xuất",
          t.date || "",
          t.warehouseCode || "",
          t.warehouseName || "",
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

      // Ghi Nhật Ký
      writeLog(ss, userEmail, "Đồng bộ lên (Sync Up)", "Thành công");

      return responseJSON({
        success: true,
        message: "Đã đồng bộ " + products.length + " sản phẩm và " + transactions.length + " phiếu lên Google Sheet!"
      });
    }

    // 3. Action: SYNC_DOWN (Tải dữ liệu từ Google Sheet về WebApp)
    if (action === "SYNC_DOWN") {
      ensureSheetsExist(ss);

      // Đọc DANH_MUC_KHO
      var whSheet = ss.getSheetByName("DANH_MUC_KHO");
      var whData = whSheet ? whSheet.getDataRange().getValues() : [];
      var warehousesList = [];
      for (var i = 1; i < whData.length; i++) {
        var row = whData[i];
        if (row[0]) {
          warehousesList.push({
            id: "wh-gas-" + i,
            code: String(row[0]),
            name: String(row[1] || ""),
            location: String(row[2] || ""),
            manager: String(row[3] || ""),
            phone: String(row[4] || ""),
            isDefault: i === 1
          });
        }
      }

      // Đọc DANH_MUC_SAN_PHAM
      var prodSheet = ss.getSheetByName("DANH_MUC_SAN_PHAM");
      var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
      var productsList = [];
      for (var j = 1; j < prodData.length; j++) {
        var pRow = prodData[j];
        if (pRow[0]) {
          productsList.push({
            id: "prod-gas-" + j,
            code: String(pRow[0]),
            name: String(pRow[1] || ""),
            unit: String(pRow[2] || "Cái"),
            category: String(pRow[3] || ""),
            minStock: Number(pRow[4] || 0),
            costPrice: Number(pRow[5] || 0),
            sellingPrice: Number(pRow[6] || 0),
            description: String(pRow[7] || "")
          });
        }
      }

      // Đọc NHAP_XUAT_KHO
      var txSheet = ss.getSheetByName("NHAP_XUAT_KHO");
      var txData = txSheet ? txSheet.getDataRange().getValues() : [];
      var transactionsList = [];
      for (var k = 1; k < txData.length; k++) {
        var tRow = txData[k];
        if (tRow[0]) {
          var typeStr = String(tRow[1] || "").toLowerCase();
          var isImport = typeStr.indexOf("nhập") !== -1 || typeStr === "import";
          transactionsList.push({
            id: "tx-gas-" + k,
            voucherCode: String(tRow[0]),
            type: isImport ? "IMPORT" : "EXPORT",
            date: formatDate(tRow[2]),
            warehouseCode: String(tRow[3] || ""),
            warehouseName: String(tRow[4] || ""),
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

      return responseJSON({
        success: true,
        data: {
          warehouses: warehousesList,
          products: productsList,
          transactions: transactionsList
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
  var requiredSheets = ["DANH_MUC_KHO", "DANH_MUC_SAN_PHAM", "NHAP_XUAT_KHO", "NHAT_KY_HOAT_DONG"];
  requiredSheets.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
}

function updateSheetData(ss, sheetName, values) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();
  if (values && values.length > 0) {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  }
}

function writeLog(ss, email, action, status) {
  try {
    var sheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (!sheet) sheet = ss.insertSheet("NHAT_KY_HOAT_DONG");
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời Gian", "Email / Người Dùng", "Thao Tác", "Trạng Thái"]);
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
