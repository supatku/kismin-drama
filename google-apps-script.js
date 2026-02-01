/**
 * Google Apps Script - Drama Metadata API
 * Deploy as Web App with public access
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