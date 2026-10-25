# PRD — Aplikasi LMS TK/PAUD (Prototype)

| | |
|---|---|
| **Mata kuliah** | Software Development Fundamental (SDF03) |
| **Repositori** | `MandoPurba/LMS-PAUD` |
| **Versi dokumen** | 1.0 |
| **Tanggal** | 21 Oktober 2026 |
| **Status** | Disetujui untuk dikerjakan |
| **Dokumen acuan** | Dokumen Analisis & Perancangan (Bab 1–8), `Diagram_LMS_TK_PAUD.drawio` |

---

## 1. Ringkasan

Sebuah TK/PAUD swasta masih mengelola kegiatan belajar-mengajar secara manual: informasi harian
disebar lewat grup WhatsApp, kehadiran dicatat di buku, observasi perkembangan ditulis di kertas, dan
rapor baru disusun menjelang akhir semester. Akibatnya informasi sulit ditelusuri, orang tua tidak
punya gambaran pasti soal aktivitas anaknya, catatan rawan hilang, dan penyusunan rapor lambat.

Produk ini adalah aplikasi web yang menyatukan komunikasi sekolah–orang tua, mendigitalkan pencatatan
harian dan observasi STPPA, serta menurunkan rapor dari data yang sudah terkumpul sepanjang semester.

Karena anak usia TK/PAUD belum bisa mengoperasikan aplikasi, **anak bukan pengguna sistem** — datanya
diakses melalui akun orang tuanya.

---

## 2. Tujuan & Batasan Prototype

### 2.1 Tujuan dokumen ini

Menerjemahkan dokumen analisis (use case, flowchart, DFD) menjadi rencana pengembangan yang bisa
dieksekusi dan didemokan, bukan menjadi produk siap produksi.

### 2.2 Yang dikerjakan

- Aplikasi **web** untuk ketiga role (Admin, Guru, Orang Tua).
- Seluruh 14 functional requirement (FR-01 – FR-14) dalam bentuk alur yang bisa diperagakan.
- Antarmuka yang mencerminkan hak akses tiap role.

### 2.3 Yang TIDAK dikerjakan — dan alasannya

| Di luar scope | Alasan |
|---|---|
| Aplikasi mobile untuk Orang Tua | Prototype difokuskan ke satu platform (web). Role Ortu tetap ada, diakses lewat web. |
| Backend, REST API, basis data | Prototype frontend-only. Tidak ada server yang perlu dinilai di matkul ini. |
| FR-15 — payment gateway SPP | Berprioritas **Won't** di tabel MoSCoW. |
| Deployment, CI/CD, monitoring | Tidak relevan untuk penilaian analisis & perancangan. |
| Keamanan tingkat produksi | Lihat §7 — dicatat eksplisit mana yang tidak terpenuhi. |

> **Konsekuensi yang diterima:** karena tidak ada backend, prototype ini **tidak aman** dan tidak
> memenuhi sebagian NFR keamanan. Itu bukan cacat, melainkan batasan scope yang disengaja dan
> didokumentasikan di §7.

---

## 3. Aktor & Hak Akses

| Aktor | Deskripsi | Hak akses |
|---|---|---|
| **Admin Sekolah** | Kepala sekolah / staf tata usaha | Kelola siswa, guru, ortu, kelas, tahun ajaran; pengumuman & jadwal; lihat semua rekap |
| **Guru** | Guru kelas | Absensi, verifikasi izin, daily report, galeri, observasi, susun rapor — **hanya untuk kelasnya** |
| **Orang Tua** | Wali dari ≥1 anak terdaftar | Lihat daily report, galeri, rapor; ajukan izin; terima notifikasi — **hanya anaknya sendiri** |

Dua aturan scoping di atas (guru → kelasnya, ortu → anaknya) adalah turunan NFR-04 dan wajib terlihat
di setiap layar, bukan hanya di menu.

---

## 4. Keputusan Teknis

| # | Keputusan | Alasan |
|---|---|---|
| T-1 | React Router v8 (framework mode) + TypeScript | Sudah terpasang di repo; routing berbasis file memudahkan pemetaan ke proses DFD. |
| T-2 | Tailwind CSS v4, token tema di `app/app.css` | Satu sumber warna untuk seluruh aplikasi; token domain (peran, absensi, STPPA) sudah tersedia. |
| T-3 | **Seed JSON (statis) → localStorage (perubahan)** | Pengganti basis data. JSON di repo = kondisi awal yang bisa di-reset; localStorage menyimpan hasil CRUD agar alur terasa nyata saat demo. |
| T-4 | Agregasi & filter dihitung di sisi klien | Tidak ada query engine. Data prototype berukuran kecil. |
| T-5 | Route guard di frontend | Satu-satunya lapisan otorisasi yang mungkin tanpa server. |
| T-6 | Foto disimpan sebagai base64, dikompres via `<canvas>` | Tidak ada object storage. Sekaligus memperagakan NFR-09. |
| T-7 | Tanggal selalu dihitung di zona waktu lokal lewat `app/lib/tanggal.ts`, tidak pernah dari `toISOString()` | Di WIB (UTC+7), potongan ISO menunjukkan tanggal kemarin sebelum pukul 07.00 — absensi "hari ini" bisa tercatat di tanggal yang keliru. |
| T-8 | Semester diturunkan dari tanggal: Juli–Desember = Semester 1, Januari–Juni = Semester 2 (`periodeAkademik()`) | Observasi dan rapor disaring per semester. Menyimpan semester di setiap record akan mudah tidak sinkron dengan tanggalnya. |
| T-9 | Unduh PDF memakai `window.print()` dengan lembar gaya `@media print`, bukan pustaka seperti jsPDF | Nol dependensi tambahan, dan dialog cetak peramban sudah menyediakan "Save as PDF". Pustaka PDF juga harus menggambar ulang tata letak dari nol sehingga mudah berbeda dari yang terlihat di layar. |

### 4.1 Struktur data store

Tujuh data store pada DFD Level 1 dipetakan satu-ke-satu menjadi berkas seed:

```
app/data/
├── types.ts                  ← tipe TypeScript seluruh entitas
├── store.ts                  ← baca seed → localStorage, helper CRUD, reset
└── seed/
    ├── users.json            ← D1  User
    ├── siswa.json            ← D2  Siswa & Kelas
    ├── kelas.json            ← D2
    ├── tahun-ajaran.json     ← D2
    ├── absensi.json          ← D3  Absensi
    ├── izin.json             ← D4  Izin
    ├── daily-report.json     ← D5  Daily Report
    ├── galeri.json           ← D5
    ├── stppa.json            ← master aspek & indikator STPPA
    ├── observasi.json        ← D6  Observasi
    ├── rapor.json            ← D7  Rapor
    ├── pengumuman.json       ← pendukung FR-04
    └── notifikasi.json       ← pendukung FR-13
```

### 4.2 Skema entitas inti

```ts
Role = "admin" | "guru" | "ortu"
StatusHadir = "H" | "I" | "S" | "A"
Capaian = "BB" | "MB" | "BSH" | "BSB"
AspekStppa = "nilai-moral-sosial" | "fisik-motorik" | "kognitif"
           | "bahasa" | "sosial-emosional" | "seni"

User         { id, nama, email, password, role, aktif }
TahunAjaran  { id, nama, semesterAktif, aktif }   // tepat satu periode aktif;
                                                 // semester 1 & 2 tersirat
Kelas        { id, nama, tahunAjaranId, guruId }  // guruId = wali kelas
Siswa        { id, nama, nisn, tglLahir, jenisKelamin, kelasId, ortuId }
Absensi      { id, siswaId, tanggal, status, catatan, dicatatOleh }
Izin         { id, siswaId, diajukanOleh, tanggal, jenis, alasan,
               status: "pending"|"disetujui"|"ditolak", diverifikasiOleh }
DailyReport  { id, siswaId, tanggal, kegiatan, makan, tidur, mood,
               foto[], status: "draft"|"published", dibuatOleh }
Observasi    { id, siswaId, tanggal, aspek, indikatorId, capaian,
               catatan, dicatatOleh }
Rapor        { id, siswaId, tahunAjaran, semester,
               capaian: [{ aspek, capaian, jumlahObservasi, narasi }],
               catatanUmum, status: "draft"|"published",
               tglPublikasi, disusunOleh }
```

**Relasi ortu–anak bersifat satu-ke-banyak.** Satu siswa memiliki **satu** orang tua, dan satu orang
tua dapat memiliki **lebih dari satu** siswa. Karena itu relasinya disimpan sebagai `Siswa.ortuId`
(bukan daftar di sisi siswa): daftar anak seorang orang tua diperoleh dengan menyaring siswa
berdasarkan `ortuId`-nya.

Penyederhanaan yang disengaja: di kenyataan seorang anak sering punya dua wali (ayah dan ibu). Untuk
prototype, satu anak dipetakan ke satu akun wali agar aturan akses NFR-04 tetap tunggal dan mudah
diperagakan. Mengubahnya menjadi banyak-ke-banyak kelak hanya menyentuh satu field.

### 4.2.1 Enam aspek perkembangan

| Slug | Label tampilan | Cakupan |
|---|---|---|
| `nilai-moral-sosial` | **Nilai Moral & Sosial** | Kasih terhadap sesama, sopan santun, kejujuran, tanggung jawab, kepedulian |
| `fisik-motorik` | Fisik-Motorik | Motorik kasar, motorik halus, kesehatan & perilaku keselamatan |
| `kognitif` | Kognitif | Belajar & pemecahan masalah, berpikir logis, berpikir simbolik |
| `bahasa` | Bahasa | Memahami bahasa, mengungkapkan bahasa, keaksaraan |
| `sosial-emosional` | Sosial-Emosional | Kesadaran diri, rasa tanggung jawab, perilaku prososial |
| `seni` | Seni | Mengeksplorasi & mengekspresikan diri secara kreatif |

**Catatan penyimpangan dari standar.** Permendikbud 137/2014 menamai aspek pertama
*"Nilai Agama dan Moral"*. Prototype ini menggunakan **"Nilai Moral & Sosial"** — aspek yang dinilai
tetap sama (sikap, akhlak, dan kepedulian terhadap sesama), namun penekanannya diletakkan pada nilai
moral dan kasih terhadap sesama alih-alih pada ajaran agama tertentu, agar penilaian tetap netral bagi
anak dari latar belakang keyakinan apa pun. Penyimpangan ini disengaja dan dicatat di sini supaya
perbedaan dengan dokumen analisis (Bab 1.4) dapat dipertanggungjawabkan; mengembalikannya ke penamaan
resmi hanya memerlukan perubahan satu slug dan satu label di `app/data/seed/stppa.json`.

### 4.3 Pemetaan route ke proses DFD

| Proses DFD | Route | FR |
|---|---|---|
| 1.0 Login & Autentikasi | `/login` | FR-01 |
| 2.0 Kelola Master Data | `/admin/siswa`, `/admin/guru`, `/admin/ortu` | FR-02 |
| 2.0 | `/admin/kelas`, `/admin/tahun-ajaran` | FR-03 |
| 2.0 | `/admin/pengumuman`, `/admin/jadwal`, `/admin/menu-makan` | FR-04 |
| 3.0 Absensi & Izin | `/guru/absensi` | FR-05 |
| 3.0 | `/ortu/izin`, `/guru/izin` | FR-06 |
| 4.0 Daily Report & Galeri | `/guru/daily-report` | FR-07 |
| 4.0 | `/ortu/daily-report` | FR-08 |
| 4.0 | `/galeri` | FR-09 |
| 5.0 Observasi & Rapor | `/guru/observasi` | FR-10 |
| 5.0 | `/guru/rapor` | FR-11 |
| 5.0 | `/ortu/rapor` | FR-12 |
| 6.0 Laporan | `/admin/laporan`, `/guru/laporan` | FR-14 |
| (lintas proses) | ikon notifikasi di header | FR-13 |

### 4.4 Keutuhan data tanpa basis data

Tanpa basis data tidak ada *foreign key*, jadi aturan referensi ditegakkan di `app/lib/relasi.ts`.
Alasannya praktis: bila sebuah kelas dihapus sementara siswanya masih menunjuk ke kelas itu, rujukan
yang menggantung baru terasa akibatnya di FR-05 ke atas, ketika absensi dan daily report mulai menyaring
berdasarkan kelas. Karena itu penghapusan **ditolak** selagi masih ada yang merujuk (BR-9), dengan pesan
yang menyebutkan apa yang harus dibereskan lebih dulu.

Dengan alasan yang sama, nomor urut ID disimpan terpisah dari datanya, sehingga ID yang sudah dihapus
tidak pernah dipakai ulang oleh record baru.

Penolakan harus dapat ditemukan. Semula tombol Hapus dinonaktifkan dengan alasan ditaruh di atribut
`title`, tetapi peramban menekan pointer event pada elemen nonaktif sehingga keterangannya sering
tidak pernah muncul — pengguna hanya melihat tombol kelabu tanpa penjelasan. Karena itu tombol
dibiarkan aktif, dan alasan penolakan ditampilkan di dalam dialog pada saat pengguna mencoba
menghapus. Aturan yang tidak dapat ditemukan tidak berbeda dari cacat.

### 4.5 Warna chart: hasil validasi, bukan selera

Warna pada chart tidak memakai token badge (`--hadir`, `--izin`, …) melainkan token terpisah
(`--chart-hadir`, …). Alasannya dua hal berbeda: badge duduk di atas latar `-soft` dan harus lolos
kontras **teks**, sedangkan mark chart duduk di atas permukaan plot dan harus lolos **pemisahan buta
warna** antar seri yang berdampingan.

Palet keempat status diuji dengan validator (bukan dikira-kira). Hasil pertama **gagal**: `leaf-600`
(hadir) ↔ `sun-600` (izin) hanya terpisah ΔE 5.8 pada protanopia — hijau dan oranye memang pasangan
yang paling sering tertukar. Dari 135 kombinasi step yang diuji, nilai berikut dipakai:

| Mode | Hadir | Izin | Sakit | Alpa | Permukaan plot | Hasil |
|---|---|---|---|---|---|---|
| Terang | `leaf-700` | `sun-600` | `sky-600` | `blossom-600` | putih | **lolos semua** |
| Gelap | `leaf-600` | `sun-700` | `sky-600` | `blossom-600` | `sand-950` | lolos, CVD di band 6–8 |

Mode gelap tidak bisa mencapai ΔE ≥ 8 dengan ramp yang ada karena band terang-gelap untuk mode gelap
sempit (OKLCH L 0.48–0.67), sehingga jarak terang antara hijau dan oranye tidak cukup. Band 6–8 sah
**hanya bila ada pengkodean kedua**, dan ketiganya disediakan: jarak 2 px antar segmen, label nilai
langsung pada segmen yang cukup lebar, serta tabel padanan yang memuat seluruh angka. Permukaan plot
di mode gelap memakai `sand-950`, bukan `sand-900`, karena hanya dengan itu kontras mark lolos 3:1.

Skala capaian STPPA bukan kategori melainkan data berurutan (BB < MB < BSH < BSB), jadi memakai ramp
satu rona terang→gelap, dan setiap sel selalu menuliskan kodenya sehingga tidak bergantung warna.

---

## 5. Functional Requirements

Acceptance criteria rinci berada di masing-masing GitHub issue. Tabel ini merangkum dan memetakan
prioritas, ketergantungan, serta proses DFD terkait.

| FR | Kebutuhan | MoSCoW | Aktor | Proses | Issue | Bergantung pada |
|---|---|---|---|---|---|---|
| FR-01 | Login & menu berbasis role | **Must** | Semua | 1.0 | [#2](https://github.com/MandoPurba/LMS-PAUD/issues/2) | — |
| FR-02 | CRUD siswa, guru, orang tua | **Must** | Admin | 2.0 | [#3](https://github.com/MandoPurba/LMS-PAUD/issues/3) | FR-01 |
| FR-03 | Kelas, tahun ajaran, relasi ortu–anak | **Must** | Admin | 2.0 | [#4](https://github.com/MandoPurba/LMS-PAUD/issues/4) | FR-02 |
| FR-04 | Pengumuman, jadwal, menu makan | Should | Admin | 2.0 | [#5](https://github.com/MandoPurba/LMS-PAUD/issues/5) | FR-01, FR-03 |
| FR-05 | Absensi harian H/I/S/A | **Must** | Guru | 3.0 | [#6](https://github.com/MandoPurba/LMS-PAUD/issues/6) | FR-03 |
| FR-06 | Pengajuan izin + approval guru | Should | Ortu, Guru | 3.0 | [#7](https://github.com/MandoPurba/LMS-PAUD/issues/7) | FR-05 |
| FR-07 | Input daily report per anak | **Must** | Guru | 4.0 | [#8](https://github.com/MandoPurba/LMS-PAUD/issues/8) | FR-03 |
| FR-08 | Ortu membaca daily report | **Must** | Ortu | 4.0 | [#9](https://github.com/MandoPurba/LMS-PAUD/issues/9) | FR-07 |
| FR-09 | Galeri foto kegiatan kelas | Should | Guru, Ortu | 4.0 | [#10](https://github.com/MandoPurba/LMS-PAUD/issues/10) | FR-03 |
| FR-10 | Observasi STPPA (BB/MB/BSH/BSB) | Should | Guru | 5.0 | [#11](https://github.com/MandoPurba/LMS-PAUD/issues/11) | FR-03 |
| FR-11 | Draft rapor + narasi guru | Could | Guru | 5.0 | [#12](https://github.com/MandoPurba/LMS-PAUD/issues/12) | FR-10 |
| FR-12 | Ortu lihat & unduh rapor PDF | Could | Ortu | 5.0 | [#13](https://github.com/MandoPurba/LMS-PAUD/issues/13) | FR-11 |
| FR-13 | Notifikasi otomatis | Should | Sistem | lintas | [#14](https://github.com/MandoPurba/LMS-PAUD/issues/14) | FR-04, 06, 07, 11 |
| FR-14 | Rekap absensi & capaian | Could | Admin, Guru | 6.0 | [#15](https://github.com/MandoPurba/LMS-PAUD/issues/15) | FR-05, FR-10 |
| ~~FR-15~~ | ~~Payment gateway SPP~~ | **Won't** | — | — | — | tidak dikerjakan |

### 5.1 Aturan bisnis yang mengikat

Empat aturan berikut berasal dari flowchart dan relasi use case, dan harus benar-benar berlaku di
prototype — bukan hanya digambar:

| Kode | Aturan | Sumber |
|---|---|---|
| BR-1 | Daily report hanya dapat dibuat bila anak berstatus **Hadir** pada tanggal tersebut. | Flowchart, cabang pertama |
| BR-2 | Field **kegiatan wajib** terisi sebelum daily report dapat disimpan. | Flowchart, cabang kedua |
| BR-3 | Guru menyetujui izin → status absensi tanggal itu otomatis berubah menjadi **I** atau **S**, menimpa status sebelumnya. | Use case: Verifikasi Izin «extend» Input Absensi |
| BR-4 | Rapor selalu diturunkan dari data observasi yang sudah tercatat; tidak bisa dibuat dari nol. | Use case: Rapor «include» Input Observasi |
| BR-5 | Satu record absensi per siswa per tanggal; satu daily report per anak per hari. Menyimpan ulang menimpa, tidak menambah. | AC issue #6 dan #8 |
| BR-6 | Guru hanya mengakses data kelasnya; ortu hanya data anaknya. | NFR-04 |
| BR-7 | Setiap tahun ajaran terdiri dari Semester 1 dan Semester 2. Tepat satu **periode** — pasangan tahun ajaran + semester — berstatus aktif; mengaktifkan satu periode menonaktifkan yang lain. Pergantian periode wajib dikonfirmasi karena mengubah apa yang dilihat guru. | AC issue #4 |
| BR-8 | Satu guru menjadi wali paling banyak satu kelas per tahun ajaran, sehingga "kelas saya" selalu tunggal. | Dok. analisis menyebut "kelasnya" dalam bentuk tunggal |
| BR-9 | Penghapusan ditolak bila masih dirujuk: ortu yang punya anak, guru yang jadi wali kelas, kelas yang berisi siswa, tahun ajaran yang aktif atau masih punya kelas. Alasannya **wajib ditampilkan saat pengguna mencoba menghapus**, bukan hanya lewat tombol yang dinonaktifkan. | Pengganti foreign key, lihat §4.4 |
| BR-10 | Satu indikator STPPA punya satu catatan observasi per tanggal; tanggal berbeda tetap menghasilkan record baru agar progresi anak terjaga. | AC issue #11 |
| BR-11 | Capaian per aspek yang dipakai menyusun rapor adalah observasi **bertanggal paling baru** pada aspek tersebut dalam satu semester. | Dasar FR-11 |
| BR-12 | Rapor berstatus terbit bersifat hanya-baca; penyuntingan dan perhitungan ulang ditolak. Untuk memperbaikinya, rapor ditarik kembali ke draft terlebih dahulu. | AC issue #12 |
| BR-13 | Hanya aspek yang benar-benar punya observasi yang masuk ke rapor; aspek tanpa data tidak dibuat-buat. | Turunan BR-4 |
| BR-14 | Menyetujui izin untuk tanggal yang sudah punya daily report terbit mengembalikan report itu ke **draft**. Datanya tidak dihapus. | Turunan BR-1 + BR-3, lihat §5.2 |
| BR-15 | Satu siswa hanya boleh punya satu pengajuan izin aktif (menunggu atau disetujui) per tanggal. Pengajuan yang ditolak membebaskan tanggal itu. | AC issue #7 |

### 5.2 Benturan antara BR-1 dan BR-3

BR-3 mengizinkan izin disetujui untuk tanggal yang sudah lewat, sedangkan BR-1 mensyaratkan anak
berstatus Hadir agar punya daily report. Keduanya bertemu pada satu kasus: guru menyetujui izin untuk
tanggal yang **sudah** punya daily report terbit. Setelah disetujui anak menjadi tidak hadir, sehingga
report tersebut tidak lagi sah menurut BR-1 — tetapi orang tua sudah dapat melihatnya.

Tiga pilihan penanganan dipertimbangkan: menolak persetujuan, menghapus report, atau mengembalikan
report ke draft. Yang dipakai adalah **mengembalikan ke draft** (BR-14): persetujuan tetap berjalan
sebagaimana BR-3 mengharuskan, report berhenti terlihat orang tua sebagaimana BR-1 mengharuskan, dan
catatan guru tidak hilang. Dialog persetujuan memberi tahu guru sebelum tindakan dijalankan, jadi
akibatnya tidak terjadi diam-diam.

---

## 6. Alur Development

### 6.1 Prinsip urutan

Urutan dikunci oleh dependensi data, bukan oleh prioritas MoSCoW semata: **tidak ada fitur yang bisa
dikerjakan sebelum entitas yang dirujuknya ada.** FR-03 adalah simpul terpenting — tujuh FR bergantung
padanya, langsung atau tidak langsung, karena di situlah relasi kelas–siswa–ortu terbentuk.

```
FR-01 ──┬── FR-02 ── FR-03 ──┬── FR-04
        │                    ├── FR-05 ── FR-06
        │                    ├── FR-07 ── FR-08
        │                    ├── FR-09
        │                    └── FR-10 ── FR-11 ── FR-12
        │                                   │
        │                    FR-05 + FR-10 ─┴── FR-14
        └── FR-13 (menempel pada FR-04, 06, 07, 11)
```

### 6.2 Fase

| Fase | Tanggal | Isi | Keluaran yang bisa didemokan |
|---|---|---|---|
| **0 — Fondasi UI** | 21 Okt *(selesai)* | Token tema & palet warna, halaman pratinjau `/tokens` | Design system konsisten, mode terang & gelap |
| **1 — Fondasi data** | Dev 22 Okt → QA 23 Okt | FR-01, FR-02, FR-03 | Login 3 role, menu berbeda per role, data master terisi dan saling terhubung |
| **2 — Operasional harian** | Dev 23 Okt → QA 24 Okt | FR-05, FR-07, FR-08 | Guru absen → isi daily report → ortu membacanya. **Inti nilai produk.** |
| **3 — Pelengkap** | Dev 24 Okt → QA 25 Okt | FR-04, FR-06, FR-09, FR-10 | Pengumuman, siklus izin (BR-3), galeri, observasi STPPA |
| **4 — Rapor & laporan** | Dev 25 Okt → QA 26 Okt | FR-11, FR-12, FR-13, FR-14 | Draft rapor dari observasi, unduh PDF, notifikasi, rekap |

Fase 2 adalah fase yang paling menentukan: alur guru → ortu di situ persis menjawab permasalahan utama
pada Bab 1.2, dan merupakan proses yang dirinci oleh flowchart.

### 6.3 Definition of Done per issue

Sebuah issue ditutup bila:

1. Seluruh checkbox acceptance criteria di issue tercentang.
2. Scoping role berlaku (BR-6) — diuji dengan login sebagai role lain.
3. Perubahan data bertahan setelah halaman di-*refresh* (localStorage).
4. Layar tetap terbaca di lebar 360 px dan pada mode gelap.
5. `npm run typecheck` dan `npm run build` lolos.
6. Hanya memakai token tema dari `app/app.css`, tanpa warna hardcode.

### 6.4 Konvensi kerja

- Satu branch per issue: `feat/fr-01-auth`, `feat/fr-02-master-siswa`, …
- Commit menyebut kode FR: `feat(fr-01): login & route guard per role`.
- Pull request menutup issue dengan `Closes #2`.

---

## 7. Non-Functional Requirements — Status Pemenuhan

Kolom status dinilai apa adanya. Prototype frontend-only memang tidak dapat memenuhi sebagian NFR, dan
hal itu lebih berguna dicatat daripada diklaim terpenuhi.

| NFR | Kategori | Kebutuhan | Status | Keterangan |
|---|---|---|---|---|
| NFR-01 | Performance | Daily report tampil ≤ 3 detik di 4G | ⚠️ Tidak dapat diuji sahih | Data dibaca dari localStorage, tanpa jaringan — angkanya tidak mewakili kondisi nyata |
| NFR-02 | Availability | Uptime ≥ 99% / bulan | ❌ Tidak dipenuhi | Tidak ada deployment maupun server |
| NFR-03 | Security | Password di-hash bcrypt, komunikasi HTTPS | ❌ Tidak dipenuhi | Password tersimpan sebagai teks biasa di seed JSON. Titik integrasi untuk implementasi nyata |
| NFR-04 | Security | Data & foto anak hanya untuk ortu, guru kelas, admin | 🟡 Disimulasikan | Route guard + filter per role di klien. Alur otorisasinya terlihat, tetapi tidak aman karena seluruh data ada di sisi klien |
| NFR-05 | Security | Foto lewat signed URL yang kedaluwarsa | ❌ Tidak dipenuhi | Foto disimpan base64 di klien; tidak ada object storage yang bisa menandatangani URL |
| NFR-06 | Usability | Input daily report satu anak ≤ 2 menit | ✅ Dipenuhi | Dapat diukur langsung saat demo |
| NFR-07 | Usability | Bahasa Indonesia, ikon sederhana | ✅ Dipenuhi | Seluruh antarmuka berbahasa Indonesia; rapor cetak memakai istilah resmi STPPA |
| NFR-08 | Availability | Android 9+/iOS 14+ untuk ortu; Chrome, Firefox, Edge untuk admin & guru | 🟡 Sebagian | Bagian web dipenuhi. Aplikasi mobile di luar scope (§2.3) |
| NFR-09 | Efficiency | Foto dikompres otomatis ≤ 1 MB | ✅ Dipenuhi | Kompresi di klien lewat `<canvas>`: sisi terpanjang 1280 px, mutu JPEG diturunkan bertahap sampai ≤ 400 KB; foto yang tetap > 1 MB ditolak. Lihat §7.1 |
| NFR-10 | Reliability | Backup harian, retensi 30 hari | ❌ Tidak dipenuhi | Tidak ada basis data. Tersedia tombol *reset ke seed* sebagai pengganti saat demo |
| NFR-11 | Responsiveness | Notifikasi diterima ≤ 1 menit | 🟡 Disimulasikan | Notifikasi in-app muncul seketika; tanpa push/email |
| NFR-12 | Reliability | Log aktivitas untuk absensi, observasi, rapor | 🟡 Disimulasikan | Log disimpan sebagai array di localStorage dan dapat ditampilkan |

**Rekapitulasi:** 3 dipenuhi · 5 disimulasikan/sebagian · 4 tidak dipenuhi.
Seluruh yang tidak dipenuhi berakar pada satu sebab yang sama: tidak adanya backend.

### 7.1 Ketegangan antara NFR-09 dan kuota localStorage

NFR-09 mengizinkan foto sampai 1 MB, tetapi prototype menyimpan foto sebagai base64 di localStorage
yang kuotanya hanya sekitar 5 MB — dan base64 membengkakkan ukuran sekitar 33%. Dengan batas 1 MB,
empat foto saja sudah hampir menghabiskan kuota.

Karena itu kompresi menargetkan **400 KB** per foto (di bawah ambang NFR-09, jadi NFR-09 tetap
terpenuhi) dengan maksimal **2 foto per daily report**. Halaman daily report menampilkan persentase
kuota yang terpakai, dan kegagalan penulisan ditangkap lalu disampaikan sebagai pesan, bukan dibiarkan
hilang diam-diam. Pada implementasi nyata foto akan berada di object storage, sehingga batas 1 MB
penuh dapat dipakai.

---

## 8. Skenario Demo

Satu alur berurutan yang menyentuh semua Must-have dan membuktikan BR-1 sampai BR-4:

1. **Login sebagai Admin** → tambah 1 siswa, buat kelas, tetapkan guru kelas, hubungkan ke akun ortu. *(FR-01, 02, 03)*
2. **Login sebagai Guru** → buka absensi hari ini, tandai satu anak **Alpa**, sisanya Hadir. *(FR-05)*
3. **Coba buat daily report untuk anak yang Alpa** → sistem menolak. *(BR-1 terbukti)*
4. **Buat daily report untuk anak yang Hadir**, kosongkan kegiatan → ditolak; isi lengkap + unggah foto besar → foto terkompres, tersimpan. *(FR-07, BR-2, NFR-09)*
5. **Login sebagai Ortu** → notifikasi muncul, buka daily report anaknya. Coba akses data anak lain → ditolak. *(FR-08, FR-13, BR-6)*
6. **Ortu ajukan izin** untuk besok → **Guru menyetujui** → absensi besok otomatis menjadi **I**. *(FR-06, BR-3)*
7. **Guru catat observasi STPPA**, lalu **generate draft rapor** → narasi terisi otomatis dari observasi, guru melengkapi, publikasikan. *(FR-10, FR-11, BR-4)*
8. **Ortu unduh rapor PDF**; **Admin buka rekap** absensi & capaian per kelas. *(FR-12, FR-14)*

---

## 9. Risiko

| Risiko | Dampak | Penanganan |
|---|---|---|
| Kuota localStorage (±5 MB) habis karena foto base64 | Penyimpanan gagal, demo terhenti | Kompres ≤ 1 MB, batasi jumlah foto per report, sediakan tombol reset |
| FR-03 terlambat | Tujuh FR ikut tertahan | Jadikan prioritas tertinggi di Fase 1; boleh dirilis dengan UI minimal |
| Fase 4 menumpuk di satu hari | FR-11/12/14 tidak selesai | Ketiganya berprioritas *Could* — boleh diturunkan tanpa mengganggu penilaian Must-have |
| Perbedaan antara dokumen analisis dan implementasi | Nilai keterkaitan analisis–desain turun | Penamaan berkas dan route mengikuti D1–D7 serta proses 1.0–6.0 (§4.1, §4.3) |

---

## 10. Matriks Keterkaitan

Menghubungkan permasalahan pada Bab 1.2 dokumen analisis sampai ke issue yang mengerjakannya.

| Permasalahan (Bab 1.2) | Dijawab FR | Proses DFD | Data store | Issue |
|---|---|---|---|---|
| Informasi tersebar di WhatsApp, sulit ditelusuri | FR-04, FR-13 | 2.0, lintas | — | #5, #14 |
| Ortu tak tahu aktivitas harian anak | FR-07, FR-08 | 4.0 | D5 | #8, #9 |
| Catatan observasi di kertas, rawan hilang | FR-10 | 5.0 | D6 | #11 |
| Penyusunan rapor lama | FR-11, FR-12 | 5.0 | D6 → D7 | #12, #13 |
| Izin lewat chat pribadi, tanpa rekap | FR-06 | 3.0 | D4 → D3 | #7 |
| Foto anak berisiko dilihat pihak lain | FR-09 + NFR-04, NFR-05 | 4.0 | D5 | #10 |
| Kehadiran dicatat manual di buku | FR-05, FR-14 | 3.0, 6.0 | D3 | #6, #15 |
