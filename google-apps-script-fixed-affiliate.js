/* ==========================================
   SIMPLIFIED AFFILIATE HANDLER
   No Google Sheets required - Direct Facebook CPA redirect
   ========================================== */

// Paste this function into your Google Apps Script, replacing the old handleAffiliate function

function handleAffiliate(e) {
    const key = e.parameter.go;
    const mid = e.parameter.mid || '';
    const pos = e.parameter.pos || '';
    const ua = e.parameter.ua || '';

    // Facebook CPA Links - Ganti dengan link affiliate Shopee Anda yang berbeda jika perlu
    const affiliateLinks = {
        'headset1': 'https://web.facebook.com/share/p/1CPegGWMPj/',
        'kuota1': 'https://web.facebook.com/share/p/1CUThKqVAS/',
        'powerbank1': 'https://web.facebook.com/share/p/1KgALzvXvw/',
        'snack1': 'https://web.facebook.com/share/p/1An7qVGGJ2/'
    };

    const url = affiliateLinks[key];

    // Log click ke Google Sheets (optional - buat analytics)
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let clickSheet = ss.getSheetByName('affiliate_clicks');

        // Buat sheet baru kalau belum ada
        if (!clickSheet) {
            clickSheet = ss.insertSheet('affiliate_clicks');
            clickSheet.appendRow(['Timestamp', 'Product', 'MovieID', 'Position', 'UserAgent']);
        }

        // Log click
        clickSheet.appendRow([
            new Date(),
            key,
            mid,
            pos,
            ua.substring(0, 200)
        ]);
    } catch (err) {
        // Silent fail - tetap redirect meskipun logging gagal
        Logger.log('Click logging failed: ' + err);
    }

    // Redirect ke Facebook CPA
    if (url) {
        return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="refresh" content="0; url=${url}">
      </head>
      <body>
        <script>
          window.top.location.href = "${url}";
        </script>
        <p>Redirecting to offer...</p>
      </body>
      </html>
    `);
    } else {
        return ContentService.createTextOutput('Invalid affiliate key: ' + key);
    }
}
