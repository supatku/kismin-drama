# Dual Platform Strategy: Flutter + Web

## 🎯 Complete Monetization Plan
**Mobile**: Flutter app dengan Unity Ads  
**Web**: Custom domain dengan Adsterra ads

## 📱 Mobile App (Flutter + Unity Ads)
- **Unity Ads** - Video interstitial (high eCPM)
- **Unity Banner** - Bottom banner ads
- **Rewarded Video** - Unlock premium episodes
- **Revenue**: $15-50/hari dengan 1000 users

## 🌐 Web App (Custom Domain + Adsterra)
- **Domain**: drama.veoprompt.site
- **Adsterra**: Popunder, Social Bar, Banner, Native Banner
- **Revenue**: $20-80/hari dengan traffic
- **Total Combined**: $35-130/hari

## 🚀 Setup Custom Domain untuk Web (Namecheap)

### Step 1: Namecheap DNS Setup
1. Login ke Namecheap account
2. Domain List → Manage veoprompt.site
3. Advanced DNS tab
4. Add New Record:
```
Type: CNAME Record
Host: drama
Value: supatku.github.io.
TTL: Automatic
```
5. Save Changes

### Step 2: GitHub Pages Custom Domain
1. Push file CNAME ke repo (sudah ada)
2. Repo Settings → Pages
3. Custom domain: `drama.veoprompt.site`
4. Enforce HTTPS: ✓
5. Wait 10-15 menit untuk propagation

### Step 3: Update Web App untuk Adsterra
- Add Adsterra script di index.html
- Social Bar widget
- Popunder on page load
- Banner ads in content
- Native Banner (optional)

## 📱 Flutter App dengan Unity Ads

```
User Flow:
App Launch → Unity Banner (bottom)
    ↓
Browse Drama → Native content
    ↓
Select Episode → Unity Video Ad (15-30s)
    ↓
Ad Complete → Video Player
    ↓
Watch Complete → Rewarded Ad (next episode)
```

## 🛠️ Tech Stack Update
**Mobile (Flutter)**:
- Unity Ads SDK
- WebView Flutter
- Rebahan API
- SharedPreferences

**Web (Custom Domain)**:
- GitHub Pages hosting
- Adsterra JavaScript SDK
- Same codebase (current)
- Custom domain: drama.veoprompt.site

## 📱 App Structure
```
lib/
├── screens/
│   ├── home_screen.dart          # Banner ads + Drama grid
│   ├── detail_screen.dart        # Native ads + Episode list
│   ├── ads_interstitial.dart     # AdMob interstitial
│   └── player_screen.dart        # WebView video player
├── services/
│   ├── api_service.dart          # Rebahan API calls
│   ├── admob_service.dart        # Google AdMob
│   └── storage_service.dart      # Local favorites
├── models/
│   └── drama_model.dart          # Data models
└── widgets/
    ├── drama_card.dart           # Reusable components
    └── banner_ad_widget.dart     # AdMob banner
```

## 🎬 User Experience Flow
1. **Home Screen**: Social Bar (persistent) + Banner ads + Drama grid
2. **Browse**: Popunder ads (background monetization)
3. **Detail Screen**: Native Banner + Episode list
4. **Video Player**: Clean fullscreen experience
5. **Smartlink**: Optional for external traffic

## 💡 Advantages vs Current Telegram Mini App
- ✅ **Mobile ads revenue** ($10-30/hari vs $0 di Telegram)
- ✅ **Full video control** (no WebView limitations)
- ✅ **Better UX** untuk streaming
- ✅ **Push notifications** untuk new episodes
- ✅ **Offline favorites** dengan local storage
- ✅ **Play Store distribution**
- ✅ **AdMob integration** (proven & reliable)

## ⚡ Implementation Roadmap
1. **Week 1**: Setup Flutter project + AdMob SDK
2. **Week 2**: Convert API service dari JS ke Dart
3. **Week 3**: Implement banner & interstitial ads
4. **Week 4**: Video player + rewarded ads
5. **Week 5**: Play Store submission

## 💵 Revenue Projection (Realistic)
- **Month 1**: 100 users × $0.30/user = $30
- **Month 3**: 1000 users × $0.50/user = $500
- **Month 6**: 5000 users × $1/user = $5,000

**Alternative**: Tetap pakai **Telegram Mini App** + tambah **web Adsterra** di landing page!