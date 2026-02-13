// Google Apps Script - Serverless Backend
// Deployed as Web App -> Execute as: Me -> Access: Anyone

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse JSON body
    var data = JSON.parse(e.postData.contents);
    
    // Columns: Date, Name, Role, OtherDetail, Score, Percentage, RawAnswers
    var row = [
      new Date(),
      data.name,
      data.role,
      data.otherDetail || '',
      data.score,
      data.percentage,
      data.rawAnswers
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "row": row }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Convert headers and rows to array of objects
  // Assuming Row 1 is Headers: Date, Name, Role, OtherDetail, Score, Percentage, RawAnswers
  var headers = data[0];
  var rows = data.slice(1);
  
  var result = rows.map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

// Helper to setup sheet headers if empty
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = ["Date", "Name", "Role", "OtherDetail", "Score", "Percentage", "RawAnswers"];
  sheet.appendRow(headers);
}
