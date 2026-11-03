/**
 * PocketWise Google Apps Script endpoint.
 * Setup: create a Google Sheet, open Extensions > Apps Script, paste this file,
 * set SHEET_ID below, then Deploy > New deployment > Web app.
 * Execute as: Me. Who has access: Anyone (only for fictional demo data).
 * Never use this public demo endpoint for real or sensitive financial records.
 */
const SHEET_ID = "PASTE_GOOGLE_SHEET_ID_HERE";
const TABS = ["Transactions", "Budgets", "Goals"];
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action !== "replaceAll") throw new Error("Unsupported action");
    const ss = SpreadsheetApp.openById(SHEET_ID);
    writeTab_(ss, "Transactions", ["id","type","amount","category","date","note"], payload.transactions || []);
    writeTab_(ss, "Budgets", ["category","limit"], payload.budgets || []);
    writeTab_(ss, "Goals", ["id","name","target","saved"], payload.goals || []);
    return json_({ok:true, message:"PocketWise data updated"});
  } catch (err) {
    return json_({ok:false, error:String(err.message || err)});
  }
}
function writeTab_(ss, name, headers, rows) {
  let sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  if (rows.length) {
    const values = rows.map(row => headers.map(h => row[h] === undefined ? "" : row[h]));
    sh.getRange(2,1,values.length,headers.length).setValues(values);
  }
  sh.setFrozenRows(1);
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}