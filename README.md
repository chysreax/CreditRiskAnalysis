# Rangkuman UTS · Analisis Laporan Keuangan

Situs statis (HTML + CSS + JS biasa, tanpa build) berisi rangkuman visual & interaktif dari presentasi Kelompok 1–6.

## Isi

| File | Isi |
|---|---|
| `index.html` | Beranda: daftar materi, progres belajar, benang merah antar-materi |
| `profitability.html` | K1 · Profitability Analysis (Ch. 3) |
| `credit-risk.html` | K2 · Credit Risk Analysis |
| `revenue.html` | K3 · Revenue Recognition & Operating Income |
| `operating-assets.html` | K4 · Asset Recognition & Operating Assets (Module 6) |
| `liabilities.html` | K5 · Liability Recognition & Nonowner Financing (Ch. 7) |
| `equity.html` | K6 · Equity Recognition & Owner Financing (Ch. 8) |
| `rumus.html` | Bank rumus semua kelompok (bisa dicari) |
| `istilah.html` | Kamus singkatan & istilah (mode kartu & daftar) |
| `kuis.html` | Kuis campuran acak |
| `assets/` | `style.css`, `app.js`, `quiz-data.js`, `glossary.js`, `icon.svg` |

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub (mis. `rangkuman-alk`).
2. Upload **isi folder `web/`** ke root repository (termasuk file `.nojekyll`).
3. Buka **Settings → Pages**, pilih *Deploy from a branch*, branch `main`, folder `/ (root)`, lalu **Save**.
4. Situs aktif di `https://<username>.github.io/rangkuman-alk/` dalam 1–2 menit.

Atau lewat terminal dari dalam folder `web/`:

```bash
git init
git add .
git commit -m "Rangkuman UTS ALK"
git branch -M main
git remote add origin https://github.com/<username>/rangkuman-alk.git
git push -u origin main
```

## Catatan

- Tema punya 3 mode (tombol kanan atas): ikuti presentasi → terang → gelap.
- Progres "Tandai paham", skor, dan pilihan tema tersimpan di browser masing-masing (localStorage).
- Setelah mengubah `style.css`/`app.js`, naikkan angka `?v=` di tag `<link>`/`<script>` agar browser memuat versi baru.
- Semua isi bersumber dari slide presentasi kelompok; tidak ada materi dari sumber luar.
