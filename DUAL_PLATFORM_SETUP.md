# 🚀 Namecheap DNS Setup Guide

## 🌐 Setup drama.veoprompt.site

### Step 1: Namecheap Dashboard
1. Login ke **Namecheap.com**
2. Dashboard → **Domain List**
3. Find **veoprompt.site** → klik **Manage**

### Step 2: Advanced DNS
1. Klik tab **Advanced DNS**
2. Scroll ke **Host Records**
3. Klik **Add New Record**

### Step 3: Add CNAME Record
```
Type: CNAME Record
Host: drama
Value: supatku.github.io.
TTL: Automatic (atau 1800)
```
4. Klik **Save Changes** (checkmark icon)

### Step 4: Verify Setup
- DNS propagation: 5-30 menit
- Test: `nslookup drama.veoprompt.site`
- Should return: `supatku.github.io`

### Step 3: Add Adsterra to Web App
```html
<!-- Add to src/index.html <head> -->
<script async src="//thubanoa.com/1?z=7654321"></script>

<!-- Social Bar -->
<script>
(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(document.createElement('script'),'//thubanoa.com/tag.min.js',7654321,document.body||document.documentElement)
</script>
```

## 📱 Mobile App - Flutter + Unity Ads

### Dependencies (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter
  unity_ads_plugin: ^0.3.10
  webview_flutter: ^4.4.2
  http: ^1.1.0
  shared_preferences: ^2.2.2
```

### Unity Ads Setup
```dart
// Initialize Unity Ads
UnityAds.init(
  gameId: 'your_game_id',
  onComplete: () => print('Unity Ads initialized'),
  onFailed: (error, message) => print('Unity Ads failed: $message'),
);
```

## 🎯 Revenue Streams
- **Web**: Adsterra ads ($20-80/hari)
- **Mobile**: Unity Ads ($15-50/hari)
- **Total**: $35-130/hari combined

## 🚀 Launch Sequence
1. **Week 1**: Setup custom domain + Adsterra
2. **Week 2**: Start Flutter app development
3. **Week 3**: Unity Ads integration
4. **Week 4**: Testing & optimization
5. **Week 5**: Play Store submission

URL setelah setup: **https://drama.veoprompt.site**