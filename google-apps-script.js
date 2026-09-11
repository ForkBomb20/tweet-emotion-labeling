// Google Apps Script — paste this into the Apps Script editor
// (Extensions > Apps Script from your Google Sheet)
//
// Setup:
// 1. Create a new Google Sheet
// 2. Add headers in row 1: uid | timestamp | tweet_id | tweet_text | selected_label
// 3. Open Extensions > Apps Script
// 4. Replace the default code with this file's contents
// 5. Click Deploy > New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the deployment URL and paste it into SCRIPT_URL in app.js

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  data.rows.forEach(function (row) {
    sheet.appendRow([
      row.uid,
      row.timestamp,
      row.tweetId,
      row.tweetText,
      row.selectedLabel,
    ]);
  });

  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok" })
  ).setMimeType(ContentService.MimeType.JSON);
}
