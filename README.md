# LMS TK/PAUD — Prototype

Prototype aplikasi web Learning Management System untuk TK/PAUD. Tugas mata kuliah **Software
Development Fundamental (SDF03)**.

Prototype ini **tidak memiliki backend maupun basis data**. Data awal dibaca dari seed JSON di
`app/data/seed/`, dan perubahannya disimpan ke `localStorage` browser.

- **Spesifikasi lengkap:** [`docs/PRD.md`](docs/PRD.md)
- **Panduan pengembangan:** [`CLAUDE.md`](CLAUDE.md)

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
```

Perintah lain: `npm run typecheck`, `npm run build`.

## Akun demo

Tersedia tombol pengisian cepat di halaman masuk.

| Role | Email | Password |
|---|---|---|
| Admin Sekolah | `admin@paud.sch.id` | `admin123` |
| Guru | `sari@paud.sch.id` | `guru123` |
| Guru | `budi@paud.sch.id` | `guru123` |
| Orang Tua | `rina@gmail.com` | `ortu123` |
| Orang Tua | `andi@gmail.com` | `ortu123` |
| Guru *(nonaktif)* | `dewi@paud.sch.id` | `guru123` |

Akun terakhir sengaja dibuat nonaktif untuk memperagakan penolakan login.

Kondisi awal data: tahun ajaran **2026/2027 Semester 1** aktif, dua kelas (Kelompok A diampu Sari,
Kelompok B diampu Budi), 8 dari 10 siswa sudah ditempatkan, Rina punya 3 anak dan Andi 2 anak.
Sisanya sengaja dibiarkan kosong agar alur penempatan dan penghubungan bisa diperagakan.

> Password tersimpan sebagai teks biasa di seed JSON. Ini batasan prototype tanpa backend —
> lihat status NFR-03 di PRD §7.

## Halaman

| Path | Keterangan |
|---|---|
| `/login` | Masuk, dengan pengisian cepat akun demo |
| `/admin` | Dashboard Admin Sekolah |
| `/admin/siswa` | CRUD data siswa |
| `/admin/guru` | CRUD akun guru |
| `/admin/orang-tua` | CRUD akun orang tua |
| `/admin/tahun-ajaran` | CRUD tahun ajaran + set tahun aktif |
| `/admin/kelas` | CRUD kelas + penetapan wali kelas |
| `/guru/absensi` | Input absensi harian H/I/S/A untuk kelas yang diampu |
| `/guru/izin` | Guru menyetujui / menolak pengajuan izin |
| `/ortu/izin` | Orang tua mengajukan izin atau sakit + riwayat status |
| `/guru/daily-report` | Isi daily report per anak (hanya untuk anak yang Hadir) |
| `/ortu/daily-report` | Orang tua membaca daily report anaknya (hanya yang terbit) |
| `/guru/observasi` | Catat observasi STPPA per aspek & indikator, filter semester |
| `/admin/laporan` | Rekap absensi & capaian semua kelas |
| `/guru/laporan` | Rekap absensi & capaian kelas yang diampu |
| `/guru/rapor` | Susun draft rapor dari observasi, sunting narasi, terbitkan |
| `/ortu/rapor` | Orang tua melihat & mengunduh rapor anaknya sebagai PDF |
| `/guru` | Dashboard Guru |
| `/ortu` | Dashboard Orang Tua |
| `/403` | Akses ditolak |
| `/tokens` | Pratinjau token tema & palet warna |

Setiap role hanya dapat membuka halaman miliknya. Membuka path role lain akan diarahkan ke `/403`.

## Foto

Foto daily report dikompres di browser sebelum disimpan: sisi terpanjang 1280 px, mutu JPEG
diturunkan bertahap sampai di bawah 400 KB, maksimal 2 foto per report. Batas ini lebih ketat
daripada NFR-09 (1 MB) karena kuota `localStorage` hanya sekitar 5 MB — lihat PRD §7.1.

## Unduh rapor sebagai PDF

Halaman `/ortu/rapor` memakai `window.print()` dengan lembar gaya `@media print` di `app/app.css`,
tanpa pustaka PDF tambahan. Pilih tujuan **Save as PDF** di dialog cetak peramban.

Saat dicetak, kerangka aplikasi (`.tanpa-cetak`) disembunyikan, kepala surat dan kolom tanda tangan
(`.hanya-cetak`) dimunculkan, dan tema dipaksa terang agar tidak membuang tinta.

## Mereset data

Hapus data situs untuk `localhost:5173` di browser, atau jalankan di konsol:

```js
Object.keys(localStorage)
  .filter((k) => k.startsWith("lms-paud:"))
  .forEach((k) => localStorage.removeItem(k));
```

## Struktur

```
app/
├── app.css              token tema (warna HSL, mode terang & gelap)
├── root.tsx
├── routes.ts            daftar route
├── components/          AppShell, RoleBadge, komponen UI bersama
├── data/
│   ├── types.ts         tipe domain
│   └── seed/            data awal, satu berkas per data store DFD
├── lib/
│   ├── storage.ts       pembungkus localStorage + reset
│   ├── repo.ts          repositori CRUD generik di atas localStorage
│   ├── relasi.ts        pertanyaan lintas entitas + aturan keutuhan data
│   ├── absensi.ts       simpan/baca absensi, label & warna status
│   ├── izin.ts          pengajuan izin + persetujuan yang mengubah absensi
│   ├── daily-report.ts  simpan/baca report, gerbang "harus Hadir"
│   ├── foto.ts          kompresi foto via canvas
│   ├── stppa.ts         master aspek/indikator, observasi, capaian per aspek
│   ├── rapor.ts         susun draft dari observasi, narasi, terbit/tarik
│   ├── laporan.ts       agregasi rekap absensi & capaian
│   ├── laporan-loader.ts  data laporan per role
│   ├── tanggal.ts       helper tanggal zona waktu lokal
│   ├── session.ts       login, logout, sesi, route guard
│   ├── useTabelData.ts  pencarian + paginasi sisi klien
│   └── menu.ts          menu per role
└── routes/
    ├── login.tsx  forbidden.tsx  home.tsx  tokens.tsx
    ├── app-layout.tsx   route guard + kerangka aplikasi
    ├── admin/  guru/  ortu/
```
