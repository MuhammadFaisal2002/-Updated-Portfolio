# Visitor Log Setup

The site records one row per visitor in a Google Sheet: time, IP address, city, region, country, device, OS, browser, referrer, landing page, screen size, language, timezone and user agent.

When a visitor sends the contact form, their name and email are added to the `Name` and `Email` columns of their row (matched by IP address), and the row is highlighted. Visitors who never send the form stay anonymous.

Without `VISITOR_SHEET_URL` nothing is stored. The site works normally either way.

## Current setup

This is already set up for the live site:

- **Spreadsheet:** `Portfolio Visitors`, rows land in its `Visitors` tab.
- **Script:** the standalone Apps Script project `Portfolio Visitor Log`, deployed as a web app. It opens the spreadsheet by its ID, so it is not bound to the sheet.
- **Vercel:** `VISITOR_SHEET_URL` is set for Production.

The script also has a `setupSheet` function. Running it from the editor (choose `setupSheet`, press Run) formats the `Visitors` tab and rebuilds the `Dashboard` tab, which shows totals and breakdowns by country, device, browser and referrer. It is safe to run again and does not affect the deployed web app.

To change what is recorded, edit the script, then **Deploy → Manage deployments → Edit → New version**. That keeps the same URL, so nothing in Vercel needs to change.

## What it does and does not capture

- **Captured:** IP address, approximate location from the IP, device details, where the visitor came from, the page they landed on.
- **Not captured automatically:** name, email, phone. A name and email appear only for visitors who submit the contact form.
- **Skipped:** search-engine crawlers, link-preview bots, uptime monitors, and visitors whose browser sends Do Not Track or Global Privacy Control.
- **De-duplicated:** one row per browser session, and the same IP and browser at most once every 30 minutes.

## Setting it up again from scratch

Use a **new** spreadsheet for this. Do not paste the script into the contact form's spreadsheet: that project already has its own `doPost`, and two would conflict.

1. Go to <https://sheets.new> and name the spreadsheet `Portfolio Visitors`.
2. In the menu choose **Extensions → Apps Script**.
3. Delete whatever is in the editor and paste the script below. Set `SPREADSHEET_ID` to this spreadsheet's ID.
4. Choose `setupSheet` in the toolbar and press **Run** once. Approve the permission prompt. This creates and formats the `Visitors` and `Dashboard` tabs.
5. Click **Deploy → New deployment**.
6. Click the gear next to "Select type" and choose **Web app**.
7. Set **Execute as:** `Me`, and **Who has access:** `Anyone`.
8. Click **Deploy** and copy the **Web app URL**.
9. In Vercel open **Project → Settings → Environment Variables** and add:

   ```bash
   VISITOR_SHEET_URL=https://script.google.com/macros/s/your_deployment_id/exec
   ```

   Select Production, then redeploy the site. Pushing any commit to `main` also redeploys it.

Keep this URL private. Anyone who has it can add rows to the sheet. It is a server-only variable, so the site never sends it to browsers.

## The script

This is the deployed script, with the spreadsheet ID replaced by a placeholder. Set `SPREADSHEET_ID` to the ID in the spreadsheet's URL (the part between `/d/` and `/edit`).

`doPost` handles two kinds of request: a visit, which adds a row, and a contact (`type: 'contact'`), which fills in `Name` and `Email` on the most recent row with the same IP address. If no such row exists, for example because the visitor's browser blocked the visit beacon, the contact gets a row of its own.

```javascript
// Portfolio visitor log. Receives POSTs from the site and writes them to the
// 'Visitors' tab of the Portfolio Visitors spreadsheet.
//   /api/visit          -> one new row per visit
//   /api/visit/contact  -> { type: 'contact' }: adds the sender's name and email
//                          to their most recent row (matched by IP address)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Visitors';
const DASHBOARD_NAME = 'Dashboard';
const HEADERS = [
  'Time', 'IP', 'Name', 'Email', 'City', 'Region', 'Country', 'Device', 'OS', 'Browser',
  'Referrer', 'Page', 'Screen', 'Language', 'Timezone', 'User agent',
];
const TIME_FORMAT = 'dd mmm yyyy, hh:mm:ss';
const CRIMSON = '#dc143c';
const INK = '#1a1a1a';
const BLUSH = '#fdf1f4';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getVisitorsSheet_();
      if (data.type === 'contact') recordContact_(sheet, data);
      else recordVisit_(sheet, data);
    } finally {
      lock.releaseLock();
    }
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  }
}

function reply_(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function getVisitorsSheet_() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function recordVisit_(sheet, d) {
  sheet.appendRow([
    new Date(d.time || Date.now()), d.ip, '', '',
    d.city, d.region, d.country, d.device, d.os, d.browser,
    d.referrer, d.page, d.screen, d.language, d.timezone, d.userAgent,
  ]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat(TIME_FORMAT);
}

// Fill Name and Email on the sender's latest row. If they have no row (their
// IP changed, or the visit was never logged), add one so the contact is not lost.
function recordContact_(sheet, d) {
  const last = sheet.getLastRow();
  if (last >= 2) {
    const start = Math.max(2, last - 499);
    const ips = sheet.getRange(start, 2, last - start + 1, 1).getValues();
    for (let i = ips.length - 1; i >= 0; i--) {
      if (String(ips[i][0]) === String(d.ip)) {
        sheet.getRange(start + i, 3, 1, 2).setValues([[d.name, d.email]]);
        return;
      }
    }
  }
  sheet.appendRow([
    new Date(d.time || Date.now()), d.ip, d.name, d.email,
    '', '', '', '', '', '', 'Contact form', '', '', '', '', '',
  ]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat(TIME_FORMAT);
}

// ---------------------------------------------------------------------------
// Styling. Choose setupSheet in the toolbar and press Run. Safe to run again:
// it formats the Visitors tab and rebuilds the Dashboard tab.
// ---------------------------------------------------------------------------
function setupSheet() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  book.setSpreadsheetTimeZone('Asia/Karachi');
  const sheet = getVisitorsSheet_();

  if (sheet.getFilter()) sheet.getFilter().remove();

  // Older sheets had no Name and Email columns: make room for them after IP
  const head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (head.indexOf('Name') === -1) sheet.insertColumnsAfter(2, 2);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Drop the rows that were written while testing the setup
  const values = sheet.getDataRange().getValues();
  for (let r = values.length - 1; r >= 1; r--) {
    if (values[r][1] === 'TEST-ROW') sheet.deleteRow(r + 1);
  }

  const spare = sheet.getMaxColumns() - HEADERS.length;
  if (spare > 0) sheet.deleteColumns(HEADERS.length + 1, spare);

  const rows = sheet.getMaxRows();
  const cols = HEADERS.length;
  const all = sheet.getRange(1, 1, rows, cols);
  const body = sheet.getRange(2, 1, rows - 1, cols);

  sheet.getBandings().forEach(function (b) { b.remove(); });
  all.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(CRIMSON)
    .setFirstRowColor('#ffffff')
    .setSecondRowColor(BLUSH);

  all.setFontFamily('Inter').setFontSize(10).setVerticalAlignment('middle')
    .setHorizontalAlignment('left').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  body.setFontColor(INK).setFontWeight('normal');
  sheet.getRange(1, 1, 1, cols).setFontColor('#ffffff').setFontWeight('bold');
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  sheet.setTabColor(CRIMSON);

  const widths = [175, 140, 150, 220, 125, 75, 80, 90, 90, 125, 270, 130, 100, 90, 145, 430];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });

  sheet.getRange(2, 1, rows - 1, 1).setNumberFormat(TIME_FORMAT);
  sheet.getRange(2, 2, rows - 1, 1).setFontFamily('Roboto Mono').setFontWeight('bold');
  sheet.getRange(2, 3, rows - 1, 1).setFontWeight('bold');
  sheet.getRange(1, 6, rows, 4).setHorizontalAlignment('center');
  sheet.getRange(1, 13, rows, 2).setHorizontalAlignment('center');
  sheet.getRange(2, 16, rows - 1, 1).setFontColor('#8a8a8a').setFontSize(9);

  all.createFilter();

  const device = sheet.getRange(2, 8, rows - 1, 1);
  const referrer = sheet.getRange(2, 11, rows - 1, 1);
  const chip = function (text, bg, fg) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(text)
      .setBackground(bg).setFontColor(fg).setBold(true).setRanges([device]).build();
  };
  sheet.setConditionalFormatRules([
    chip('Mobile', '#e0f2fe', '#075985'),
    chip('Desktop', '#dcfce7', '#166534'),
    chip('Tablet', '#fef3c7', '#92400e'),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Direct')
      .setFontColor('#9ca3af').setItalic(true).setRanges([referrer]).build(),
    // Visitors who sent the contact form stand out
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2<>""')
      .setBackground('#fff4cc').setRanges([body]).build(),
  ]);

  buildDashboard_(book);

  const blank = book.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && book.getSheets().length > 1) book.deleteSheet(blank);
}

function buildDashboard_(book) {
  const dash = book.getSheetByName(DASHBOARD_NAME) || book.insertSheet(DASHBOARD_NAME, 0);
  dash.getRange(1, 1, dash.getMaxRows(), dash.getMaxColumns()).breakApart();
  dash.clear();
  dash.setHiddenGridlines(true);
  dash.setTabColor(INK);
  if (dash.getMaxColumns() > 8) dash.deleteColumns(9, dash.getMaxColumns() - 8);
  [160, 80, 160, 80, 160, 80, 300, 80].forEach(function (w, i) { dash.setColumnWidth(i + 1, w); });
  dash.getRange(1, 1, dash.getMaxRows(), 8).setFontFamily('Inter').setFontSize(10)
    .setFontColor(INK).setVerticalAlignment('middle');

  dash.getRange('A1:H1').merge().setValue('Portfolio Visitors')
    .setBackground(INK).setFontColor('#ffffff').setFontSize(18).setFontWeight('bold');
  dash.getRange('A2:H2').merge().setValue('Live from the visitor log. Times are Pakistan time.')
    .setBackground(INK).setFontColor('#bdbdbd').setFontSize(10);
  dash.setRowHeight(1, 52);
  dash.setRowHeight(2, 28);

  const cards = [
    ['A', 'B', 'TOTAL VISITS', '=COUNTA(Visitors!B2:B)'],
    ['C', 'D', 'TODAY', '=COUNTIF(Visitors!A2:A,">="&TODAY())'],
    ['E', 'F', 'UNIQUE IPS', '=IFERROR(COUNTUNIQUE(Visitors!B2:B),0)'],
    ['G', 'H', 'SENT A MESSAGE', '=COUNTA(Visitors!C2:C)'],
  ];
  cards.forEach(function (c) {
    dash.getRange(c[0] + '4:' + c[1] + '4').merge().setValue(c[2])
      .setBackground(BLUSH).setFontColor('#8a8a8a').setFontSize(9).setFontWeight('bold');
    dash.getRange(c[0] + '5:' + c[1] + '5').merge().setFormula(c[3])
      .setBackground(BLUSH).setFontColor(CRIMSON).setFontSize(26).setFontWeight('bold')
      .setHorizontalAlignment('left');
  });
  dash.setRowHeight(4, 30);
  dash.setRowHeight(5, 54);

  // [dashboard column, title, Visitors column, extra clause]
  const tables = [
    ['A', 'By country', 'G', ''],
    ['C', 'By device', 'H', ''],
    ['E', 'By browser', 'J', ''],
    ['G', 'Top referrers', 'K', ' limit 12'],
  ];
  tables.forEach(function (t) {
    const col = dash.getRange(t[0] + '1').getColumn();
    dash.getRange(7, col, 1, 2).merge().setValue(t[1])
      .setFontSize(12).setFontWeight('bold').setFontColor(INK);
    dash.getRange(8, col).setFormula(
      '=IFERROR(QUERY(Visitors!A2:P,"select ' + t[2] + ', count(B) where B is not null group by ' + t[2] +
      ' order by count(B) desc' + t[3] + ' label ' + t[2] + ' \'Name\', count(B) \'Visits\'",0),"No visits yet")');
    dash.getRange(8, col, 1, 2).setFontWeight('bold').setFontColor(CRIMSON)
      .setBorder(false, false, true, false, false, false, CRIMSON, SpreadsheetApp.BorderStyle.SOLID);
  });
  dash.setFrozenRows(2);
}
```

## Vercel Analytics

Aggregate numbers (visitors, pages, countries, devices, referrers) come from Vercel Web Analytics, which is already wired into the site. Turn it on once:

1. In Vercel open the project and go to the **Analytics** tab.
2. Click **Enable**.

Data appears after the next deploy and the first few visits.

## Privacy

IP addresses are personal data in many jurisdictions. The site footer tells visitors that visits are logged. Keep the sheet private, do not share or publish it, and delete old rows you no longer need.
