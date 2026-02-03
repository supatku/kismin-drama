/**
 * Toktok Drama - Monetization Backend (Google Apps Script)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Apps Script project at https://script.google.com
 * 2. Paste this code into Code.gs
 * 3. Create a Google Sheet with these tabs:
 *    - affiliate_links: key | url | active
 *    - affiliate_clicks: ts | key | mid | pos | ua
 *    - vip_keys: key | status | expires_at | plan
 * 4. Link the spreadsheet using SpreadsheetApp.openById('YOUR_SHEET_ID')
 * 5. Deploy as Web App: Execute as "Me", Access "Anyone"
 * 6. Copy the deployment URL to monetization.js GAS_URL
 */

// Replace with your actual Spreadsheet ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

function doGet(e) {
    // CORS headers for cross-origin requests
    const output = ContentService.createTextOutput();

    try {
        // AFFILIATE REDIRECT
        if (e.parameter.go) {
            return handleAffiliate(e);
        }

        // VIP VALIDATION
        if (e.parameter.vip) {
            return handleVip(e);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            error: true,
            message: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/* =========================
   AFFILIATE REDIRECT
========================= */
function handleAffiliate(e) {
    const key = e.parameter.go;
    const mid = e.parameter.mid || '';
    const pos = e.parameter.pos || '';
    const ua = e.parameter.ua || '';

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const linkSheet = ss.getSheetByName('affiliate_links');
    const clickSheet = ss.getSheetByName('affiliate_clicks');

    // Get affiliate link
    const data = linkSheet.getDataRange().getValues();
    let url = null;

    for (let i = 1; i < data.length; i++) {
        // Columns: key | url | active
        if (data[i][0] === key && data[i][2] === true) {
            url = data[i][1];
            break;
        }
    }

    // Log click regardless
    clickSheet.appendRow([
        new Date(),
        key,
        mid,
        pos,
        ua
    ]);

    // Redirect or show error
    if (!url) {
        return ContentService.createTextOutput('Link not found');
    }

    // Return HTML redirect
    return HtmlService.createHtmlOutput(
        `<!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
      <style>
        body { 
          font-family: system-ui; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          margin: 0;
          background: #0a0a0a;
          color: #fff;
        }
      </style>
    </head>
    <body>
      <p>Redirecting to partner...</p>
      <script>location.href="${url}";</script>
    </body>
    </html>`
    );
}

/* =========================
   VIP VALIDATION
========================= */
function handleVip(e) {
    const code = e.parameter.vip;

    if (!code) {
        return ContentService
            .createTextOutput(JSON.stringify({ ok: false, error: 'No code provided' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('vip_keys');

    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
        // Columns: key | status | expires_at | plan
        const vipKey = rows[i][0];
        const status = rows[i][1];
        const expiresAt = rows[i][2];

        if (vipKey === code && status === 'ACTIVE') {
            const expDate = new Date(expiresAt);

            if (expDate > new Date()) {
                // Valid VIP code
                return ContentService
                    .createTextOutput(JSON.stringify({
                        ok: true,
                        expires_at: expiresAt.toISOString ? expiresAt.toISOString() : expiresAt,
                        plan: rows[i][3] || 'VIP'
                    }))
                    .setMimeType(ContentService.MimeType.JSON);
            }
        }
    }

    // Invalid or expired
    return ContentService
        .createTextOutput(JSON.stringify({ ok: false }))
        .setMimeType(ContentService.MimeType.JSON);
}

/* =========================
   UTILITY: Generate VIP Keys
========================= */
function generateVipKey(plan, days) {
    const plans = {
        '3D': 3,
        '7D': 7,
        '30D': 30
    };

    const actualDays = days || plans[plan] || 7;
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const key = `VIP-${plan}-${randomPart}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + actualDays);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('vip_keys');

    sheet.appendRow([
        key,
        'ACTIVE',
        expiresAt,
        plan
    ]);

    return key;
}

// Example: Generate a 7-day VIP key
// Run this function manually to create VIP codes
function createVipKey7Days() {
    const key = generateVipKey('7D');
    Logger.log('Generated VIP Key: ' + key);
    return key;
}

function createVipKey30Days() {
    const key = generateVipKey('30D');
    Logger.log('Generated VIP Key: ' + key);
    return key;
}
