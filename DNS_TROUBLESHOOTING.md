# 🚨 DNS Error Troubleshooting

## Current Issue
```
DNS check unsuccessful
drama.veoprompt.site is improperly configured
Domain's DNS record could not be retrieved
```

## 🔍 Root Cause
CNAME record belum ditambah di Namecheap DNS

## ⚡ Quick Fix (5 menit)

### 1. Namecheap Login
- Buka namecheap.com
- Login ke account
- Domain List → Manage veoprompt.site

### 2. Add CNAME Record
- Advanced DNS tab
- Add New Record:
  - **Type**: CNAME Record
  - **Host**: drama
  - **Value**: supatku.github.io.
  - **TTL**: Automatic
- Save Changes

### 3. Test DNS
```bash
# Test command
nslookup drama.veoprompt.site

# Expected result:
drama.veoprompt.site canonical name = supatku.github.io.
```

### 4. GitHub Pages
Setelah DNS working:
- Repo Settings → Pages
- Custom domain: drama.veoprompt.site
- DNS check akan berubah jadi ✅

## ⏱️ Timeline
- DNS propagation: 5-30 menit
- GitHub DNS check: 1-5 menit setelah propagation
- HTTPS certificate: 24 jam

## 🎯 Final Result
https://drama.veoprompt.site akan redirect ke GitHub Pages

Need help dengan Namecheap setup?