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

> Password tersimpan sebagai teks biasa di seed JSON. Ini batasan prototype tanpa backend —
> lihat status NFR-03 di PRD §7.

## Halaman

| Path | Keterangan |
|---|---|
| `/login` | Masuk, dengan pengisian cepat akun demo |
| `/admin` | Dashboard Admin Sekolah |
| `/guru` | Dashboard Guru |
| `/ortu` | Dashboard Orang Tua |
| `/403` | Akses ditolak |
| `/tokens` | Pratinjau token tema & palet warna |

Setiap role hanya dapat membuka halaman miliknya. Membuka path role lain akan diarahkan ke `/403`.

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
│   ├── session.ts       login, logout, sesi, route guard
│   └── menu.ts          menu per role
└── routes/
    ├── login.tsx  forbidden.tsx  home.tsx  tokens.tsx
    ├── app-layout.tsx   route guard + kerangka aplikasi
    ├── admin/  guru/  ortu/
```
