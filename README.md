# AL AUTO — Frontend

Website statis (HTML/CSS/JS) untuk kursus mengemudi AL AUTO.

## Struktur
- `index.html` — Beranda
- `testimoni.html` — Testimoni
- `paket.html` — Paket & Harga
- `absensi.html` — Panel user (absensi, butuh login + approval)
- `pendaftaran.html` — Pendaftaran kursus
- `login.html` — Login / Daftar akun
- `panel-admin.html` — Panel admin (rahasia, butuh role admin)
- `assets/css/` — Styles (global, index, paket, pendaftaran, testimoni, absensi)
- `assets/js/` — Scripts (auth, main, absensi, firebase-config placeholder)
- `assets/img/`, `assets/video/` — Media
- `robots.txt` — Disallow panel admin dari crawler

## Backend
Backend terpisah di folder `../AL-AUTO-API` (.NET 10 + SQLite).
Frontend terhubung ke backend via `assets/js/auth.js` (`API_BASE = http://localhost:5000`).

## Menjalankan lokal
1. Jalankan backend: `dotnet run --urls http://localhost:5000` di folder backend.
2. Jalankan frontend server (serve_alauto.ps1) di port 8765.
3. Buka http://localhost:8765