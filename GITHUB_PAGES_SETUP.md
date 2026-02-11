# 🚀 GitHub Pages Custom Domain Setup

## ✅ Supported: drama.veoprompt.site
GitHub Pages mendukung **custom subdomain** seperti `drama.veoprompt.site`

## 🔒 Security Best Practice
GitHub merekomendasikan **verify domain** dulu untuk keamanan

## 🚨 DNS Error Fix

**Error**: `Domain's DNS record could not be retrieved`  
**Cause**: CNAME record belum ditambah di Namecheap

## 🔧 Fix Steps (Namecheap)

### Step 1: Login Namecheap
1. Buka **namecheap.com** → Login
2. Dashboard → **Domain List**
3. Find **veoprompt.site** → klik **Manage**

### Step 2: Add CNAME Record
1. Klik tab **Advanced DNS**
2. Scroll ke **Host Records** section
3. Klik **Add New Record**
4. Fill form:
```
Type: CNAME Record
Host: drama
Value: supatku.github.io.
TTL: Automatic
```

### Step 3: GitHub Pages Repository Setup
1. Push file CNAME ke repo ✅ (sudah ada)
2. Repo Settings → Pages
3. Custom domain: `drama.veoprompt.site`
- Expected: `supatku.github.io`

### Step 4: GitHub Pages
Setelah DNS propagation selesai:
1. Repo Settings → Pages
2. Custom domain: `drama.veoprompt.site`
3. Save → Wait for DNS check ✅

## 🎯 Final Result
- **URL**: https://drama.veoprompt.site
- **SSL**: Auto-generated oleh GitHub
- **CDN**: GitHub's global CDN
- **Uptime**: 99.9%

## ⚠️ Important Notes
- DNS propagation: 5-30 menit
- HTTPS bisa butuh 24 jam untuk aktif
- Domain verification opsional tapi recommended untuk security

Ready untuk setup?