/**
 * Surya Shakti Solar — website enquiries → Google Sheet + Google Drive
 *
 * Setup: open your Google Sheet → Extensions → Apps Script → paste this file.
 * Run setupSheet once, deploy as Web app (see README / SETUP-GOOGLE-SHEET.md).
 */

const SHEET_NAME = "Enquiries";
const FOLDER_NAME = "SSRE Bill Uploads";

/** Must match FORM_SECRET in js/config.js (empty = no check) */
const FORM_SECRET = "";

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
      "Bill Period",
      "Solar Capacity",
      "Notes",
      "Bill Current (Link)",
      "Bill Previous (Link)",
      "Page URL",
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function getOrCreateFolder_() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(FOLDER_NAME);
}

function saveFile_(fileObj, fallbackName) {
  if (!fileObj || !fileObj.base64) {
    return "";
  }
  const bytes = Utilities.base64Decode(fileObj.base64);
  const name = fileObj.name || fallbackName;
  const mime = fileObj.mimeType || "application/octet-stream";
  const blob = Utilities.newBlob(bytes, mime, name);
  const folder = getOrCreateFolder_();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
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
    const billPeriod =
      data.bill_period === "last_two_months" ? "Last 2 months" : "Current month";

    const billCurrentLink = saveFile_(data.bill_current, "bill-current");
    const billPreviousLink = saveFile_(data.bill_previous, "bill-previous");

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      billPeriod,
      data.solar_capacity || "",
      data.message || "",
      billCurrentLink,
      billPreviousLink,
      data.page_url || "",
    ]);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}