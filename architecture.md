# Software Architecture Document
## Telegram Mini Streaming App (KISMIN FULL GRATIS)

**Version:** 2.0  
**Style:** Minimal Static Web Architecture

---

## 1. Architecture Overview

App ini adalah Telegram Mini App berbasis web static.

- Tidak ada backend server
- Tidak ada login
- Semua state disimpan lokal
- Data konten berasal dari API SekaiDrama

---

## 2. High Level Diagram

# Software Architecture Document
## Telegram Mini Streaming App (KISMIN FULL GRATIS)

**Version:** 2.0  
**Style:** Minimal Static Web Architecture

---

## 1. Architecture Overview

App ini adalah Telegram Mini App berbasis web static.

- Tidak ada backend server
- Tidak ada login
- Semua state disimpan lokal
- Data konten berasal dari API SekaiDrama

---

## 2. High Level Diagram

User (Telegram)
|
v
Telegram WebView MiniApp
|
v
Static Web Frontend (HTML/JS)
|
v
SekaiDrama API (Remote Content)


---

## 3. Project Structure



src/
├── index.html
├── styles.css
├── app.js

├── core/
│ ├── api_client.js
│ ├── storage.js
│ └── config.js

├── features/
│ ├── home.js
│ ├── detail.js
│ ├── player.js
│ └── support.js

└── shared/
├── components.js
└── utils.js


---

## 4. Data Flow



UI Page → Fetch API → Render Drama/Episodes → Play Video


---

## 5. Local Storage

Digunakan untuk:

- Favorites/watchlist
- Supporter unlock flag

Example:

```js
localStorage.setItem("supporter", "true");

6. Deployment (Free Hosting)

Recommended:

GitHub Pages

Cloudflare Pages

No paid infra required.