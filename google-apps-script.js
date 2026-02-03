/**
 * Google Apps Script - Toktok Drama API + Monetization
 * Complete Backend: Drama API + Affiliate Tracking + VIP System
 * 
 * Deploy as Web App:
 * - Execute as: Me
 * - Who has access: Anyone
 * 
 * SPREADSHEET TABS REQUIRED:
 * 1. Dramas       - drama_id | title | description | thumbnail_url | total_episodes | genre | year | rating
 * 2. Episodes     - episode_id | drama_id | episode_number | title | video_id
 * 3. affiliate_links  - key | url | active
 * 4. affiliate_clicks - ts | key | mid | pos | ua
 * 5. vip_keys         - key | status | expires_at | plan
 */

// Spreadsheet ID - SUDAH BENAR, JANGAN DIUBAH
const SPREADSHEET_ID = '1_Q2DdTUjR_FEZZ2R3kNwYN8VCXAkc72MVjEDaGKmUV4';

// Domain Protection - HANYA domain ini yang boleh akses API
const ALLOWED_DOMAINS = [
  'drama.veoprompt.site',
  'localhost',
  '127.0.0.1'
];

/**
 * Check if request comes from allowed domain
 * @param {Object} e - Event object
 * @returns {boolean}
 */
function isAllowedOrigin(e) {
  // Get origin from headers or referer
  const origin = e.parameter.origin || '';
  const referer = e.parameter.referer || '';

  // Check if any allowed domain matches
  for (const domain of ALLOWED_DOMAINS) {
    if (origin.includes(domain) || referer.includes(domain)) {
      return true;
    }
  }

  // For direct browser access during development, allow if no origin
  // But in production, you might want to be stricter
  if (!origin && !referer) {
    // Check if it's a browser request (has user agent suggesting direct access)
    return true; // Allow for now, restrict later if needed
  }

  return false;
}

function doGet(e) {
  const action = e.parameter.action || 'dramas';
  const dramaId = e.parameter.drama_id;

  try {
    // =====================
    // MONETIZATION HANDLERS
    // =====================

    // Affiliate Redirect (e.g., ?go=headset1&mid=123&pos=below_player)
    if (e.parameter.go) {
      return handleAffiliate(e);
    }

    // VIP Validation (e.g., ?vip=VIP-7D-AB12CD)
    if (e.parameter.vip) {
      return handleVip(e);
    }

    // Domain Protection for Drama API
    if (action === 'dramas' || action === 'episodes') {
      if (!isAllowedOrigin(e)) {
        return ContentService
          .createTextOutput(JSON.stringify({
            error: 'Unauthorized domain',
            message: 'Content hanya bisa diakses dari drama.veoprompt.site'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // =====================
    // DRAMA API HANDLERS
    // =====================
    switch (action) {
      case 'dramas':
        return ContentService
          .createTextOutput(JSON.stringify(getDramas()))
          .setMimeType(ContentService.MimeType.JSON);

      case 'episodes':
        return ContentService
          .createTextOutput(JSON.stringify(getEpisodes(dramaId)))
          .setMimeType(ContentService.MimeType.JSON);

      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* =========================
   DRAMA API FUNCTIONS
========================= */

function getDramas() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Dramas');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  return data.slice(1).map(row => {
    const drama = {};
    headers.forEach((header, index) => {
      drama[header] = row[index];
    });
    return drama;
  });
}

function getEpisodes(dramaId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Episodes');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Convert dramaId to string for comparison (handles number vs string mismatch)
  const dramaIdStr = String(dramaId);

  return data.slice(1)
    .filter(row => String(row[1]) === dramaIdStr) // Convert both to string for comparison
    .map(row => {
      const episode = {};
      headers.forEach((header, index) => {
        episode[header] = row[index];
      });
      // Convert Google Drive URL to streamable
      episode.video_url = convertDriveUrl(episode.video_id).download;
      episode.preview_url = convertDriveUrl(episode.video_id).preview;
      episode.embed_url = convertDriveUrl(episode.video_id).embed;
      return episode;
    });
}

function convertDriveUrl(fileId) {
  // Multiple URL formats for better compatibility
  return {
    download: `https://drive.google.com/uc?export=download&id=${fileId}`,
    preview: `https://drive.google.com/file/d/${fileId}/preview`,
    embed: `https://drive.google.com/file/d/${fileId}/view`
  };
}

/* =========================
   MONETIZATION - AFFILIATE
========================= */

function handleAffiliate(e) {
  const key = e.parameter.go;
  const mid = e.parameter.mid || '';
  const pos = e.parameter.pos || '';
  const ua = e.parameter.ua || '';

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const linkSheet = ss.getSheetByName('affiliate_links');
  const clickSheet = ss.getSheetByName('affiliate_clicks');

  // Check if sheets exist
  if (!linkSheet || !clickSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Affiliate sheets not found. Create affiliate_links and affiliate_clicks tabs.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

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

  // Log click (always, even if link not found - for analytics)
  clickSheet.appendRow([
    new Date(),
    key,
    mid,
    pos,
    ua.substring(0, 200) // Limit UA length
  ]);

  // Redirect or show error
  if (!url) {
    return ContentService.createTextOutput('Affiliate link not found or inactive');
  }

  // Return HTML redirect (cleanest way for cross-origin)
  return HtmlService.createHtmlOutput(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to Partner...</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          margin: 0;
          background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
          color: #fff;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid #ff6b6b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        p { color: #aaa; }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <p>Redirecting to partner...</p>
      <script>
        setTimeout(function() {
          window.location.href = "${url}";
        }, 500);
      </script>
    </body>
    </html>`
  );
}

/* =========================
   MONETIZATION - VIP SYSTEM
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

  // Check if sheet exists
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'VIP sheet not found. Create vip_keys tab.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    // Columns: key | status | expires_at | plan
    const vipKey = rows[i][0];
    const status = rows[i][1];
    const expiresAt = rows[i][2];
    const plan = rows[i][3];

    if (vipKey === code && status === 'ACTIVE') {
      const expDate = new Date(expiresAt);

      if (expDate > new Date()) {
        // Valid VIP code - return success
        return ContentService
          .createTextOutput(JSON.stringify({
            ok: true,
            expires_at: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
            plan: plan || 'VIP'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        // Code expired - update status in sheet
        sheet.getRange(i + 1, 2).setValue('EXPIRED');
      }
    }
  }

  // Invalid or expired code
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: 'Invalid or expired code' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =========================
   UTILITY: Generate VIP Keys
   Run these manually from Script Editor
========================= */

/**
 * Generate a new VIP key
 * @param {string} plan - '3D', '7D', or '30D'
 * @returns {string} Generated VIP key
 */
function generateVipKey(plan) {
  const plans = {
    '3D': 3,
    '7D': 7,
    '30D': 30
  };

  const days = plans[plan] || 7;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const key = `VIP-${plan}-${randomPart}`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('vip_keys');

  if (!sheet) {
    Logger.log('Error: vip_keys sheet not found');
    return null;
  }

  sheet.appendRow([
    key,
    'ACTIVE',
    expiresAt,
    plan
  ]);

  Logger.log('Generated VIP Key: ' + key + ' (expires: ' + expiresAt + ')');
  return key;
}

// Shortcut functions - run these from Script Editor to generate keys
function createVipKey3Days() {
  return generateVipKey('3D');
}

function createVipKey7Days() {
  return generateVipKey('7D');
}

function createVipKey30Days() {
  return generateVipKey('30D');
}

/* =========================
   SAMPLE DATA GENERATOR
   Run once to create sample affiliate links
========================= */
function setupSampleAffiliateLinks() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('affiliate_links');

  if (!sheet) {
    sheet = ss.insertSheet('affiliate_links');
  }

  // Clear and set headers
  sheet.clear();
  sheet.appendRow(['key', 'url', 'active']);

  // Sample affiliate links (GANTI DENGAN LINK SHOPEE ASLI ANDA)
  const sampleLinks = [
    ['headset1', 'https://shope.ee/your-headset-link', true],
    ['kuota1', 'https://shope.ee/your-kuota-link', true],
    ['powerbank1', 'https://shope.ee/your-powerbank-link', true],
    ['snack1', 'https://shope.ee/your-snack-link', true]
  ];

  sampleLinks.forEach(link => sheet.appendRow(link));

  Logger.log('Sample affiliate links created!');
}

function setupAffiliateClicksSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('affiliate_clicks');

  if (!sheet) {
    sheet = ss.insertSheet('affiliate_clicks');
  }

  // Set headers
  sheet.getRange(1, 1, 1, 5).setValues([['ts', 'key', 'mid', 'pos', 'ua']]);

  Logger.log('affiliate_clicks sheet ready!');
}

function setupVipKeysSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('vip_keys');

  if (!sheet) {
    sheet = ss.insertSheet('vip_keys');
  }

  // Set headers
  sheet.getRange(1, 1, 1, 4).setValues([['key', 'status', 'expires_at', 'plan']]);

  Logger.log('vip_keys sheet ready!');
}

// Run this once to setup all monetization sheets
function setupAllMonetizationSheets() {
  setupSampleAffiliateLinks();
  setupAffiliateClicksSheet();
  setupVipKeysSheet();
  Logger.log('All monetization sheets created successfully!');
}