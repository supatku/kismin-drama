# Tutorial: Mengelola Affiliate Links

Sistem popup affiliate Toktok menggunakan Google Sheets sebagai database link. Anda bisa menambah, edit, atau menonaktifkan link kapan saja **tanpa perlu edit kode**.

---

## 📋 Setup Awal: Buat Sheet `popup_affiliate_links`

### 1. Buka Google Spreadsheet Anda
URL: `https://docs.google.com/spreadsheets/d/1_Q2DdTUjR_FEZZ2R3kNwYN8VCXAkc72MVjEDaGKmUV4/edit`

### 2. Buat Tab/Sheet Baru
- Klik tombol **+** di bagian bawah spreadsheet
- Rename tab menjadi: `popup_affiliate_links`

### 3. Setup Kolom Header

| url | status | notes |
|-----|--------|-------|

**Penjelasan kolom:**
- **url** (wajib): Link affiliate yang akan dibuka
- **status** (opsional): `active` atau `paused` untuk kontrol
- **notes** (opsional): Catatan pribadi (misal: "Campaign A", "Promo Feb 2026")

---

## ✏️ Cara Menambah Link Affiliate

Tinggal tambahkan baris baru di sheet:

| url | status | notes |
|-----|--------|-------|
| https://lynk.id/oghiezr/ | active | Lynk.id Main |
| https://shp.ee/abc123 | active | Shopee Promo |
| https://tokopedia.link/xyz | active | Tokopedia Feb |

> [!TIP]  
> **Sistem random**: setiap user yang membuka website akan mendapat 1 link secara acak dari list di atas.

---

## ⏸️ Cara Menonaktifkan Link (Tanpa Hapus)

Ganti status jadi `paused`:

| url | status | notes |
|-----|--------|-------|
| https://lynk.id/oghiezr/ | active | Lynk.id Main |
| https://shp.ee/abc123 | **paused** | ❌ Kampanye selesai |
| https://tokopedia.link/xyz | active | Tokopedia Feb |

Link yang `paused` **tidak akan muncul** di popup, tapi tetap tersimpan kalau mau diaktifkan lagi.

---

## 🔄 Cara Update/Ganti Link

Langsung edit cell URL yang mau diganti:

**Before:**
| url | status | notes |
|-----|--------|-------|
| https://shp.ee/old-link | active | Promo Lama |

**After:**
| url | status | notes |
|-----|--------|-------|
| https://shp.ee/new-link | active | Promo Baru |

> [!IMPORTANT]  
> Perubahan di Google Sheets **langsung berlaku** tanpa perlu reload/deploy ulang!

---

## 🧪 Testing

### Cara Test Popup:

1. Buka website: `https://drama.veoprompt.site/`
2. Tunggu **10 detik**
3. Tab baru akan terbuka dengan salah satu link dari sheet
4. Cek console browser (F12) untuk log: `[Monetization] Opening affiliate popup: <url>`

### Cooldown System:
- Popup **hanya muncul 1x dalam 24 jam** per user (pakai localStorage)
- Kalau mau test lagi, buka di browser mode **Incognito/Private**
- Atau clear localStorage: `localStorage.removeItem('affiliate_popup_last_shown')`

### VIP User:
- User dengan VIP aktif **tidak akan kena popup** sama sekali

---

## 🚨 Troubleshooting

### Popup tidak muncul?

**Cek:**
1. Apakah sheet `popup_affiliate_links` sudah dibuat?
2. Apakah ada link dengan status `active`?
3. Apakah sudah tunggu 10 detik setelah page load?
4. Apakah browser block popup? (cek icon di address bar)
5. Apakah sudah lewat 24 jam sejak popup terakhir? (gunakan Incognito untuk test)

**Lihat error di Console:**
```
F12 → Console → cari "[Monetization]"
```

Pesan yang mungkin muncul:
- ✅ `Opening affiliate popup: <url>` → Sukses!
- ⚠️ `VIP active, skipping affiliate popup` → User VIP, popup disabled
- ⚠️ `Affiliate popup cooldown active (Xh remaining)` → Masih dalam cooldown 24 jam
- ❌ `Popup blocked by browser` → User block popup di browser
- ❌ `No active affiliate links found` → Sheet kosong atau semua link `paused`
- ❌ `Sheet popup_affiliate_links not found` → Sheet belum dibuat

---

## 📊 Best Practices

### 1. Minimal 3-5 Link
Biar variasi lebih banyak dan tidak monoton:

| url | status | notes |
|-----|--------|-------|
| https://lynk.id/oghiezr/ | active | Lynk.id |
| https://shp.ee/link1 | active | Shopee A |
| https://shp.ee/link2 | active | Shopee B |
| https://tokopedia.link/x | active | Tokopedia |
| https://facebook.com/... | active | FB CPA |

### 2. Pakai Notes untuk Tracking
Tulis catatan kampanye biar gampang maintenance:

| url | status | notes |
|-----|--------|-------|
| https://shp.ee/feb2026 | active | Promo Feb 2026 - End 28 Feb |

Kalau kampanye selesai, tinggal ubah status jadi `paused`.

### 3. Test Link Baru dulu
Sebelum add ke sheet, klik link manual dulu pastikan tidak error 404.

---

## 📈 Analytics (Opsional)

Saat ini sistem **sudah otomatis** log click di sheet `affiliate_clicks` (kalau ada), tapi untuk popup affiliate links belum ada tracking bawaan.

**Solusi:**
- Gunakan URL shortener yang ada dashboard (misal: bit.ly, Lynk.id sudah punya analytics)
- Bisa tambahkan UTM parameter manual: `?utm_source=toktok&utm_medium=popup`

---

## ❓ FAQ

**Q: Berapa link maksimal yang bisa ditambahkan?**  
A: Tidak ada limit, tapi disarankan 5-10 link agar random distribution merata.

**Q: Apakah harus deploy ulang Google Apps Script setelah edit sheet?**  
A: **TIDAK PERLU!** Sheet langsung terbaca real-time.

**Q: Bisa beda-beda link per halaman?**  
A: Saat ini semua halaman pakai sheet yang sama. Kalau mau custom per halaman, perlu modifikasi kode (request fitur baru).

**Q: Popup bisa muncul 2x sehari?**  
A: Tidak, cooldown 24 jam. Kalau mau ubah cooldown, edit `COOLDOWN_HOURS` di `monetization.js` line ~693.

---

Selesai! Sekarang Anda bisa kelola affiliate link dengan mudah langsung dari Google Sheets 🎉
