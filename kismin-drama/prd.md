# Product Requirements Document (PRD)
## Telegram Mini Streaming App (KISMIN FULL GRATIS)

**Version:** 2.0  
**Last Updated:** February 2026  
**Owner:** Indie Developer (Solo)

---

## 1. Vision

Membangun aplikasi streaming drama vertical berbasis **Telegram Mini App (Web)** yang:

- Bisa dibuka langsung di Telegram tanpa install APK
- Mengambil konten dari API SekaiDrama
- Fokus ke pengalaman nonton cepat dan simpel
- Dibangun dengan biaya **0 rupiah** (full free hosting)
 
---

## 2. Goals (MVP)

### Core Goals
- User bisa browse drama dan episode
- User bisa play video langsung di Telegram WebApp
- UI ringan, cepat, dan nyaman

### Indie Constraints
- Tidak ada login
- Tidak ada backend hosting berbayar
- Tidak ada ads network SDK
- Semua harus bisa jalan dengan static hosting

---

## 3. Monetization (KISMIN Mode)

Monetisasi bukan dari ads.

### Support Developer
- Tombol "Support Dev" → link Saweria/Trakteer

### Optional Supporter Code
- User bisa input kode supporter sederhana untuk unlock fitur kecil
- Sistem hanya localStorage (tanpa server)

---

## 4. Target Users

- Pengguna Telegram yang suka short drama
- Orang yang ingin nonton cepat tanpa install aplikasi

---

## 5. Core Features (MVP)

### 5.1 Content Discovery
- Trending dramas
- Search by title
- Category browsing (optional)

### 5.2 Drama Detail
- Info drama
- Episode list

### 5.3 Video Player
- HTML5 player
- Support HLS (.m3u8) via hls.js
- Tap-to-play friendly (Telegram limitation)

### 5.4 Watchlist (Local Only)
- Save drama ke favorites
- Disimpan di localStorage

### 5.5 Support Page
- Link donasi/support
- Input supporter code (optional)

---

## 6. Non-Goals (Not Included)

- Authentication / user accounts
- Cross-device sync
- Subscription auto-payment
- Ads mediation
- Firebase analytics
- Referral system

---

## 7. MVP Success Criteria

- App bisa dipakai tanpa install
- Video bisa play stabil di Telegram
- User bisa support developer lewat link
