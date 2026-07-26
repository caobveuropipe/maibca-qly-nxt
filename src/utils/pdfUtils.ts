import jsPDF from 'jspdf';
import { StockSummaryItem, StockCardItem, Product, Transaction } from '../types';

/**
 * Remove Vietnamese accents if fallback is ever required
 */
export const removeAccents = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

/**
 * Format currency VND
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNum = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Printable Voucher PDF (Phieu Nhap / Phieu Xuat Kho - Full Vietnamese Unicode Canvas)
 */
export const generateVoucherPDF = (
  transactionInput: Transaction | Transaction[],
  allTransactions?: Transaction[]
) => {
  let transactions = Array.isArray(transactionInput) ? transactionInput : [transactionInput];
  if (transactions.length === 1 && allTransactions) {
    const code = transactions[0].voucherCode;
    const group = allTransactions.filter((t) => t.voucherCode === code);
    if (group.length > 0) {
      transactions = group;
    }
  }
  if (transactions.length === 0) return;

  const main = transactions[0];
  const isImport = main.type === 'IMPORT';

  const canvas = document.createElement('canvas');
  const width = 1200;
  const rowHeight = 44;
  const headerHeight = 380;
  const footerHeight = 260;
  const tableHeight = (transactions.length + 1) * rowHeight + 50;
  const height = Math.max(1600, headerHeight + tableHeight + footerHeight);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Top Organization Banner
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 20px Arial, "Segoe UI", sans-serif';
  ctx.fillText('HỆ THỐNG QUẢN LÝ KHO (IMS PRO)', 60, 55);

  // Title
  const brandColor = isImport ? '#0F7B40' : '#1A73E8';
  ctx.fillStyle = brandColor;
  ctx.font = 'bold 36px Arial, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isImport ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO', width / 2, 115);

  // Subtitles
  ctx.fillStyle = '#334155';
  ctx.font = '22px Arial, "Segoe UI", sans-serif';
  ctx.fillText(`Số phiếu: ${main.voucherCode}`, width / 2, 155);
  ctx.fillText(`Ngày lập: ${main.date}`, width / 2, 188);

  // Line divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 210);
  ctx.lineTo(width - 60, 210);
  ctx.stroke();

  // Info Block
  ctx.textAlign = 'left';
  ctx.font = 'bold 22px Arial, "Segoe UI", sans-serif';
  ctx.fillStyle = '#0F172A';

  const labelPartner = isImport ? 'Đối tác / Nhà cung cấp:' : 'Khách hàng / Bộ phận:';
  ctx.fillText(labelPartner, 60, 255);
  ctx.font = '22px Arial, "Segoe UI", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(main.partner || (isImport ? 'Nhà cung cấp vãng lai' : 'Khách lẻ'), 330, 255, 800);

  ctx.font = 'bold 22px Arial, "Segoe UI", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Kho hàng:', 60, 295);
  ctx.font = '22px Arial, "Segoe UI", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`${main.warehouseName} (${main.warehouseCode})`, 330, 295, 800);

  ctx.font = 'bold 22px Arial, "Segoe UI", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Diễn giải / Lý do:', 60, 335);
  ctx.font = '22px Arial, "Segoe UI", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(main.note || '---', 330, 335, 800);

  // Table Setup
  let startY = 370;
  const cols = [
    { label: 'STT', x: 60, w: 70, align: 'center' },
    { label: 'Kho', x: 130, w: 120, align: 'left' },
    { label: 'Mã SP', x: 250, w: 150, align: 'left' },
    { label: 'Tên Mặt Hàng', x: 400, w: 430, align: 'left' },
    { label: 'ĐVT', x: 830, w: 100, align: 'center' },
    { label: 'Số Lượng', x: 930, w: 120, align: 'right' },
    { label: 'Ghi Chú', x: 1050, w: 90, align: 'left' },
  ];

  // Header Row
  ctx.fillStyle = brandColor;
  ctx.fillRect(60, startY, width - 120, 48);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Arial, "Segoe UI", sans-serif';
  cols.forEach((col) => {
    const posX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 12 : col.x + 10;
    ctx.textAlign = col.align as CanvasTextAlign;
    ctx.fillText(col.label, posX, startY + 31);
  });

  startY += 48;
  let totalQty = 0;

  // Body Rows
  transactions.forEach((tx, idx) => {
    totalQty += Number(tx.quantity) || 0;
    const isEven = idx % 2 === 0;
    ctx.fillStyle = isEven ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(60, startY, width - 120, rowHeight);

    // Border line
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, startY, width - 120, rowHeight);

    ctx.fillStyle = '#1E293B';
    ctx.font = '20px Arial, "Segoe UI", sans-serif';

    const values = [
      (idx + 1).toString(),
      tx.warehouseCode,
      tx.productCode,
      tx.productName,
      tx.unit,
      formatNum(tx.quantity),
      tx.note || '',
    ];

    cols.forEach((col, i) => {
      const posX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 12 : col.x + 10;
      ctx.textAlign = col.align as CanvasTextAlign;
      ctx.fillText(values[i], posX, startY + 28, col.w - 15);
    });

    startY += rowHeight;
  });

  // Total Row
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(60, startY, width - 120, 48);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(60, startY, width - 120, 48);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Arial, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TỔNG CỘNG', 400 + 10, startY + 31);

  ctx.textAlign = 'right';
  ctx.fillText(formatNum(totalQty), 930 + 120 - 12, startY + 31);

  // Signatures
  startY += 90;
  const sigCols = [
    { title: 'Người Lập Phiếu', x: 200 },
    { title: isImport ? 'Người Giao Hàng' : 'Người Nhận Hàng', x: 600 },
    { title: 'Thủ Kho', x: 1000 },
  ];

  ctx.textAlign = 'center';
  sigCols.forEach((col) => {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px Arial, "Segoe UI", sans-serif';
    ctx.fillText(col.title, col.x, startY);

    ctx.fillStyle = '#64748B';
    ctx.font = 'italic 18px Arial, "Segoe UI", sans-serif';
    ctx.fillText('(Ký, họ tên)', col.x, startY + 28);
  });

  // Render to PDF
  const imgData = canvas.toDataURL('image/png');
  const pdfHeightMM = (height / width) * 148;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, pdfHeightMM],
  });

  doc.addImage(imgData, 'PNG', 0, 0, 148, pdfHeightMM);
  doc.save(`${main.voucherCode}.pdf`);
};

/**
 * Export Stock Summary Report to PDF with Full Vietnamese Unicode Support
 */
export const generateStockSummaryPDF = (
  items: StockSummaryItem[],
  warehouseName: string,
  fromDate: string,
  toDate: string
) => {
  const canvas = document.createElement('canvas');
  const width = 1600;
  const rowHeight = 42;
  const headerHeight = 240;
  const footerHeight = 220;
  const tableHeight = (items.length + 1) * rowHeight + 50;
  const height = Math.max(1131, headerHeight + tableHeight + footerHeight);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 32px Arial, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('BÁO CÁO TỔNG HỢP NHẬP XUẤT TỒN KHO', 60, 60);

  // Subtitles
  ctx.fillStyle = '#475569';
  ctx.font = '20px Arial, "Segoe UI", sans-serif';
  ctx.fillText(`Kho áp dụng: ${warehouseName}`, 60, 98);
  ctx.fillText(`Thời gian: Từ ${fromDate || 'Đầu kỳ'} đến ${toDate || 'Hiện tại'}`, 60, 130);
  ctx.fillText(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, 60, 162);

  // Table Setup
  let startY = 200;
  const cols = [
    { label: 'STT', x: 60, w: 70, align: 'center' },
    { label: 'Mã SP', x: 130, w: 160, align: 'left' },
    { label: 'Tên Sản Phẩm', x: 290, w: 450, align: 'left' },
    { label: 'ĐVT', x: 740, w: 100, align: 'center' },
    { label: 'Tồn Đầu Kỳ', x: 840, w: 170, align: 'right' },
    { label: 'Nhập Trong Kỳ', x: 1010, w: 170, align: 'right' },
    { label: 'Xuất Trong Kỳ', x: 1180, w: 170, align: 'right' },
    { label: 'Tồn Cuối Kỳ', x: 1350, w: 190, align: 'right' },
  ];

  // Header Row
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(60, startY, width - 120, 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 19px Arial, "Segoe UI", sans-serif';
  cols.forEach((col) => {
    const posX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 12 : col.x + 10;
    ctx.textAlign = col.align as CanvasTextAlign;
    ctx.fillText(col.label, posX, startY + 30);
  });

  startY += 46;

  let totalBeg = 0;
  let totalImp = 0;
  let totalExp = 0;
  let totalEnd = 0;

  // Body Rows
  items.forEach((item, idx) => {
    totalBeg += item.beginningQty;
    totalImp += item.importQty;
    totalExp += item.exportQty;
    totalEnd += item.endingQty;

    const isEven = idx % 2 === 0;
    ctx.fillStyle = isEven ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(60, startY, width - 120, rowHeight);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, startY, width - 120, rowHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = '19px Arial, "Segoe UI", sans-serif';

    const values = [
      (idx + 1).toString(),
      item.productCode,
      item.productName,
      item.unit,
      formatNum(item.beginningQty),
      formatNum(item.importQty),
      formatNum(item.exportQty),
      formatNum(item.endingQty),
    ];

    cols.forEach((col, i) => {
      const posX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 12 : col.x + 10;
      ctx.textAlign = col.align as CanvasTextAlign;
      ctx.fillText(values[i], posX, startY + 27, col.w - 15);
    });

    startY += rowHeight;
  });

  // Total Row
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(60, startY, width - 120, 46);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(60, startY, width - 120, 46);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px Arial, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TỔNG CỘNG', 290 + 10, startY + 30);

  const totals = [
    { x: 840, w: 170, val: totalBeg },
    { x: 1010, w: 170, val: totalImp },
    { x: 1180, w: 170, val: totalExp },
    { x: 1350, w: 190, val: totalEnd },
  ];

  ctx.textAlign = 'right';
  totals.forEach((t) => {
    ctx.fillText(formatNum(t.val), t.x + t.w - 12, startY + 30);
  });

  // Signatures
  startY += 80;
  const sigCols = [
    { title: 'Người Lập Báo Cáo', x: 260 },
    { title: 'Thủ Kho', x: 800 },
    { title: 'Kế Toán Trưởng', x: 1340 },
  ];

  ctx.textAlign = 'center';
  sigCols.forEach((col) => {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Arial, "Segoe UI", sans-serif';
    ctx.fillText(col.title, col.x, startY);

    ctx.fillStyle = '#64748B';
    ctx.font = 'italic 17px Arial, "Segoe UI", sans-serif';
    ctx.fillText('(Ký, họ tên)', col.x, startY + 26);
  });

  // PDF Export
  const imgData = canvas.toDataURL('image/png');
  const pdfHeightMM = (height / width) * 297;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, pdfHeightMM],
  });

  doc.addImage(imgData, 'PNG', 0, 0, 297, pdfHeightMM);
  doc.save(`Bao_Cao_NXT_${warehouseName}_${fromDate}_${toDate}.pdf`);
};

/**
 * Export Detailed Stock Card (Thẻ kho) to PDF with Full Vietnamese Unicode Support
 */
export const generateStockCardPDF = (
  product: Product,
  cardItems: StockCardItem[],
  warehouseName: string,
  fromDate: string,
  toDate: string
) => {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const rowHeight = 42;
  const headerHeight = 240;
  const footerHeight = 220;
  const tableHeight = cardItems.length * rowHeight + 50;
  const height = Math.max(1600, headerHeight + tableHeight + footerHeight);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 32px Arial, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THẺ KHO CHI TIẾT MẶT HÀNG', 60, 60);

  // Subtitles
  ctx.fillStyle = '#475569';
  ctx.font = '20px Arial, "Segoe UI", sans-serif';
  ctx.fillText(`Sản phẩm: [${product.code}] - ${product.name}`, 60, 98);
  ctx.fillText(`Đơn vị tính: ${product.unit} | Nhóm hàng: ${product.category || 'Thường'}`, 60, 130);
  ctx.fillText(`Kho áp dụng: ${warehouseName} | Tuần/Tháng: ${fromDate || 'Đầu kỳ'} đến ${toDate || 'Hiện tại'}`, 60, 162);

  // Table Setup
  let startY = 200;
  const cols = [
    { label: 'Ngày', x: 60, w: 140, align: 'center' },
    { label: 'Mã Phiếu', x: 200, w: 180, align: 'center' },
    { label: 'Diễn Giải / Đối Tác', x: 380, w: 420, align: 'left' },
    { label: 'Nhập', x: 800, w: 120, align: 'right' },
    { label: 'Xuất', x: 920, w: 120, align: 'right' },
    { label: 'Tồn', x: 1040, w: 100, align: 'right' },
  ];

  // Header Row
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(60, startY, width - 120, 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 19px Arial, "Segoe UI", sans-serif';
  cols.forEach((col) => {
    const posX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 12 : col.x + 10;
    ctx.textAlign = col.align as CanvasTextAlign;
    ctx.fillText(col.label, posX, startY + 30);
  });

  startY += 46;

  // Body Rows
  cardItems.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    ctx.fillStyle = isEven ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(60, startY, width - 120, rowHeight);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, startY, width - 120, rowHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = '19px Arial, "Segoe UI", sans-serif';

    const values = [
      item.date,
      item.voucherCode,
      `${item.note ? item.note + ' - ' : ''}${item.partner}`,
      item.importQty ? formatNum(item.importQty) : '-',
      item.exportQty ? formatNum(item.exportQty) : '-',
      formatNum(item.runningBalance),
    ];

    cols.forEach((col, i) => {
      const posX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 12 : col.x + 10;
      ctx.textAlign = col.align as CanvasTextAlign;
      ctx.fillText(values[i], posX, startY + 27, col.w - 15);
    });

    startY += rowHeight;
  });

  // Signatures
  startY += 80;
  const sigCols = [
    { title: 'Người Lập Thẻ Kho', x: 300 },
    { title: 'Thủ Kho', x: 900 },
  ];

  ctx.textAlign = 'center';
  sigCols.forEach((col) => {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Arial, "Segoe UI", sans-serif';
    ctx.fillText(col.title, col.x, startY);

    ctx.fillStyle = '#64748B';
    ctx.font = 'italic 17px Arial, "Segoe UI", sans-serif';
    ctx.fillText('(Ký, họ tên)', col.x, startY + 26);
  });

  // PDF Export
  const imgData = canvas.toDataURL('image/png');
  const pdfHeightMM = (height / width) * 210;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, pdfHeightMM],
  });

  doc.addImage(imgData, 'PNG', 0, 0, 210, pdfHeightMM);
  doc.save(`The_Kho_${product.code}_${fromDate}_${toDate}.pdf`);
};
