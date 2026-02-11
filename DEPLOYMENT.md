# KISMIN Drama - Deployment Guide

## 🚀 Quick Deploy to GitHub Pages

### Step 1: Initialize Git Repository

```bash
cd /Users/macbookpro15/Documents/webappscript/dramamovie
git init
git add .
git commit -m "Initial commit: KISMIN Drama MVP"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `kismin-drama`
3. **Don't** initialize with README (we already have files)

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/kismin-drama.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository settings: `https://github.com/YOUR_USERNAME/kismin-drama/settings/pages`
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. The workflow will automatically run and deploy your app

### Step 5: Get Your App URL

After the workflow completes, your app will be available at:
```
https://YOUR_USERNAME.github.io/kismin-drama/
```

---

## 📱 Setup Telegram Mini App

### Step 1: Create a Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Save your bot token (you won't need it for Mini App, but keep it safe)

### Step 2: Create Mini App

1. In BotFather chat, send `/newapp`
2. Select your bot
3. Enter app details:
   - **Title**: KISMIN Drama
   - **Description**: Watch dramas for free
   - **Photo**: Upload a 640x360 image (optional)
   - **Demo GIF**: Skip (optional)
   - **Web App URL**: `https://YOUR_USERNAME.github.io/kismin-drama/`
   - **Short name**: `kismindrama` (this will be used in the app URL)

### Step 3: Test in Telegram

1. Open your bot in Telegram
2. Click the menu button or keyboard button to launch the Mini App
3. Or share the direct link: `https://t.me/YOUR_BOT_USERNAME/kismindrama`

---

## ✅ Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] GitHub Actions workflow completed successfully
- [ ] GitHub Pages is live
- [ ] Telegram bot created
- [ ] Mini App configured in BotFather
- [ ] Mini App tested in Telegram

---

## 🔧 Update Supporter Links

Before deploying, update the supporter links in `src/core/config.js`:

```javascript
SUPPORT_LINKS: {
  SAWERIA: 'https://saweria.co/YOUR_USERNAME',
  TRAKTEER: 'https://trakteer.id/YOUR_USERNAME'
}
```

---

## 🐛 Troubleshooting

### App not loading in GitHub Pages?
- Check that the workflow completed successfully
- Verify the "Build and deployment" source is set to "GitHub Actions"
- Make sure the `src` folder exists in your repository

### App not working in Telegram?
- Ensure the Web App URL in BotFather is correct
- Check that the URL is HTTPS (GitHub Pages uses HTTPS by default)
- Try opening the URL directly in a browser first

### Video not playing?
- The demo HLS stream requires internet connection
- Some networks may block video streaming - try a different network
- Check browser console for errors

---

## 📊 Next Steps (Post-MVP)

After deploying the MVP, consider:

1. **Real API Integration**: Replace mock data with actual SekaiDrama API
2. **Custom Domain**: Set up a custom domain for your GitHub Pages
3. **Analytics**: Add simple analytics to track usage
4. **More Features**: Add search, categories, watch progress tracking
5. **Performance**: Optimize images and lazy loading

---

## 📝 Notes

- The app works entirely client-side (no backend needed)
- All data is stored in localStorage (clears when browser cache is cleared)
- Video streams use HLS.js for compatibility across browsers
- The supporter code is: **KISMIN2026** (change in `config.js` before deploy)

---

**Made with ❤️ for Telegram Mini Apps**
