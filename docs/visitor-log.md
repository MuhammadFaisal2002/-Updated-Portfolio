# Visitor Log Setup

The site records one row per visitor in a Google Sheet: time, IP address, city, region, country, device, OS, browser, referrer, landing page, screen size, language, timezone and user agent.

Until the steps below are done nothing is stored. The site works normally either way.

## What it does and does not capture

- **Captured:** IP address, approximate location from the IP, device details, where the visitor came from, the page they landed on.
- **Not captured:** name, email, phone. Those only arrive if the visitor submits the contact form.
- **Skipped:** search-engine crawlers, link-preview bots, uptime monitors, and visitors whose browser sends Do Not Track or Global Privacy Control.
- **De-duplicated:** one row per browser session, and the same IP and browser at most once every 30 minutes.

## Setup (about 5 minutes)

Use a **new** spreadsheet for this. Do not paste the script into the contact form's spreadsheet: that project already has its own `doPost`, and two would conflict.

1. Go to <https://sheets.new> and name the spreadsheet `Portfolio Visitors`.
2. In the menu choose **Extensions → Apps Script**.
3. Delete whatever is in the editor and paste the script below.
4. Click **Deploy → New deployment**.
5. Click the gear next to "Select type" and choose **Web app**.
6. Set **Execute as:** `Me`, and **Who has access:** `Anyone`.
7. Click **Deploy**, approve the permission prompt, and copy the **Web app URL**.
8. In Vercel open **Project → Settings → Environment Variables** and add:

   ```bash
   VISITOR_SHEET_URL=https://script.google.com/macros/s/your_deployment_id/exec
   ```

   Select Production and Preview, then **Redeploy** the site.

Keep this URL private. Anyone who has it can add rows to the sheet. It is a server-only variable, so the site never sends it to browsers.

## The script

```javascript
const SHEET_NAME = 'Visitors';
const HEADERS = [
  'Time', 'IP', 'City', 'Region', 'Country', 'Device', 'OS', 'Browser',
  'Referrer', 'Page', 'Screen', 'Language', 'Timezone', 'User agent',
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date(data.time || Date.now()),
      data.ip, data.city, data.region, data.country,
      data.device, data.os, data.browser,
      data.referrer, data.page, data.screen,
      data.language, data.timezone, data.userAgent,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Vercel Analytics

Aggregate numbers (visitors, pages, countries, devices, referrers) come from Vercel Web Analytics, which is already wired into the site. Turn it on once:

1. In Vercel open the project and go to the **Analytics** tab.
2. Click **Enable**.

Data appears after the next deploy and the first few visits.

## Privacy

IP addresses are personal data in many jurisdictions. The site footer tells visitors that visits are logged. Keep the sheet private, do not share or publish it, and delete old rows you no longer need.
