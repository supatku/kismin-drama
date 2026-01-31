# 🚀 KISMIN Drama - Deploy Guide

## Step 1: GitHub Repository
1. Buka https://github.com/new
2. Repository name: `kismin-drama`
3. Set Public
4. Klik "Create repository"

## Step 2: Push Code
```bash
git remote set-url origin https://github.com/[USERNAME]/kismin-drama.git
git push -u origin main
```

## Step 3: Enable GitHub Pages
1. Buka repo settings
2. Scroll ke "Pages"
3. Source: Deploy from branch
4. Branch: main / (root)
5. Save

## Step 4: Telegram Bot Setup
1. Chat @BotFather di Telegram
2. `/newbot` → nama bot
3. `/newapp` → pilih bot → isi data:
   - Title: KISMIN Drama
   - Description: Free drama streaming
   - Photo: Upload logo
   - Web App URL: `https://[USERNAME].github.io/kismin-drama`

## Step 5: Test
- Buka bot di Telegram
- Klik "Open App"
- App akan load dalam Telegram WebView

## ✅ Done!
App siap digunakan di Telegram Mini App.

URL: `https://[USERNAME].github.io/kismin-drama`