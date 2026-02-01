/**
 * Google Apps Script - Drama Metadata API
 * Deploy as Web App with public access
 * 
 * PASTE THIS CODE TO YOUR GOOGLE APPS SCRIPT PROJECT
 */

function doGet(e) {
  const action = e.parameter.action || 'dramas';
  const dramaId = e.parameter.drama_id;

  try {
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

function getDramas() {
  const sheet = SpreadsheetApp.openById('1_Q2DdTUjR_FEZZ2R3kNwYN8VCXAkc72MVjEDaGKmUV4').getSheetByName('Dramas');
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
  const sheet = SpreadsheetApp.openById('1_Q2DdTUjR_FEZZ2R3kNwYN8VCXAkc72MVjEDaGKmUV4').getSheetByName('Episodes');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const dramaIdStr = String(dramaId);

  return data.slice(1)
    .filter(row => String(row[1]) === dramaIdStr)
    .map(row => {
      const episode = {};
      headers.forEach((header, index) => {
        episode[header] = row[index];
      });
      // Generate video URLs
      episode.video_url = `https://drive.google.com/uc?export=download&id=${episode.video_id}`;
      episode.preview_url = `https://drive.google.com/file/d/${episode.video_id}/preview`;
      episode.embed_url = `https://drive.google.com/file/d/${episode.video_id}/view`;
      return episode;
    });
}