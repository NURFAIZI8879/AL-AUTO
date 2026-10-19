# AL AUTO — Website Kursus Mengemudi

Website resmi **AL AUTO**, kursus mengemudi mobil manual & matic di Kota Palembang.
Website statis (HTML + CSS + JavaScript murni) — tanpa build atau framework,
siap unggah ke hosting mana pun (cPanel, Netlify, GitHub Pages, dsb).

## Struktur proyek

```
AL-AUTO/
├── index.html          ← beranda (halaman utama)
├── testimoni.html      ← galeri testimoni
├── paket.html          ← harga & paket kursus
├── pendaftaran.html    ← formulir pendaftaran
├── absensi.html        ← formulir absensi peserta
│
└── assets/
    ├── css/            ← gaya
    │   ├── global.css        (bersama semua halaman)
    │   ├── index.css         (beranda)
    │   ├── testimoni.css
    │   ├── paket.css
    │   ├── pendaftaran.css
    │   └── absensi.css
    ├── js/             ← perilaku
    │   ├── main.js           (bersama: menu, animasi, toast)
    │   ├── testimoni.js      (carousel + lightbox)
    │   ├── pendaftaran.js    (validasi + kirim WhatsApp)
    │   └── absensi.js
    ├── img/
    │   ├── logo.png
    │   ├── bg-testimoni.jpg
    │   └── testimoni/        (testi1–testi8)
    └── video/
        └── hero.mp4
```

**Aturan penamaan:** satu halaman = satu CSS/JS dengan nama yang sama.
Menambah halaman baru? Salin `assets/css/pendaftaran.css` → `assets/css/halaman-baru.css`,
buat `halaman-baru.html`, daftarkan di navbar & footer.

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

## Catatan

- Nomor WhatsApp (`628979480919`) ada di `assets/js/pendaftaran.js`, `assets/js/absensi.js`,
  dan link `wa.me` di setiap halaman HTML. Ganti di sana bila nomor berubah.
- Tombol "Pilih Paket" di `paket.html` membuka `pendaftaran.html?paket=...`
  — formulir terisi otomatis (lihat `assets/js/pendaftaran.js`).
- Halaman utama wajib bernama `index.html` (standar bawaan semua web server).
