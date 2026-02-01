# 🚀 Implementation Guide - Serverless Drama Management

## Step 1: Google Sheets Setup

### Create Spreadsheet:
1. **Sheet 1: "Dramas"**
   ```
   drama_id | title | description | thumbnail_url | total_episodes | genre | year | rating
   41000101419 | My Drama | Synopsis here... | https://... | 12 | Romance | 2024 | 8.5
   ```

2. **Sheet 2: "Episodes"**
   ```
   episode_id | drama_id | episode_num | title | description | video_id | duration | thumbnail_url
   ep_001 | 41000101419 | 1 | Episode 1 | Desc... | 1a2b3c4d5e | 45:30 | https://...
   ```

## Step 2: Google Apps Script Deployment

1. **Create Script**: Extensions → Apps Script
2. **Paste Code**: Use provided `google-apps-script.js`
3. **Deploy**: Deploy → New Deployment → Web App
4. **Permissions**: Execute as "Me", Access "Anyone"
5. **Copy URL**: Save the Web App URL

## Step 3: Google Drive Video Setup

### File Naming Convention:
```
41000101419_Episode_1.mp4
41000101419_Episode_2.mp4
...
```

### Get File IDs:
1. Right-click video → Share → Copy link
2. Extract ID from: `https://drive.google.com/file/d/FILE_ID/view`
3. Add to Episodes sheet

## Step 4: Frontend Integration

1. **Update Config**: Add Google Apps Script URL
2. **Import Services**: Add manual content API
3. **Test Integration**: Verify data loading

## Step 5: Video Player Enhancement

### Google Drive Streaming:
```javascript
// Convert Drive URL for direct streaming
function getStreamableUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Alternative for better streaming
function getEmbedUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
```

## 📊 JSON Schema Example

```json
{
  "manual_dramas": [
    {
      "id": "manual_41000101419",
      "title": "My Drama Series",
      "thumbnail": "https://drive.google.com/uc?id=thumb_id",
      "rating": "8.5",
      "year": "2024",
      "genre": "Romance, Drama",
      "synopsis": "A beautiful love story...",
      "totalEpisodes": 12,
      "isManual": true,
      "seasons": [
        {
          "season": 1,
          "episodes": [
            {
              "id": "ep_001",
              "episode": 1,
              "title": "First Meeting",
              "description": "The story begins...",
              "duration": "45:30",
              "playerUrl": "https://drive.google.com/uc?export=download&id=video_id",
              "thumbnail": "https://drive.google.com/uc?id=thumb_id"
            }
          ]
        }
      ]
    }
  ]
}
```

## ✅ Benefits

- **Fully Serverless**: No backend costs
- **Easy Management**: Update via Google Sheets
- **Scalable**: Handle unlimited content
- **Fast**: Cached by Google's CDN
- **Reliable**: Google infrastructure
- **Version Control**: Sheet revision history

## 🎯 Best Practices

1. **Thumbnails**: Use consistent aspect ratios (16:9 for episodes, 3:4 for posters)
2. **File Organization**: Consistent naming conventions
3. **Metadata**: Rich descriptions for better UX
4. **Caching**: Implement client-side caching for API responses
5. **Fallbacks**: Always provide fallback content
6. **Performance**: Lazy load thumbnails and videos

This approach gives you full control over your content while maintaining a serverless architecture!