# AL AUTO — Kursus Mengemudi Manual & Matic di Palembang

Website resmi AL AUTO untuk pendaftaran, informasi paket, testimoni, dan **sistem absensi digital** peserta kursus mengemudi.

🌐 **Live:** https://nurfaizi8879.github.io/AL-AUTO/

---

## ✨ Fitur

### Website Publik
- Beranda dengan hero video & informasi keunggulan
- Halaman Testimoni (galeri foto)
- Paket & Harga (manual/matic, Bisa/Mahir)
- Pendaftaran kursus (formulir)
- Absensi digital (login required)
- Responsif (mobile, tablet, desktop)
- Navigasi mobile (hamburger menu)

### Sistem Absensi (Firebase)
- Login / Register akun (email & password)
- Verifikasi admin (approve/reject user)
- Absensi per pertemuan (auto numbering)
- Cegah absen ganda di tanggal yang sama
- Riwayat absensi per user
- Status kehadiran: Hadir, Izin, Sakit, Alfa
- Catatan per pertemuan

### Panel Admin (terpisah & tersembunyi)
- CRUD user (tambah, edit, hapus)
- Verifikasi user (approve/reject)
- Data absensi (ringkasan per user, pencarian, detail)
- Statistik (total user, pending, approved, absensi, hadir)
- Export absensi ke CSV
- Audit log (siapa melakukan apa)
- UI terpisah (dark theme) dari user

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (vanilla)
- Firebase SDK (Auth + Firestore) — mode cloud
- Responsive design (media queries, clamp, grid)
- GitHub Pages (hosting)

### Backend (opsional, lokal)
- .NET 10 (minimal API)
- SQLite (database lokal)
- JWT + BCrypt (auth)
- Rate limiting, CORS

---

## 📁 Struktur Folder

```
AL-AUTO/
├── index.html              # Beranda
├── testimoni.html          # Testimoni
├── paket.html              # Paket & Harga
├── pendaftaran.html        # Pendaftaran kursus
├── absensi.html            # Panel user (absensi)
├── login.html              # Login / Daftar
├── panel-admin.html        # Panel admin (rahasia)
├── robots.txt              # Blokir crawler admin
├── README.md
└── assets/
    ├── css/
    │   ├── global.css      # Style global + responsif
    │   ├── index.css       # Style beranda
    │   ├── paket.css       # Style paket
    │   ├── pendaftaran.css # Style pendaftaran
    │   ├── testimoni.css   # Style testimoni
    │   └── absensi.css     # Style absensi
    ├── js/
    │   ├── auth.js         # Logika auth (Firebase)
    │   ├── main.js         # Navbar mobile, animasi, toast
    │   ├── absensi.js      # Logika absensi (legacy)
    │   └── firebase-config.js # Config Firebase
    ├── img/                # Gambar & logo
    └── video/              # Video hero
```

Backend (terpisah): `../AL-AUTO-API` (.NET 10 + SQLite)

---

## 🚀 Cara Menjalankan (Lokal)

### Frontend
```powershell
powershell -ExecutionPolicy Bypass -File "serve_alauto.ps1"
```
Buka: http://localhost:8765

### Backend (opsional)
```powershell
cd "AL-AUTO-API/AlAutoApi"
dotnet run --urls http://localhost:5000
```

---

## 🔥 Setup Firebase (untuk mode cloud)

1. Buat project di https://console.firebase.google.com
2. Aktifkan **Authentication** (Email/Password).
3. Buat **Firestore Database**.
4. Isi `assets/js/firebase-config.js` dengan config Anda.
5. Publish **Security Rules** (lihat dokumentasi).
6. Buat akun admin di Authentication + Firestore (`role: admin`, `status: approved`).

### Akun admin default (lokal/Firebase)
- Email: `admin@alauto.com`
- Password: `admin@alauto.com`

---

## 🌐 Deployment

### Frontend (GitHub Pages)
Sudah di-deploy: https://nurfaizi8879.github.io/AL-AUTO/

Setiap push ke branch `main` akan otomatis rebuild.

### Backend (opsional)
Deploy ke Render/Railway/VPS, lalu ubah `API_BASE` di `auth.js`.

---

## 📊 Fitur Admin
- **URL rahasia:** `/panel-admin.html` (tidak ada link publik)
- **Akses guard:** hanya role `admin` yang bisa masuk
- **CRUD:** tambah, edit, hapus user
- **Verifikasi:** approve/reject pendaftaran
- **Absensi:** lihat, hapus, export CSV
- **Statistik:** total user, pending, approved, absensi, hadir
- **Audit log:** catatan semua aksi admin

---

## 🔐 Keamanan
- Password terenkripsi (Firebase Auth / BCrypt di backend)
- Security Rules di server (Firestore)
- Role-based access control
- Panel admin tersembunyi (no public link)
- Honeypot anti-bot di form pendaftaran
- Rate limiting (backend)

---

## 📞 Kontak
- WhatsApp: 0897-9480-919
- Lokasi: Kota Palembang, Sumatera Selatan

---

## 📄 Lisensi
© 2026 AL AUTO. Seluruh hak cipta dilindungi.