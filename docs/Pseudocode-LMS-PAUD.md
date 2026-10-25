# PSEUDOCODE APLIKASI LMS TK/PAUD

*Dokumen Pseudocode Modul yang Telah Diimplementasikan*

- **Mata kuliah:** Software Development Fundamental (SDF03)
- **Repositori:** github.com/MandoPurba/LMS-PAUD
- **Versi dokumen:** 1.1
- **Tanggal:** 25 Oktober 2026
- **Cakupan:** 12 dari 14 functional requirement yang sudah diimplementasikan
- **Dokumen acuan:** Dokumen Analisis & Perancangan; docs/PRD.md

## Daftar Isi

- [1. Pendahuluan](#1-pendahuluan)
    - [1.1 Cakupan](#11-cakupan)
    - [1.2 Notasi yang dipakai](#12-notasi-yang-dipakai)
- [2. Struktur Data](#2-struktur-data)
- [3. Ketentuan Umum](#3-ketentuan-umum)
    - [3.1 Penomoran Record](#31-penomoran-record)
    - [3.2 Tanggal dan Periode Akademik](#32-tanggal-dan-periode-akademik)
- [4. FR-01 — Login dan Menu Berbasis Role](#4-fr-01-login-dan-menu-berbasis-role)
    - [4.1 Proses Login](#41-proses-login)
    - [4.2 Pembatasan Akses Halaman](#42-pembatasan-akses-halaman)
- [5. FR-02 — CRUD Data Siswa, Guru, dan Orang Tua](#5-fr-02-crud-data-siswa-guru-dan-orang-tua)
    - [5.1 Validasi Data Akun (Guru / Orang Tua)](#51-validasi-data-akun-guru-orang-tua)
    - [5.2 Validasi Data Siswa](#52-validasi-data-siswa)
    - [5.3 Pencarian dan Paginasi](#53-pencarian-dan-paginasi)
- [6. FR-03 — Kelas, Tahun Ajaran, dan Relasi Ortu–Anak](#6-fr-03-kelas-tahun-ajaran-dan-relasi-ortuanak)
    - [6.1 Mengaktifkan Tahun Ajaran](#61-mengaktifkan-tahun-ajaran)
    - [6.2 Semester yang Sedang Berjalan](#62-semester-yang-sedang-berjalan)
    - [6.3 Guru yang Masih Boleh Menjadi Wali Kelas](#63-guru-yang-masih-boleh-menjadi-wali-kelas)
    - [6.4 Pemeriksaan Sebelum Menghapus](#64-pemeriksaan-sebelum-menghapus)
- [7. FR-05 — Input Absensi Harian](#7-fr-05-input-absensi-harian)
    - [7.1 Menyimpan Absensi](#71-menyimpan-absensi)
    - [7.2 Rekap Status Satu Hari](#72-rekap-status-satu-hari)
- [8. FR-06 — Pengajuan Izin dan Persetujuan Guru](#8-fr-06-pengajuan-izin-dan-persetujuan-guru)
    - [8.1 Validasi Pengajuan](#81-validasi-pengajuan)
    - [8.2 Mengajukan Izin](#82-mengajukan-izin)
    - [8.3 Menyetujui Izin](#83-menyetujui-izin)
    - [8.4 Menolak Izin](#84-menolak-izin)
- [9. FR-07 — Input Daily Report](#9-fr-07-input-daily-report)
    - [9.1 Syarat Pengisian](#91-syarat-pengisian)
    - [9.2 Validasi Isi Report](#92-validasi-isi-report)
    - [9.3 Kompresi Foto](#93-kompresi-foto)
- [10. FR-08 — Orang Tua Membaca Daily Report](#10-fr-08-orang-tua-membaca-daily-report)
    - [10.1 Penentuan Anak yang Dibuka](#101-penentuan-anak-yang-dibuka)
    - [10.2 Daftar Report yang Boleh Dibaca](#102-daftar-report-yang-boleh-dibaca)
- [11. FR-10 — Observasi Perkembangan STPPA](#11-fr-10-observasi-perkembangan-stppa)
    - [11.1 Menyimpan Observasi](#111-menyimpan-observasi)
    - [11.2 Observasi Satu Semester](#112-observasi-satu-semester)
    - [11.3 Capaian Terakhir per Aspek](#113-capaian-terakhir-per-aspek)
- [12. FR-11 — Draft Rapor Semester](#12-fr-11-draft-rapor-semester)
    - [12.1 Syarat Penyusunan](#121-syarat-penyusunan)
    - [12.2 Menyusun Capaian dan Narasi](#122-menyusun-capaian-dan-narasi)
    - [12.3 Menyusun, Memperbarui, dan Menerbitkan](#123-menyusun-memperbarui-dan-menerbitkan)
- [13. FR-12 — Orang Tua Melihat dan Mengunduh Rapor](#13-fr-12-orang-tua-melihat-dan-mengunduh-rapor)
- [14. FR-13 — Notifikasi Otomatis](#14-fr-13-notifikasi-otomatis)
    - [14.1 Sumber Peristiwa](#141-sumber-peristiwa)
    - [14.2 Penanda Baca](#142-penanda-baca)
    - [14.3 Menyusun Daftar Notifikasi](#143-menyusun-daftar-notifikasi)
- [15. FR-14 — Rekap Absensi dan Capaian Perkembangan](#15-fr-14-rekap-absensi-dan-capaian-perkembangan)
    - [15.1 Rekap Absensi Satu Bulan](#151-rekap-absensi-satu-bulan)
    - [15.2 Deteksi Tanggal yang Perlu Diperiksa](#152-deteksi-tanggal-yang-perlu-diperiksa)
    - [15.3 Rekap Capaian per Kelas](#153-rekap-capaian-per-kelas)
    - [15.4 Pembatasan Kelas Menurut Role](#154-pembatasan-kelas-menurut-role)
- [16. Daftar Aturan Bisnis dan Lokasinya](#16-daftar-aturan-bisnis-dan-lokasinya)
- [17. Pemetaan ke Proses DFD dan Berkas Program](#17-pemetaan-ke-proses-dfd-dan-berkas-program)

---

## 1. Pendahuluan

Dokumen ini memuat pseudocode dari proses-proses yang sudah selesai diimplementasikan pada aplikasi LMS TK/PAUD. Pseudocode disusun pada tingkat alur proses: menjelaskan langkah, urutan, dan keputusan yang diambil sistem, tanpa sintaks bahasa pemrograman dan tanpa rincian teknis penyimpanan data.

Setiap aturan bisnis yang muncul dalam pseudocode ditandai dengan kode BR-n yang merujuk pada daftar aturan bisnis di PRD §5.1 dan direkap kembali pada Bab 15 dokumen ini.

### 1.1 Cakupan

| FR | Kebutuhan fungsional | Issue | Bab |
|---|---|---|---|
| FR-01 | Login & menu berbasis role | #2 | Bab 4 |
| FR-02 | CRUD data siswa, guru, orang tua | #3 | Bab 5 |
| FR-03 | Kelas, tahun ajaran & relasi ortu–anak | #4 | Bab 6 |
| FR-05 | Input absensi harian H/I/S/A | #6 | Bab 7 |
| FR-06 | Pengajuan izin + persetujuan guru | #7 | Bab 8 |
| FR-07 | Input daily report per anak | #8 | Bab 9 |
| FR-08 | Orang tua membaca daily report | #9 | Bab 10 |
| FR-10 | Observasi perkembangan STPPA | #11 | Bab 11 |
| FR-11 | Draft rapor semester + narasi guru | #12 | Bab 12 |
| FR-12 | Orang tua melihat & mengunduh rapor | #13 | Bab 13 |
| FR-13 | Notifikasi otomatis in-app | #14 | Bab 14 |
| FR-14 | Rekap absensi & capaian perkembangan | #15 | Bab 15 |

Di luar cakupan: FR-04 (pengumuman, jadwal kegiatan, menu makan) dan FR-09 (galeri foto kegiatan) dikerjakan anggota kelompok lain. FR-15 (payment gateway) berprioritas Won't dan tidak dikerjakan.

### 1.2 Notasi yang dipakai

| Notasi | Arti |
|---|---|
| MULAI … SELESAI | Awal dan akhir sebuah prosedur |
| MASUKAN / KELUARAN | Parameter yang diterima dan nilai yang dihasilkan |
| SET x ← nilai | Pemberian nilai pada variabel |
| JIKA … MAKA … SELAIN ITU … AKHIR JIKA | Percabangan |
| UNTUK SETIAP x DALAM D LAKUKAN … AKHIR UNTUK | Perulangan atas setiap anggota himpunan |
| KEMBALIKAN x | Mengakhiri prosedur dan menyerahkan nilai x |
| GAGALKAN "pesan" | Menghentikan prosedur dengan kesalahan |
| AMBIL x DARI Dn | Mengambil data dari data store Dn |
| TAMBAHKAN x KE Dn | Menyimpan record baru ke data store Dn |
| PERBARUI x DI Dn | Mengubah record yang sudah ada |
| HAPUS x DARI Dn | Menghapus record |
| KOSONG | Nilai tidak ada (null / undefined) |
| BR-n | Penanda aturan bisnis, lihat Bab 16 |

## 2. Struktur Data

Seluruh proses pada dokumen ini bekerja terhadap tujuh data store yang sudah ditetapkan pada DFD Level 1. Pseudocode menyebut data store dengan kodenya (D1 sampai D7), sehingga alurnya tidak bergantung pada teknologi penyimpanan yang dipakai.

| Kode | Koleksi | Atribut |
|---|---|---|
| D1 | User | id, nama, email, password, role, aktif |
| D2 | TahunAjaran | id, nama, aktif  — Semester 1 & 2 tersirat, keduanya berjalan |
| D2 | Kelas | id, nama, tahunAjaranId, guruId |
| D2 | Siswa | id, nama, nisn, tglLahir, jenisKelamin, kelasId, ortuId |
| D3 | Absensi | id, siswaId, tanggal, status, catatan, dicatatOleh |
| D4 | Izin | id, siswaId, diajukanOleh, tanggal, jenis, alasan, status, tglPengajuan, diverifikasiOleh, catatanVerifikasi |
| D5 | DailyReport | id, siswaId, tanggal, kegiatan, makan, tidur, mood, catatan, foto, status, dibuatOleh |
| D6 | Observasi | id, siswaId, tanggal, aspek, indikatorId, capaian, catatan, dicatatOleh |
| D7 | Rapor | id, siswaId, tahunAjaran, semester, capaian, catatanUmum, status, tglPublikasi, disusunOleh |

Domain nilai: role ∈ {admin, guru, ortu}; status absensi ∈ {H, I, S, A}; capaian STPPA ∈ {BB, MB, BSH, BSB}; aspek STPPA ∈ {nilai-moral-sosial, fisik-motorik, kognitif, bahasa, sosial-emosional, seni}.

## 3. Ketentuan Umum

Dua ketentuan berikut berlaku pada seluruh proses, sehingga dijelaskan lebih dulu agar tidak diulang di setiap bab.

### 3.1 Penomoran Record

Setiap record yang baru dibuat menerima nomor identitas berurutan yang diawali kode koleksinya, misalnya u-001 untuk user dan s-011 untuk siswa.

```text
PROSEDUR ID_BARU(koleksi, kode)
MASUKAN  data store yang akan ditambahi dan kode awalannya
KELUARAN nomor identitas yang belum pernah dipakai
MULAI
  SET nomorTerakhir ← nomor urut terakhir yang pernah dipakai koleksi
  SET nomorBaru     ← nomorTerakhir + 1
  catat nomorBaru sebagai nomor urut terakhir koleksi

  KEMBALIKAN kode + "-" + nomorBaru diisi nol hingga 3 digit
SELESAI
```

> **Catatan.** Nomor urut terakhir dicatat terpisah dari datanya, bukan dihitung dari nomor terbesar yang masih ada. Bila dihitung dari data, menghapus record terakhir akan membuat nomornya dipakai ulang, sehingga rujukan lama seperti relasi ortu–anak, absensi, atau daily report ikut menempel ke record baru tanpa disadari.

### 3.2 Tanggal dan Periode Akademik

```text
PROSEDUR TANGGAL_LOKAL(waktu)
KELUARAN tanggal dalam format yyyy-mm-dd menurut zona waktu setempat
MULAI
  SET th ← tahun(waktu)
  SET bl ← bulan(waktu) diisi nol hingga 2 digit
  SET hr ← hari(waktu)  diisi nol hingga 2 digit
  KEMBALIKAN th + "-" + bl + "-" + hr
SELESAI
```

> **Catatan.** Tanggal selalu dihitung menurut zona waktu setempat, bukan waktu universal (UTC). Pada zona WIB (UTC+7), sebelum pukul 07.00 waktu universal masih menunjukkan tanggal kemarin, sehingga absensi "hari ini" dapat tercatat pada tanggal yang keliru.

```text
PROSEDUR PERIODE_AKADEMIK(tanggal)
KELUARAN pasangan (tahunAjaran, semester)
MULAI
  SET tahun ← bagian tahun dari tanggal
  SET bulan ← bagian bulan dari tanggal

  JIKA bulan >= 7 MAKA                      // Juli – Desember
    KEMBALIKAN (tahun + "/" + (tahun+1), semester 1)
  SELAIN ITU                                 // Januari – Juni
    KEMBALIKAN ((tahun-1) + "/" + tahun, semester 2)
  AKHIR JIKA
SELESAI
```

> **Catatan.** Semester diturunkan dari tanggal, bukan disimpan pada setiap record. Dengan begitu tidak mungkin ada observasi bertanggal Februari yang berlabel Semester 1.

---

## 4. FR-01 — Login dan Menu Berbasis Role

### 4.1 Proses Login

```text
PROSEDUR LOGIN(email, password)
MASUKAN  email dan password yang diisi pengguna
KELUARAN sesi bila berhasil, atau pesan kesalahan
MULAI
  SET email ← email tanpa spasi tepi, huruf kecil semua
  SET user  ← cari user DALAM D1 yang email-nya sama dengan email

  JIKA user = KOSONG ATAU user.password ≠ password MAKA
    KEMBALIKAN gagal("Email atau password salah.")
  AKHIR JIKA

  JIKA user.aktif = salah MAKA
    KEMBALIKAN gagal("Akun ini tidak aktif. Hubungi admin sekolah.")
  AKHIR JIKA

  SET sesi ← (id, nama, email, role dari user) + waktu masuk sekarang
  TETAPKAN sesi sebagai sesi aktif        // password tidak ikut dibawa
  KEMBALIKAN berhasil(sesi)
SELESAI
```

> **Catatan.** Pesan kesalahan untuk email tidak terdaftar dan password salah dibuat sama, supaya tidak memberi tahu pihak luar bahwa suatu email terdaftar. Akun yang berstatus tidak aktif ditolak meskipun passwordnya benar, sehingga admin dapat menutup akses tanpa menghapus datanya.

### 4.2 Pembatasan Akses Halaman

```text
PROSEDUR ROLE_UNTUK_PATH(path)
MULAI
  SET segmen ← bagian pertama path setelah tanda "/"
  JIKA segmen DALAM {admin, guru, ortu} MAKA
    KEMBALIKAN segmen
  SELAIN ITU
    KEMBALIKAN KOSONG              // halaman umum, mis. /login
  AKHIR JIKA
SELESAI

PROSEDUR PERIKSA_AKSES(path)
MULAI
  SET sesi ← sesi aktif saat ini

  JIKA sesi = KOSONG MAKA
    ALIHKAN ke halaman login, simpan path tujuan
  AKHIR JIKA

  SET perlu ← ROLE_UNTUK_PATH(path)
  JIKA perlu ≠ KOSONG DAN perlu ≠ sesi.role MAKA
    ALIHKAN ke "/403"
  AKHIR JIKA

  KEMBALIKAN sesi
SELESAI

PROSEDUR LOGOUT()
MULAI
  HAPUS sesi aktif
  ALIHKAN ke "/login"
SELESAI
```

> **Catatan.** Role yang dibutuhkan sebuah halaman diturunkan dari segmen pertama alamatnya, bukan didaftar satu per satu. Dengan begitu setiap halaman baru di bawah /admin, /guru, atau /ortu otomatis terlindungi tanpa perubahan pada pemeriksa akses.

## 5. FR-02 — CRUD Data Siswa, Guru, dan Orang Tua

### 5.1 Validasi Data Akun (Guru / Orang Tua)

```text
PROSEDUR VALIDASI_AKUN(draf, mode, idSaatIni)
KELUARAN himpunan pesan kesalahan per field; kosong berarti sah
MULAI
  SET galat ← himpunan kosong

  JIKA draf.nama kosong MAKA
    galat.nama ← "Nama wajib diisi."
  SELAIN ITU JIKA panjang(draf.nama) < 3 MAKA
    galat.nama ← "Nama minimal 3 karakter."
  AKHIR JIKA

  JIKA draf.email kosong MAKA
    galat.email ← "Email wajib diisi."
  SELAIN ITU JIKA draf.email tidak berpola nama@domain.tld MAKA
    galat.email ← "Format email tidak valid."
  SELAIN ITU JIKA ADA user DALAM D1 dengan email sama DAN id ≠ idSaatIni MAKA
    galat.email ← "Email sudah dipakai akun lain."
  AKHIR JIKA

  JIKA mode = "tambah" MAKA
    JIKA draf.password kosong MAKA
      galat.password ← "Password wajib diisi."
    SELAIN ITU JIKA panjang(draf.password) < 6 MAKA
      galat.password ← "Password minimal 6 karakter."
    AKHIR JIKA
  SELAIN ITU                                  // mode ubah
    JIKA draf.password tidak kosong DAN panjang < 6 MAKA
      galat.password ← "Password minimal 6 karakter."
    AKHIR JIKA
  AKHIR JIKA

  KEMBALIKAN galat
SELESAI
```

> **Catatan.** Pada mode ubah, password yang dibiarkan kosong berarti tidak diganti, sehingga admin dapat memperbarui nama atau status akun tanpa harus mengetahui password lama.

### 5.2 Validasi Data Siswa

```text
PROSEDUR VALIDASI_SISWA(draf, idSaatIni)
MULAI
  SET galat ← himpunan kosong

  JIKA draf.nama kosong MAKA
    galat.nama ← "Nama wajib diisi."
  SELAIN ITU JIKA panjang(draf.nama) < 3 MAKA
    galat.nama ← "Nama minimal 3 karakter."
  AKHIR JIKA

  JIKA draf.nisn kosong MAKA
    galat.nisn ← "NISN wajib diisi."
  SELAIN ITU JIKA draf.nisn memuat karakter bukan angka MAKA
    galat.nisn ← "NISN hanya boleh berisi angka."
  SELAIN ITU JIKA panjang(draf.nisn) ≠ 10 MAKA
    galat.nisn ← "NISN terdiri dari 10 angka."
  SELAIN ITU JIKA ADA siswa DALAM D2 dengan nisn sama DAN id ≠ idSaatIni MAKA
    galat.nisn ← "NISN sudah dipakai siswa lain."
  AKHIR JIKA

  JIKA draf.tglLahir kosong MAKA
    galat.tglLahir ← "Tanggal lahir wajib diisi."
  SELAIN ITU JIKA draf.tglLahir > TANGGAL_LOKAL(sekarang) MAKA
    galat.tglLahir ← "Tanggal lahir tidak boleh di masa depan."
  AKHIR JIKA

  JIKA draf.jenisKelamin belum dipilih MAKA
    galat.jenisKelamin ← "Jenis kelamin wajib dipilih."
  AKHIR JIKA

  KEMBALIKAN galat
SELESAI
```

### 5.3 Pencarian dan Paginasi

```text
PROSEDUR TABEL_DATA(data, cocok, perHalaman = 8)
MASUKAN  seluruh data, fungsi pencocokan, jumlah baris per halaman
KELUARAN baris untuk halaman aktif beserta informasi paginasi
MULAI
  SET kueri   ← masukan pencarian pengguna
  SET halaman ← nomor halaman aktif

  JIKA kueri kosong MAKA
    SET terfilter ← data
  SELAIN ITU
    SET terfilter ← anggota data yang cocok(d, kueri huruf kecil)
  AKHIR JIKA

  SET totalHalaman ← maksimum(1, pembulatan ke atas(jumlah(terfilter) / perHalaman))
  SET halamanAman  ← minimum(halaman, totalHalaman)
  SET baris        ← potongan terfilter untuk halamanAman

  KEMBALIKAN (baris, halamanAman, totalHalaman, jumlah(terfilter))
SELESAI

PROSEDUR CARI_BARU(nilai)
MULAI
  SET kueri   ← nilai
  SET halaman ← 1                 // hasil baru selalu dimulai dari halaman 1
SELESAI
```

> **Catatan.** Nomor halaman dibatasi ulang terhadap totalHalaman setiap kali dihitung. Tanpa itu, menyaring data sampai hasilnya menyusut akan meninggalkan pengguna pada halaman yang sudah tidak berisi baris apa pun.

---

## 6. FR-03 — Kelas, Tahun Ajaran, dan Relasi Ortu–Anak

### 6.1 Mengaktifkan Tahun Ajaran

Setiap tahun ajaran selalu terdiri dari Semester 1 (Juli–Desember) dan Semester 2 (Januari–Juni), dan keduanya berjalan sepanjang tahun tersebut. Yang diaktifkan adalah tahun ajarannya, bukan salah satu semesternya.

```text
PROSEDUR AKTIFKAN_TAHUN(idTerpilih)                               // BR-7
MULAI
  UNTUK SETIAP t DALAM D2.TahunAjaran LAKUKAN
    SET perlu ← (t.id = idTerpilih)
    JIKA t.aktif ≠ perlu MAKA
      PERBARUI t.aktif ← perlu DI D2
    AKHIR JIKA
  AKHIR UNTUK
SELESAI
```

> **Catatan.** Prosedur ini menyetel seluruh baris, bukan hanya baris terpilih, sehingga keadaan "tepat satu tahun ajaran aktif" selalu terjaga. Tahun ajaran yang baru dibuat berstatus tidak aktif; pengaktifan adalah tindakan terpisah yang wajib dikonfirmasi karena mengubah kelas yang dilihat guru.

### 6.2 Semester yang Sedang Berjalan

```text
PROSEDUR SEMESTER_BERJALAN()
KELUARAN nomor semester yang sedang berlangsung, atau KOSONG
MULAI
  SET tahun ← tahun ajaran berstatus aktif DALAM D2
  JIKA tahun = KOSONG MAKA
    KEMBALIKAN KOSONG
  AKHIR JIKA

  SET kalender ← PERIODE_AKADEMIK(tanggal hari ini)

  JIKA kalender.tahunAjaran = tahun.nama MAKA
    KEMBALIKAN kalender.semester
  SELAIN ITU
    KEMBALIKAN KOSONG     // tahun aktif bukan tahun kalender berjalan
  AKHIR JIKA
SELESAI

PROSEDUR PERIODE_AKTIF()
KELUARAN periode yang dipakai sebagai nilai awal penyaring
MULAI
  SET tahun ← tahun ajaran berstatus aktif DALAM D2
  JIKA tahun = KOSONG MAKA
    KEMBALIKAN KOSONG
  AKHIR JIKA

  // Tahun ajaran lampau atau mendatang dimulai dari Semester 1.
  KEMBALIKAN (tahun.nama, SEMESTER_BERJALAN() bila ada, bila tidak 1)
SELESAI
```

> **Catatan.** Semester tidak pernah dipilih admin dan tidak disimpan pada tahun ajaran, karena ia fakta kalender. Bila dijadikan pengaturan, admin dapat menyetel "Semester 2" sementara guru mencatat observasi bertanggal Oktober, sehingga label periode tidak cocok dengan tanggal datanya dan tidak ada yang menyadarinya.

### 6.3 Guru yang Masih Boleh Menjadi Wali Kelas

```text
PROSEDUR GURU_TERSEDIA(tahunAjaranId, kecualiKelasId)             // BR-8
KELUARAN daftar guru yang boleh dipilih sebagai wali kelas
MULAI
  SET terpakai ← himpunan kosong
  UNTUK SETIAP k DALAM D2.Kelas LAKUKAN
    JIKA k.tahunAjaranId = tahunAjaranId DAN k.id ≠ kecualiKelasId MAKA
      JIKA k.guruId ≠ KOSONG MAKA
        tambahkan k.guruId ke terpakai
      AKHIR JIKA
    AKHIR JIKA
  AKHIR UNTUK

  KEMBALIKAN user DALAM D1 yang role = guru
            DAN aktif = benar
            DAN id TIDAK DALAM terpakai
SELESAI
```

> **Catatan.** Parameter kecualiKelasId dipakai saat mengubah kelas yang sedang disunting, supaya wali kelasnya sendiri tetap muncul sebagai pilihan dan tidak terbaca sebagai sudah terpakai.

### 6.4 Pemeriksaan Sebelum Menghapus

Tanpa basis data tidak ada foreign key, sehingga aturan referensi ditegakkan oleh pemeriksaan berikut. Masing-masing mengembalikan alasan penolakan, atau KOSONG bila penghapusan diizinkan.

```text
PROSEDUR CEK_HAPUS_USER(user)                                     // BR-9
MULAI
  JIKA user.role = ortu MAKA
    SET anak ← siswa DALAM D2 yang ortuId = user.id
    JIKA jumlah(anak) > 0 MAKA
      KEMBALIKAN "Masih menjadi orang tua dari " + jumlah(anak) + " siswa."
    AKHIR JIKA
  AKHIR JIKA

  JIKA user.role = guru MAKA
    SET kelas ← kelas DALAM D2 yang guruId = user.id
    JIKA jumlah(kelas) > 0 MAKA
      KEMBALIKAN "Masih menjadi wali kelas " + daftar nama kelas
    AKHIR JIKA
  AKHIR JIKA

  KEMBALIKAN KOSONG
SELESAI

PROSEDUR CEK_HAPUS_KELAS(kelasId)                                 // BR-9
MULAI
  SET siswa ← siswa DALAM D2 yang kelasId = kelasId
  JIKA jumlah(siswa) > 0 MAKA
    KEMBALIKAN "Masih berisi " + jumlah(siswa) + " siswa."
  AKHIR JIKA
  KEMBALIKAN KOSONG
SELESAI

PROSEDUR CEK_HAPUS_TAHUN_AJARAN(tahun)                            // BR-9
MULAI
  JIKA tahun.aktif = benar MAKA
    KEMBALIKAN "Tahun ajaran yang sedang aktif tidak dapat dihapus."
  AKHIR JIKA
  SET kelas ← kelas DALAM D2 yang tahunAjaranId = tahun.id
  JIKA jumlah(kelas) > 0 MAKA
    KEMBALIKAN "Masih memiliki " + jumlah(kelas) + " kelas."
  AKHIR JIKA
  KEMBALIKAN KOSONG
SELESAI
```

## 7. FR-05 — Input Absensi Harian

### 7.1 Menyimpan Absensi

```text
PROSEDUR SIMPAN_ABSENSI(data)                                     // BR-5
MASUKAN  siswaId, tanggal, status, catatan, dicatatOleh
MULAI
  SET ada ← absensi DALAM D3 dengan siswaId DAN tanggal yang sama

  JIKA ada ≠ KOSONG MAKA
    PERBARUI ada DENGAN data DI D3       // ditimpa, bukan ditambah
  SELAIN ITU
    TAMBAHKAN data KE D3
  AKHIR JIKA
SELESAI

PROSEDUR SIMPAN_ABSENSI_KELAS(kelasId, tanggal, pilihan, guruId)
MASUKAN  pilihan = peta siswaId → status yang dipilih guru
MULAI
  UNTUK SETIAP s DALAM siswa kelas kelasId LAKUKAN
    SIMPAN_ABSENSI(s.id, tanggal, pilihan[s.id], KOSONG, guruId)
  AKHIR UNTUK
SELESAI
```

> **Catatan.** Status bawaan setiap siswa yang belum punya record pada tanggal tersebut adalah Hadir, karena itu keadaan yang paling sering terjadi. Guru hanya perlu mengubah yang tidak hadir.

### 7.2 Rekap Status Satu Hari

```text
PROSEDUR REKAP_STATUS(daftarAbsensi)
MULAI
  SET rekap ← (H: 0, I: 0, S: 0, A: 0)
  UNTUK SETIAP a DALAM daftarAbsensi LAKUKAN
    rekap[a.status] ← rekap[a.status] + 1
  AKHIR UNTUK
  KEMBALIKAN rekap
SELESAI
```

---

## 8. FR-06 — Pengajuan Izin dan Persetujuan Guru

### 8.1 Validasi Pengajuan

```text
PROSEDUR IZIN_BENTROK(siswaId, tanggal)                          // BR-15
KELUARAN pengajuan yang menghalangi tanggal ini, atau KOSONG
MULAI
  KEMBALIKAN izin DALAM D4 dengan siswaId DAN tanggal yang sama
            DAN status ≠ ditolak
SELESAI
```

> **Catatan.** Yang dikembalikan adalah record penghalangnya utuh, bukan hanya pesan kesalahan, agar antarmuka dapat menampilkan rincian pengajuan yang sudah ada — status, jenis, alasan, dan tanggal pengajuannya — di dalam dialog bentrokan.

```text
PROSEDUR VALIDASI_PENGAJUAN(siswaId, tanggal, alasan)             // BR-15
MULAI
  JIKA tanggal kosong MAKA
    KEMBALIKAN "Tanggal wajib dipilih."
  AKHIR JIKA

  SET batas ← TANGGAL_LOKAL(sekarang + 30 hari)
  JIKA tanggal > batas MAKA
    KEMBALIKAN "Tanggal maksimal 30 hari dari sekarang."
  AKHIR JIKA

  JIKA alasan kosong MAKA
    KEMBALIKAN "Alasan wajib diisi."
  SELAIN ITU JIKA panjang(alasan) < 5 MAKA
    KEMBALIKAN "Alasan terlalu singkat."
  AKHIR JIKA

  SET bentrok ← IZIN_BENTROK(siswaId, tanggal)
  JIKA bentrok ≠ KOSONG MAKA
    JIKA bentrok.status = pending MAKA
      KEMBALIKAN "Sudah ada pengajuan yang menunggu persetujuan."
    SELAIN ITU
      KEMBALIKAN "Tanggal ini sudah punya izin yang disetujui."
    AKHIR JIKA
  AKHIR JIKA

  KEMBALIKAN KOSONG                   // sah
SELESAI
```

> **Catatan.** Tanggal lampau tetap diizinkan karena orang tua sering melapor terlambat. Yang dibatasi hanya pengajuan jauh ke depan, sebagai penjaga kesalahan pengetikan tahun. Pengajuan berstatus ditolak tidak dihitung sebagai bentrokan, sehingga tanggal tersebut dapat diajukan ulang.

### 8.2 Mengajukan Izin

```text
PROSEDUR AJUKAN_IZIN(siswaId, diajukanOleh, tanggal, jenis, alasan)
MULAI
  SET alasanTolak ← VALIDASI_PENGAJUAN(siswaId, tanggal, alasan)
  JIKA alasanTolak ≠ KOSONG MAKA
    GAGALKAN alasanTolak
  AKHIR JIKA

  TAMBAHKAN KE D4:
    siswaId, diajukanOleh, tanggal, jenis,
    alasan           ← alasan tanpa spasi tepi,
    status           ← pending,
    tglPengajuan     ← TANGGAL_LOKAL(sekarang),
    diverifikasiOleh ← KOSONG,
    catatanVerifikasi ← KOSONG)
SELESAI
```

### 8.3 Menyetujui Izin

Prosedur ini mewujudkan relasi «extend» Verifikasi Izin → Input Absensi pada diagram use case.

```text
PROSEDUR SETUJUI_IZIN(izinId, guruId)                       // BR-3, BR-14
MULAI
  SET izin ← cari izin DALAM D4 dengan id = izinId
  JIKA izin = KOSONG ATAU izin.status ≠ pending MAKA
    KEMBALIKAN KOSONG                 // hanya pending yang bisa diverifikasi
  AKHIR JIKA

  // BR-3: ubah status kehadiran tanggal tersebut
  JIKA izin.jenis = "izin" MAKA
    SET statusHadir ← "I"
  SELAIN ITU
    SET statusHadir ← "S"
  AKHIR JIKA

  SIMPAN_ABSENSI(izin.siswaId, izin.tanggal, statusHadir,
                 catatan ← izin.alasan, dicatatOleh ← guruId)

  // BR-14: daily report tanggal itu tidak lagi sah menurut BR-1
  SET report        ← daily report DALAM D5 untuk siswa & tanggal tsb
  SET reportDitarik ← salah
  JIKA report ≠ KOSONG DAN report.status = published MAKA
    PERBARUI report.status ← draft DI D5   // disembunyikan, TIDAK dihapus
    SET reportDitarik ← benar
  AKHIR JIKA

  PERBARUI izin DI D4: status ← disetujui, diverifikasiOleh ← guruId
  KEMBALIKAN (izin, reportDitarik)
SELESAI
```

> **Catatan.** Nilai reportDitarik dikembalikan agar antarmuka dapat memberi tahu guru bahwa daily report tanggal tersebut ikut dikembalikan ke draft. Datanya tidak dihapus, hanya berhenti terlihat oleh orang tua.

### 8.4 Menolak Izin

```text
PROSEDUR TOLAK_IZIN(izinId, guruId, catatan)
MULAI
  SET izin ← cari izin DALAM D4 dengan id = izinId
  JIKA izin = KOSONG ATAU izin.status ≠ pending MAKA
    KEMBALIKAN KOSONG
  AKHIR JIKA

  PERBARUI izin DI D4:
    status            ← ditolak
    diverifikasiOleh  ← guruId
    catatanVerifikasi ← catatan bila tidak kosong

  // absensi sengaja TIDAK diubah
  KEMBALIKAN izin
SELESAI
```

---

## 9. FR-07 — Input Daily Report

### 9.1 Syarat Pengisian

Pemeriksaan ini adalah percabangan pertama pada flowchart proses daily report.

```text
PROSEDUR ALASAN_TIDAK_BOLEH_ISI(siswaId, tanggal)                 // BR-1
KELUARAN alasan penolakan, atau KOSONG bila boleh diisi
MULAI
  SET absensi ← absensi DALAM D3 untuk siswaId DAN tanggal

  JIKA absensi = KOSONG MAKA
    KEMBALIKAN "Absensi tanggal ini belum dicatat."
  AKHIR JIKA

  JIKA absensi.status ≠ "H" MAKA
    SET sebab ← "izin" bila status = I,
                "sakit" bila status = S,
                "alpa" bila status = A
    KEMBALIKAN "Anak berstatus " + sebab + " pada tanggal ini."
  AKHIR JIKA

  KEMBALIKAN KOSONG
SELESAI
```

> **Catatan.** Pemeriksaan dilakukan per tanggal, bukan sekali untuk seluruh siswa. Anak yang hadir pada suatu tanggal tetap ditolak untuk tanggal lain yang absensinya belum dicatat.

### 9.2 Validasi Isi Report

```text
PROSEDUR VALIDASI_REPORT(kegiatan)                                // BR-2
MULAI
  SET isi ← kegiatan tanpa spasi tepi
  JIKA isi kosong MAKA
    KEMBALIKAN "Kegiatan wajib diisi."
  AKHIR JIKA
  JIKA panjang(isi) < 10 MAKA
    KEMBALIKAN "Ceritakan kegiatan sedikit lebih lengkap."
  AKHIR JIKA
  KEMBALIKAN KOSONG
SELESAI

PROSEDUR SIMPAN_REPORT(data)                                      // BR-5
MULAI
  SET ada ← daily report DALAM D5 untuk siswaId DAN tanggal yang sama
  JIKA ada ≠ KOSONG MAKA
    PERBARUI ada DENGAN data DI D5     // satu report per anak per hari
  SELAIN ITU
    TAMBAHKAN data KE D5
  AKHIR JIKA
SELESAI
```

### 9.3 Kompresi Foto

```text
PROSEDUR KOMPRES_FOTO(foto)                                      // NFR-09
MASUKAN  foto yang diunggah guru
KELUARAN foto terkompresi beserta ukuran sebelum dan sesudah
MULAI
  JIKA format(foto) BUKAN DALAM {JPG, PNG, WebP} MAKA
    GAGALKAN "Format foto harus JPG, PNG, atau WebP."
  AKHIR JIKA

  JIKA sisi terpanjang(foto) > 1280 piksel MAKA
    perkecil foto secara proporsional hingga sisi terpanjang 1280 piksel
  AKHIR JIKA

  SET mutu ← mutu tertinggi
  SELAMA ukuran(foto) > 400 KB DAN mutu masih dapat diturunkan LAKUKAN
    turunkan mutu foto satu tingkat
  AKHIR SELAMA

  JIKA ukuran(foto) > 1 MB MAKA
    GAGALKAN "Foto masih terlalu besar setelah dikompres."
  AKHIR JIKA

  KEMBALIKAN (foto, ukuran awal, ukuran akhir)
SELESAI
```

> **Catatan.** NFR-09 mengizinkan foto sampai 1 MB, namun proses menargetkan 400 KB agar foto cepat terkirim pada koneksi seluler dan hemat kuota orang tua. Ukuran akhir dikembalikan supaya guru melihat sendiri hasil kompresinya.

## 10. FR-08 — Orang Tua Membaca Daily Report

### 10.1 Penentuan Anak yang Dibuka

```text
PROSEDUR PILIH_ANAK(ortuId, idDiminta)                           // NFR-04
MASUKAN  id akun orang tua, id anak yang diminta lewat alamat halaman
MULAI
  SET anak ← siswa DALAM D2 yang ortuId = ortuId

  JIKA jumlah(anak) = 0 MAKA
    KEMBALIKAN KOSONG
  AKHIR JIKA

  SET terpilih ← anggota anak yang id = idDiminta
  JIKA terpilih = KOSONG MAKA
    SET terpilih ← anak[1]        // id asing diabaikan, bukan ditolak
  AKHIR JIKA

  KEMBALIKAN terpilih
SELESAI
```

> **Catatan.** Karena id anak dapat diubah langsung pada alamat halaman, pemilihan selalu disaring terhadap daftar anak milik akun yang sedang masuk. Id yang bukan miliknya diabaikan dan jatuh ke anak pertama, bukan menampilkan halaman kesalahan, supaya tautan lama tetap mendarat di halaman yang berguna.

### 10.2 Daftar Report yang Boleh Dibaca

```text
PROSEDUR REPORT_TERBIT_SISWA(siswaId)
MULAI
  SET hasil ← daily report DALAM D5 yang siswaId = siswaId
                DAN status = published
  urutkan hasil menurun berdasarkan tanggal
  KEMBALIKAN hasil
SELESAI
```

> **Catatan.** Penyaringan status dilakukan di dalam prosedur ini, bukan di antarmuka, sehingga draft milik guru tidak mungkin terbawa ke sisi orang tua oleh halaman mana pun yang memakainya.

---

## 11. FR-10 — Observasi Perkembangan STPPA

### 11.1 Menyimpan Observasi

```text
PROSEDUR SIMPAN_OBSERVASI(data)                                  // BR-10
MASUKAN  siswaId, tanggal, aspek, indikatorId, capaian, catatan
MULAI
  SET ada ← observasi DALAM D6 dengan siswaId, indikatorId,
            DAN tanggal yang sama

  JIKA ada ≠ KOSONG MAKA
    PERBARUI ada DENGAN data DI D6
  SELAIN ITU
    TAMBAHKAN data KE D6
  AKHIR JIKA
SELESAI
```

> **Catatan.** Kunci keunikan adalah gabungan siswa, indikator, dan tanggal. Indikator yang sama pada tanggal berbeda tetap menghasilkan record baru, karena justru di situlah progresi perkembangan anak terekam.

### 11.2 Observasi Satu Semester

```text
PROSEDUR OBSERVASI_SISWA(siswaId, periode)
MULAI
  SET hasil ← himpunan kosong
  UNTUK SETIAP o DALAM D6 LAKUKAN
    JIKA o.siswaId ≠ siswaId MAKA LANJUT ke berikutnya AKHIR JIKA
    JIKA periode = KOSONG MAKA
      tambahkan o ke hasil
    SELAIN ITU
      SET p ← PERIODE_AKADEMIK(o.tanggal)
      JIKA p.tahunAjaran = periode.tahunAjaran
         DAN p.semester = periode.semester MAKA
        tambahkan o ke hasil
      AKHIR JIKA
    AKHIR JIKA
  AKHIR UNTUK

  urutkan hasil menurun berdasarkan tanggal, lalu aspek
  KEMBALIKAN hasil
SELESAI
```

### 11.3 Capaian Terakhir per Aspek

```text
PROSEDUR CAPAIAN_TERAKHIR(siswaId, periode)                      // BR-11
KELUARAN peta aspek → (capaian, tanggal, jumlah observasi)
MULAI
  SET hasil ← peta kosong

  UNTUK SETIAP o DALAM OBSERVASI_SISWA(siswaId, periode) LAKUKAN
    JIKA hasil[o.aspek] = KOSONG MAKA
      hasil[o.aspek] ← (o.capaian, o.tanggal, jumlah 1)
    SELAIN ITU
      hasil[o.aspek].jumlah ← hasil[o.aspek].jumlah + 1
      JIKA o.tanggal > hasil[o.aspek].tanggal MAKA
        hasil[o.aspek].capaian ← o.capaian
        hasil[o.aspek].tanggal ← o.tanggal
      AKHIR JIKA
    AKHIR JIKA
  AKHIR UNTUK

  KEMBALIKAN hasil
SELESAI
```

> **Catatan.** Yang diambil adalah observasi bertanggal paling baru, bukan capaian yang paling sering muncul. Perkembangan anak bersifat progresi: anak yang bulan Oktober masih MB lalu Desember sudah BSB seharusnya tercatat BSB, bukan ditarik turun oleh catatan lama.

## 12. FR-11 — Draft Rapor Semester

### 12.1 Syarat Penyusunan

```text
PROSEDUR ALASAN_TIDAK_BISA_SUSUN(siswaId, periode)                // BR-4
MULAI
  JIKA jumlah(OBSERVASI_SISWA(siswaId, periode)) = 0 MAKA
    KEMBALIKAN "Belum ada observasi pada semester ini."
  AKHIR JIKA
  KEMBALIKAN KOSONG
SELESAI
```

> **Catatan.** Prosedur ini mewujudkan relasi «include» Susun & Publikasi Rapor → Input Observasi Perkembangan: rapor tidak dapat dibuat dari nol, selalu diturunkan dari observasi yang sudah tercatat.

### 12.2 Menyusun Capaian dan Narasi

```text
PROSEDUR NARASI_OTOMATIS(nama, aspek, capaian, daftarIndikator)
MULAI
  SET frasa ← menurut capaian:
      BB  → "belum menunjukkan perkembangan pada aspek ini dan masih
             memerlukan bimbingan penuh"
      MB  → "mulai menunjukkan perkembangan dan masih memerlukan
             sedikit bimbingan"
      BSH → "sudah berkembang sesuai harapan dan dapat melakukannya
             secara mandiri"
      BSB → "berkembang sangat baik dan bahkan mampu membantu temannya"

  SET pembuka ← "Dalam aspek " + label(aspek) + ", " + nama + " "
                + frasa + "."

  JIKA daftarIndikator kosong MAKA
    KEMBALIKAN pembuka
  AKHIR JIKA

  KEMBALIKAN pembuka + " Hal ini teramati dari: "
           + daftarIndikator digabung dengan "; " + "."
SELESAI

PROSEDUR SUSUN_CAPAIAN(siswaId, periode)                   // BR-11, BR-13
MULAI
  SET nama      ← nama siswa
  SET ringkasan ← CAPAIAN_TERAKHIR(siswaId, periode)
  SET observasi ← OBSERVASI_SISWA(siswaId, periode)
  SET hasil     ← himpunan kosong

  UNTUK SETIAP (aspek, r) DALAM ringkasan LAKUKAN
    SET indikator ← teks indikator unik dari observasi pada aspek ini
    tambahkan ke hasil:
      aspek, capaian ← r.capaian, jumlahObservasi ← r.jumlah,
      narasi ← NARASI_OTOMATIS(nama, aspek, r.capaian, indikator)
  AKHIR UNTUK

  KEMBALIKAN hasil        // hanya aspek yang punya observasi (BR-13)
SELESAI
```

### 12.3 Menyusun, Memperbarui, dan Menerbitkan

```text
PROSEDUR SUSUN_DRAFT(siswaId, periode, disusunOleh)
MULAI
  SET alasan ← ALASAN_TIDAK_BISA_SUSUN(siswaId, periode)
  JIKA alasan ≠ KOSONG MAKA
    GAGALKAN alasan
  AKHIR JIKA

  SET ada ← rapor DALAM D7 untuk siswa & periode tsb
  JIKA ada ≠ KOSONG MAKA
    KEMBALIKAN ada              // tidak membuat rapor ganda
  AKHIR JIKA

  TAMBAHKAN KE D7:
    siswaId, tahunAjaran ← periode.tahunAjaran,
    semester     ← periode.semester,
    capaian      ← SUSUN_CAPAIAN(siswaId, periode),
    catatanUmum  ← KOSONG,  status       ← draft,
    tglPublikasi ← KOSONG,  disusunOleh  ← disusunOleh
SELESAI

PROSEDUR PERBARUI_DARI_OBSERVASI(raporId)
MULAI
  SET rapor ← cari rapor DALAM D7 dengan id = raporId
  JIKA rapor = KOSONG ATAU rapor.status = published MAKA
    KEMBALIKAN rapor                       // BR-12: terbit = hanya baca
  AKHIR JIKA

  SET baru ← SUSUN_CAPAIAN(rapor.siswaId, periode rapor)
  UNTUK SETIAP b DALAM baru LAKUKAN
    SET lama ← capaian rapor pada aspek b.aspek
    JIKA lama ≠ KOSONG MAKA
      SET b.narasi ← lama.narasi      // suntingan guru dipertahankan
    AKHIR JIKA
  AKHIR UNTUK

  PERBARUI rapor DI D7: capaian ← baru
SELESAI

PROSEDUR SIMPAN_RAPOR(raporId, capaian, catatanUmum)              // BR-12
MULAI
  SET rapor ← cari rapor DALAM D7 dengan id = raporId
  JIKA rapor = KOSONG MAKA KEMBALIKAN KOSONG AKHIR JIKA
  JIKA rapor.status = published MAKA
    KEMBALIKAN rapor                       // penyuntingan ditolak
  AKHIR JIKA
  PERBARUI rapor DI D7: capaian, catatanUmum
SELESAI

PROSEDUR TERBITKAN_RAPOR(raporId)
MULAI
  PERBARUI rapor DI D7:
    status       ← published
    tglPublikasi ← TANGGAL_LOKAL(sekarang)
SELESAI

PROSEDUR TARIK_KE_DRAFT(raporId)
MULAI
  PERBARUI rapor DI D7: status ← draft, tglPublikasi ← KOSONG
SELESAI
```

> **Catatan.** Rapor terbit bersifat hanya-baca, sehingga penyuntingan maupun perhitungan ulang ditolak. TARIK_KE_DRAFT disediakan sebagai jalan perbaikan; tanpa itu, kesalahan pengetikan pada rapor yang sudah terbit tidak akan dapat diperbaiki sama sekali.

---

## 13. FR-12 — Orang Tua Melihat dan Mengunduh Rapor

```text
PROSEDUR RAPOR_TERBIT_SISWA(siswaId)
MULAI
  SET hasil ← rapor DALAM D7 yang siswaId = siswaId
                DAN status = published
  urutkan hasil menurun berdasarkan tahunAjaran, lalu semester
  KEMBALIKAN hasil
SELESAI

PROSEDUR PILIH_RAPOR(ortuId, idAnakDiminta, idRaporDiminta)      // NFR-04
MULAI
  SET anak ← PILIH_ANAK(ortuId, idAnakDiminta)
  JIKA anak = KOSONG MAKA
    KEMBALIKAN KOSONG
  AKHIR JIKA

  SET daftar ← RAPOR_TERBIT_SISWA(anak.id)
  SET rapor  ← anggota daftar yang id = idRaporDiminta
  JIKA rapor = KOSONG MAKA
    SET rapor ← daftar[1]         // id rapor asing diabaikan
  AKHIR JIKA

  KEMBALIKAN (anak, daftar, rapor)
SELESAI

PROSEDUR UNDUH_RAPOR(rapor)
MULAI
  siapkan tampilan khusus cetak:
    sembunyikan menu, tombol, dan pemilih anak
    tampilkan kepala surat sekolah
    tampilkan identitas anak, kelas, semester, dan wali kelas
    tampilkan capaian & narasi tiap aspek
    tampilkan kolom tanda tangan orang tua dan wali kelas
    tampilkan keterangan BB / MB / BSH / BSB

  kirim tampilan tersebut ke proses cetak
  // pengguna memilih menyimpan sebagai PDF atau mencetak langsung
SELESAI
```

> **Catatan.** Terdapat dua identitas yang dapat diminta dari halaman, yaitu id anak dan id rapor, sehingga keduanya harus diperiksa terhadap kepemilikan. Memeriksa id anak saja masih memungkinkan pembacaan rapor anak lain melalui id rapor.

---

## 14. FR-13 — Notifikasi Otomatis

Notifikasi tidak dibuat sebagai record pada saat aksi terjadi, melainkan diturunkan dari data yang sudah ada setiap kali daftarnya dibutuhkan. Yang disimpan hanyalah penanda baca, yaitu daftar kunci peristiwa yang sudah dibuka tiap pengguna.

> **Catatan.** Alasannya dua jalur pembatalan yang ada di aplikasi ini: rapor dapat ditarik kembali ke draft (BR-12) dan menyetujui izin mengembalikan daily report terbit ke draft (BR-14). Bila notifikasi disimpan, keduanya meninggalkan notifikasi basi yang menuntun orang tua ke halaman kosong, dan menutupnya berarti menambahkan penghapusan notifikasi di dalam prosedur FR-06 dan FR-11. Dengan model turunan, pembatalan beres sendiri.

### 14.1 Sumber Peristiwa

Setiap sumber menghasilkan peristiwa untuk satu penerima, disaring dengan aturan kepemilikan yang sudah ada sehingga NFR-04 berlaku tanpa logika baru.

| Sumber | Diturunkan dari | Penerima |
|---|---|---|
| Daily report terbit | D5, status = published | orang tua anak tersebut |
| Rapor terbit | D7, status = published | orang tua anak tersebut |
| Status izin diputus | D4, status ≠ pending | orang tua yang mengajukan |
| Pengajuan izin masuk | D4, status = pending | guru kelas anak tersebut |

```text
PROSEDUR SUMBER_DAILY_REPORT(sesi)
MULAI
  JIKA sesi.role ≠ ortu MAKA KEMBALIKAN himpunan kosong AKHIR JIKA

  SET hasil ← himpunan kosong
  UNTUK SETIAP anak DALAM siswa DENGAN ortuId = sesi.id LAKUKAN
    UNTUK SETIAP r DALAM REPORT_TERBIT_SISWA(anak.id) LAKUKAN
      tambahkan ke hasil:
        kunci   ← "report:" + r.id,
        judul   ← "Daily report baru",
        pesan   ← anak.nama + " · " + tanggal panjang(r.tanggal),
        tanggal ← r.tanggal,
        tautan  ← halaman daily report anak tersebut
    AKHIR UNTUK
  AKHIR UNTUK

  KEMBALIKAN hasil
SELESAI
```

> **Catatan.** Tiga sumber lain berbentuk sama: rapor terbit, status izin yang sudah diputus untuk orang tua, dan pengajuan yang masih menunggu untuk guru kelas. Keempatnya disusun sebagai daftar sumber, sehingga pengumuman dari FR-04 kelak ditambahkan sebagai sumber kelima tanpa mengubah lonceng, daftar, maupun penanda baca.

### 14.2 Penanda Baca

```text
PROSEDUR TANDAI_DIBACA(userId, kunci)
MULAI
  SET milik ← daftar kunci yang sudah dibaca userId
  JIKA kunci SUDAH DALAM milik MAKA
    KEMBALIKAN                    // tidak menduplikasi
  AKHIR JIKA
  tambahkan kunci ke milik, lalu simpan
SELESAI

PROSEDUR TANDAI_SEMUA_DIBACA(userId, daftarKunci)
MULAI
  SET milik ← gabungan(daftar kunci userId, daftarKunci)
  simpan milik
SELESAI
```

> **Catatan.** Kunci peristiwa bersifat tetap untuk peristiwa yang sama, misalnya "rapor:rp-002". Karena itu status baca bertahan meskipun daftarnya dihitung ulang, bahkan setelah rapor ditarik ke draft lalu diterbitkan kembali.

### 14.3 Menyusun Daftar Notifikasi

```text
PROSEDUR NOTIFIKASI_SAYA(sesi)
MULAI
  SET dibaca    ← daftar kunci yang sudah dibaca sesi.id
  SET peristiwa ← himpunan kosong

  UNTUK SETIAP sumber DALAM DAFTAR_SUMBER LAKUKAN
    gabungkan sumber(sesi) ke peristiwa
  AKHIR UNTUK

  UNTUK SETIAP p DALAM peristiwa LAKUKAN
    SET p.belumDibaca ← (p.kunci TIDAK DALAM dibaca)
  AKHIR UNTUK

  urutkan peristiwa menurun berdasarkan tanggal
  KEMBALIKAN peristiwa
SELESAI

PROSEDUR JUMLAH_BELUM_DIBACA(sesi)
MULAI
  KEMBALIKAN banyaknya p DALAM NOTIFIKASI_SAYA(sesi)
            yang p.belumDibaca = benar
SELESAI
```

> **Catatan.** Nilai inilah yang tampil sebagai angka pada lonceng. Karena daftarnya diturunkan, data yang dibatalkan otomatis hilang dari notifikasi tanpa perlu dihapus tersendiri.

---

## 15. FR-14 — Rekap Absensi dan Capaian Perkembangan

### 15.1 Rekap Absensi Satu Bulan

```text
PROSEDUR REKAP_ABSENSI(kelasId, bulan)
MASUKAN  id kelas dan bulan dalam format yyyy-mm
MULAI
  SET siswa   ← siswa DALAM D2 yang kelasId = kelasId
  SET relevan ← absensi DALAM D3 yang siswaId ada DALAM siswa
                 DAN tanggal berawalan (bulan + "-")

  SET hariTercatat ← tanggal unik DALAM relevan, diurutkan naik

  SET perSiswa ← peta: setiap siswa → (H:0, I:0, S:0, A:0)
  UNTUK SETIAP a DALAM relevan LAKUKAN
    perSiswa[a.siswaId][a.status] ← nilainya + 1
  AKHIR UNTUK

  SET total ← (H:0, I:0, S:0, A:0)
  SET baris ← himpunan kosong
  UNTUK SETIAP s DALAM siswa LAKUKAN
    SET hitung ← perSiswa[s.id]
    SET jumlah ← hitung.H + hitung.I + hitung.S + hitung.A
    UNTUK SETIAP st DALAM {H, I, S, A} LAKUKAN
      total[st] ← total[st] + hitung[st]
    AKHIR UNTUK

    JIKA jumlah = 0 MAKA
      SET persen ← KOSONG            // bukan 0: tidak ada data ≠ 0% hadir
    SELAIN ITU
      SET persen ← pembulatan(hitung.H / jumlah × 100)
    AKHIR JIKA

    tambahkan (s, hitung, jumlah, persen) ke baris
  AKHIR UNTUK

  SET totalSemua ← total.H + total.I + total.S + total.A
  JIKA totalSemua = 0 MAKA
    SET persenKelas ← KOSONG
  SELAIN ITU
    SET persenKelas ← pembulatan(total.H / totalSemua × 100)
  AKHIR JIKA

  KEMBALIKAN (baris, hariTercatat, total, persenKelas)
SELESAI
```

> **Catatan.** Persentase bernilai KOSONG bila belum ada data, bukan 0. Membedakan keduanya penting karena 0% berarti anak tidak pernah hadir, sedangkan KOSONG berarti absensinya memang belum dicatat.

### 15.2 Deteksi Tanggal yang Perlu Diperiksa

```text
PROSEDUR ABSENSI_KOSONG(kelasId, hariTercatat)
KELUARAN tanggal yang tercatat tetapi tidak satu pun siswa hadir
MULAI
  SET hasil ← himpunan kosong
  UNTUK SETIAP t DALAM hariTercatat LAKUKAN
    JIKA TIDAK ADA absensi pada t untuk siswa kelas ini
       dengan status = "H" MAKA
      tambahkan t ke hasil
    AKHIR JIKA
  AKHIR UNTUK
  KEMBALIKAN hasil
SELESAI
```

### 15.3 Rekap Capaian per Kelas

```text
PROSEDUR REKAP_CAPAIAN(kelasId, periode)
MULAI
  SET hasil ← himpunan kosong
  UNTUK SETIAP s DALAM siswa kelas kelasId LAKUKAN
    SET ringkasan       ← CAPAIAN_TERAKHIR(s.id, periode)
    SET perAspek        ← peta kosong
    SET jumlahObservasi ← 0

    UNTUK SETIAP (aspek, r) DALAM ringkasan LAKUKAN
      perAspek[aspek]  ← (r.capaian, r.jumlah)
      jumlahObservasi  ← jumlahObservasi + r.jumlah
    AKHIR UNTUK

    tambahkan (s, perAspek, jumlahObservasi) ke hasil
  AKHIR UNTUK
  KEMBALIKAN hasil
SELESAI
```

### 15.4 Pembatasan Kelas Menurut Role

```text
PROSEDUR MUAT_LAPORAN(parameterHalaman, role)                    // NFR-04
MULAI
  SET sesi ← sesi aktif saat ini

  JIKA role = guru MAKA
    SET kelas ← kelas DALAM D2 yang guruId = sesi.id
                 DAN tahunAjaranId = tahun ajaran aktif
    SET terkunciKelas ← benar      // guru tidak dapat memilih kelas lain
  SELAIN ITU                       // admin
    SET kelas ← kelas dengan id = parameterHalaman.kelas,
                 bila tidak ada ambil kelas pertama
    SET terkunciKelas ← salah
  AKHIR JIKA

  JIKA kelas = KOSONG MAKA
    KEMBALIKAN data laporan kosong
  AKHIR JIKA

  SET bulan   ← parameterHalaman.bulan bila punya data,
                 bila tidak bulan berjalan
  SET periode ← parameterHalaman.periode bila tersedia,
                 bila tidak periode tahun ajaran aktif

  KEMBALIKAN (kelas, terkunciKelas, bulan, periode,
              REKAP_ABSENSI(kelas.id, bulan),
              REKAP_CAPAIAN(kelas.id, periode),
              ABSENSI_KOSONG(kelas.id, hari tercatat))
SELESAI
```

> **Catatan.** Kedua halaman laporan, untuk admin dan untuk guru, memakai prosedur pemuatan yang sama dengan parameter role berbeda. Dengan begitu pembatasan kelas tidak dapat berbeda antara kedua halaman.

---

## 16. Daftar Aturan Bisnis dan Lokasinya

Aturan bisnis berikut berasal dari dokumen analisis (flowchart dan relasi pada diagram use case) serta acceptance criteria tiap issue. Kolom terakhir menunjuk prosedur yang menegakkannya.

| Kode | Aturan | Ditegakkan oleh |
|---|---|---|
| BR-1 | Daily report hanya dapat dibuat bila anak berstatus Hadir pada tanggal tersebut | ALASAN_TIDAK_BOLEH_ISI (Bab 9.1) |
| BR-2 | Field kegiatan wajib terisi sebelum daily report dapat disimpan | VALIDASI_REPORT (Bab 9.2) |
| BR-3 | Guru menyetujui izin → status absensi tanggal itu otomatis menjadi I atau S | SETUJUI_IZIN (Bab 8.3) |
| BR-4 | Rapor selalu diturunkan dari observasi, tidak dapat dibuat dari nol | ALASAN_TIDAK_BISA_SUSUN (Bab 12.1) |
| BR-5 | Satu record absensi per siswa per tanggal; satu daily report per anak per hari | SIMPAN_ABSENSI (Bab 7.1), SIMPAN_REPORT (Bab 9.2) |
| BR-6 | Guru hanya mengakses data kelasnya; orang tua hanya data anaknya | PERIKSA_AKSES (Bab 4.2), PILIH_ANAK (Bab 10.1), MUAT_LAPORAN (Bab 15.4) |
| BR-7 | Setiap tahun ajaran terdiri dari Semester 1 dan Semester 2, dan keduanya berjalan. Tepat satu tahun ajaran berstatus aktif; semester yang berlangsung diturunkan dari kalender | AKTIFKAN_TAHUN (Bab 6.1), SEMESTER_BERJALAN (Bab 6.2) |
| BR-8 | Satu guru menjadi wali paling banyak satu kelas per tahun ajaran | GURU_TERSEDIA (Bab 6.3) |
| BR-9 | Penghapusan ditolak bila record masih dirujuk record lain; alasannya wajib ditampilkan saat pengguna mencoba menghapus | CEK_HAPUS_USER, CEK_HAPUS_KELAS, CEK_HAPUS_TAHUN_AJARAN (Bab 6.4) |
| BR-10 | Satu indikator STPPA punya satu catatan per tanggal; tanggal berbeda tetap record baru | SIMPAN_OBSERVASI (Bab 11.1) |
| BR-11 | Capaian per aspek adalah observasi bertanggal paling baru | CAPAIAN_TERAKHIR (Bab 11.3) |
| BR-12 | Rapor terbit bersifat hanya-baca | SIMPAN_RAPOR, PERBARUI_DARI_OBSERVASI (Bab 12.3) |
| BR-13 | Hanya aspek yang punya observasi yang masuk ke rapor | SUSUN_CAPAIAN (Bab 12.2) |
| BR-14 | Menyetujui izin mengembalikan daily report terbit tanggal itu ke draft | SETUJUI_IZIN (§8.3) |
| BR-15 | Satu pengajuan izin aktif per siswa per tanggal; bentrokan ditampilkan sebagai dialog beserta rincian pengajuan yang sudah ada | IZIN_BENTROK, VALIDASI_PENGAJUAN (Bab 8.1) |

## 17. Pemetaan ke Proses DFD dan Berkas Program

| Proses DFD | FR | Bab | Berkas program |
|---|---|---|---|
| 1.0 Login & Autentikasi | FR-01 | Bab 4 | app/lib/session.ts |
| 2.0 Kelola Master Data | FR-02 | Bab 5 | app/lib/useTabelData.ts |
| 2.0 Kelola Master Data | FR-03 | Bab 6 | app/lib/relasi.ts |
| 3.0 Absensi & Izin | FR-05 | Bab 7 | app/lib/absensi.ts |
| 3.0 Absensi & Izin | FR-06 | Bab 8 | app/lib/izin.ts |
| 4.0 Daily Report & Galeri | FR-07 | Bab 9 | app/lib/daily-report.ts, app/lib/foto.ts |
| 4.0 Daily Report & Galeri | FR-08 | Bab 10 | app/lib/daily-report.ts |
| 5.0 Observasi & Rapor | FR-10 | Bab 11 | app/lib/stppa.ts |
| 5.0 Observasi & Rapor | FR-11 | Bab 12 | app/lib/rapor.ts |
| 5.0 Observasi & Rapor | FR-12 | Bab 13 | app/lib/rapor.ts |
| (lintas proses) | FR-13 | Bab 14 | app/lib/notifikasi.ts |
| 6.0 Laporan | FR-14 | Bab 15 | app/lib/laporan.ts, laporan-loader.ts |
| (ketentuan umum) | — | Bab 3 | app/lib/repo.ts, app/lib/tanggal.ts |

