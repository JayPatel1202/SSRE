/**
 * Surya Shakti Solar — website enquiries → Google Sheet
 *
 * Setup: open your Google Sheet → Extensions → Apps Script → paste this file.
 * Run setupSheet once, deploy as Web app (see README / SETUP-GOOGLE-SHEET.md).
 */

const SHEET_NAME = "Enquiries";

/** Must match FORM_SECRET in js/config.js */
const FORM_SECRET = "SSRE_12022002";

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Submitted At",
      "Name",
      "Phone",
      "Average Bill (₹)",
      "Solar Capacity",
      "Notes",
      "Page URL",
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet() {
  return jsonResponse_({ ok: true, message: "SSRE enquiry endpoint is running." });
}

function doPost(e) {
  try {
    setupSheet();

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: "Missing POST body" });
    }

    const data = JSON.parse(e.postData.contents);

    if (FORM_SECRET && data.secret !== FORM_SECRET) {
      return jsonResponse_({ ok: false, error: "Unauthorized" });
    }

    if (data._gotcha) {
      return jsonResponse_({ ok: true });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const averageBill =
      data.average_bill ||
      data.bill_amount_current ||
      "";

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      averageBill,
      data.solar_capacity || "",
      data.message || "",
      data.page_url || "",
    ]);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}