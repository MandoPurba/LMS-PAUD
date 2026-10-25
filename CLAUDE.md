# LMS TK/PAUD — Panduan Proyek

Prototype aplikasi web LMS untuk TK/PAUD. Tugas mata kuliah **Software Development Fundamental
(SDF03)**. Fokus penilaian ada pada **analisis & perancangan**, bukan pada aplikasi siap produksi.

**`docs/PRD.md` adalah sumber kebenaran.** Baca dulu sebelum mengerjakan apa pun: di situ ada scope,
skema data D1–D7, daftar FR beserta aturan bisnis, alur development per fase, dan status pemenuhan NFR.

---

## Aturan commit & PR

- **JANGAN** menambahkan trailer `Co-Authored-By`, `Generated with`, atau atribusi AI apa pun — baik di
  commit message maupun di deskripsi pull request. Riwayat git proyek ini harus bersih dari itu.
- Format commit: `feat(fr-01): login & route guard per role` — selalu sertakan kode FR.
  Tipe lain: `fix`, `docs`, `refactor`, `chore`, `style`.
- Satu branch per issue: `feat/fr-01-auth`, `feat/fr-02-master-siswa`, …
- PR menutup issue dengan `Closes #<nomor>`.
- Commit/push hanya bila diminta.

---

## Batasan arsitektur

Tidak ada backend, API, maupun basis data. Jangan pernah mengusulkan Prisma, Postgres, Supabase, atau
layanan eksternal.

- **Stack:** React Router v8 (framework mode) · React 19 · TypeScript · Tailwind CSS v4 · Vite
- **Mode:** SPA (`ssr: false`) — seluruh state ada di browser, jadi SSR hanya menimbulkan masalah
  hidrasi tanpa manfaat.
- **Persistensi:** seed JSON statis di `app/data/seed/` sebagai kondisi awal, perubahan CRUD disimpan
  ke **localStorage**. Harus ada jalan untuk reset kembali ke seed.
- **Agregasi, filter, pencarian, dan paginasi** dihitung di sisi klien.
- **Foto** disimpan base64, dikompres via `<canvas>` sampai ≤ 1 MB sebelum disimpan.
- **Scope:** web saja (aplikasi mobile Ortu di luar scope). **FR-15 (payment gateway) tidak dikerjakan.**

Penamaan berkas dan route wajib mencerminkan DFD pada PRD — data store `D1`–`D7` dan proses
`1.0`–`6.0`. Keterkaitan analisis–desain ikut dinilai, jadi jangan membuat skema sendiri.

---

## Warna & tema

Seluruh token ada di `app/app.css`. **Tidak boleh ada warna hardcode** (`#fff`, `bg-teal-500`,
`rgb(...)`) di komponen.

- Pakai token semantik: `bg-surface`, `bg-surface-raised`, `text-fg`, `text-fg-muted`, `border-border`,
  `bg-primary`, `bg-danger-soft`, …
- Teks di atas isian berwarna penuh: `text-fg-on-brand` (primary), `text-fg-on-strong`
  (danger/success/info), `text-fg-on-accent` (accent/warning — isian kuning butuh teks gelap di
  kedua mode). Latar gelap modal: `bg-overlay`.
- Token domain: `role-admin|guru|ortu`, `hadir|izin|sakit|alpa`, `stppa-bb|mb|bsh|bsb` (+ pasangan `-fg`).
- Ramp mentah (`brand`, `sun`, `leaf`, `blossom`, `sky`, `grape`, `sand`) hanya bila tidak ada token
  semantik yang cocok.
- Radius: `rounded-card`, `rounded-field`, `rounded-pill`. Shadow: `shadow-card`, `shadow-pop`.
- Nilai warna ditulis dalam **HSL**.
- Mode gelap wajib ikut jalan — karena memakai token semantik, ini otomatis.
- Pratinjau seluruh token: route `/tokens`.
- Kelas cetak: `tanpa-cetak` (sembunyikan saat dicetak), `hanya-cetak` (hanya muncul saat dicetak),
  `area-cetak`, `putus-halaman`. Lihat blok `@media print` di `app/app.css`.
- **Chart memakai token sendiri** (`bg-chart-hadir`, `bg-chart-izin`, `bg-chart-sakit`,
  `bg-chart-alpa`, `bg-chart-surface`, `bg-chart-grid`), bukan token badge — syarat kontrasnya
  berbeda. Nilainya hasil validasi buta warna, jangan diganti tanpa menjalankan ulang validator
  palet; penalarannya di PRD §4.5.

---

## Antarmuka

- **Ikon memakai Font Awesome lewat komponen `<Ikon nama="house" />`**, bukan emoji dan bukan kelas
  `fa-*` langsung. CSS-nya dimuat dari paket npm di `app/root.tsx` (bukan CDN) supaya ikon tetap
  tampil tanpa internet; hanya gaya `solid` dan `regular` yang dimuat, jadi jangan memakai `fa-brands`.
  Sebelum memakai nama ikon baru, pastikan nama itu ada di versi free:
  `grep -E "\.fa-NAMA[,{]" node_modules/@fortawesome/fontawesome-free/css/solid.min.css`
- Seluruh teks **bahasa Indonesia** (NFR-07). Istilah domain tetap: Daily Report, STPPA, BB/MB/BSH/BSB.
- Judul memakai `font-display` (Quicksand); teks isi memakai `font-sans` (Inter).
- Harus terbaca di lebar 360 px.
- **Galat di dalam modal ditampilkan di dalam modal itu**, jangan di badan halaman — badan halaman
  tertutup overlay modal sehingga pesannya tidak terlihat. Bentrokan dengan data yang sudah ada
  ditampilkan sebagai dialog tersendiri beserta rincian data penghalangnya.
- Status selalu disertai **label teks**, tidak hanya warna — mis. badge absensi menampilkan huruf
  `H`/`I`/`S`/`A`, badge STPPA menampilkan `BB`/`MB`/`BSH`/`BSB`.

---

## Aturan domain yang mudah terlewat

- **Anak bukan pengguna sistem.** Hanya ada 3 role: `admin`, `guru`, `ortu`. Data anak diakses lewat
  akun orang tuanya.
- **Guru hanya boleh mengakses kelasnya; ortu hanya anaknya** (NFR-04). Berlaku di setiap layar, bukan
  cuma di menu.
- **Daily report hanya bisa dibuat bila anak berstatus Hadir** hari itu, dan field kegiatan wajib terisi.
- **Guru menyetujui izin → status absensi tanggal itu otomatis berubah** menjadi `I` atau `S`.
- **Rapor selalu diturunkan dari data observasi**, tidak bisa dibuat dari nol.
- Satu record absensi per siswa per tanggal; satu daily report per anak per hari.
- **Aspek STPPA pertama dinamai "Nilai Moral & Sosial"** (slug `nilai-moral-sosial`), bukan "Nilai Agama
  dan Moral" seperti Permendikbud 137/2014. Ini penyimpangan yang disengaja dan sudah
  didokumentasikan di PRD §4.2.1 — **jangan dikembalikan tanpa diminta.**

---

## Definition of Done per issue

1. Seluruh acceptance criteria di issue tercentang.
2. Scoping role diuji dengan login sebagai role lain.
3. Data bertahan setelah halaman di-refresh.
4. Terbaca di lebar 360 px dan pada mode gelap.
5. `npm run typecheck` dan `npm run build` lolos.
6. Tanpa warna hardcode.

---

## Perintah

```bash
npm run dev        # server pengembangan
npm run typecheck  # react-router typegen && tsc
npm run build      # build produksi
```
