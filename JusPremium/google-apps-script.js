/**
 * AURUM JUICE CO. — Google Apps Script
 * ======================================
 * CARA SETUP:
 * 1. Buka Google Sheets baru → beri nama "Aurum Orders"
 * 2. Buka Extensions → Apps Script
 * 3. Hapus kode default, paste seluruh kode ini
 * 4. Klik Deploy → New Deployment
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Klik Deploy → salin URL deployment
 * 6. Tempel URL tersebut ke variabel APPS_SCRIPT_URL di app.js
 */

const SHEET_NAME = 'Pesanan';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Buat sheet jika belum ada
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Buat header
      const headers = [
        'ID Pesanan', 'Waktu', 'Nama', 'WhatsApp', 'Email',
        'Alamat', 'Catatan', 'Item Pesanan', 'Total', 'Status'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // Style header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#C9A84C');
      headerRange.setFontColor('#0D0D0B');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Tambah baris baru
    sheet.appendRow([
      data.orderId,
      data.waktu,
      data.nama,
      data.wa,
      data.email || '-',
      data.alamat,
      data.catatan || '-',
      data.items,
      data.total,
      data.status
    ]);

    // Auto-resize kolom
    sheet.autoResizeColumns(1, 10);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Untuk test via GET (opsional)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Aurum Apps Script aktif ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}
