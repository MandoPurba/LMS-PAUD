/**
 * Pertanyaan lintas entitas dan aturan keutuhan data (FR-03).
 *
 * Tanpa basis data tidak ada foreign key, jadi aturan referensi ditegakkan di
 * sini — kalau tidak, menghapus kelas atau akun akan meninggalkan rujukan
 * menggantung yang baru terasa akibatnya di FR-05 ke atas.
 */

import type { Kelas, Semester, Siswa, TahunAjaran, User } from "../data/types";
import { repoKelas, repoSiswa, repoTahunAjaran, repoUser } from "./repo";
import { periodeAkademik, tanggalLokal } from "./tanggal";

export function tahunAktif(): TahunAjaran | undefined {
  return repoTahunAjaran.semua().find((t) => t.aktif);
}

/**
 * Jadikan satu tahun ajaran aktif, sisanya otomatis nonaktif (BR-7).
 *
 * Seluruh baris disetel, bukan hanya yang dipilih, sehingga keadaan "tepat satu
 * tahun ajaran aktif" tidak mungkin dilanggar.
 */
export function aktifkanTahun(id: string): void {
  for (const t of repoTahunAjaran.semua()) {
    const perlu = t.id === id;
    if (t.aktif !== perlu) repoTahunAjaran.ubah(t.id, { aktif: perlu });
  }
}

/**
 * Semester yang sedang berlangsung menurut kalender, atau KOSONG bila tahun
 * ajaran aktif bukan tahun kalender yang sedang berjalan — misalnya admin
 * mengaktifkan tahun ajaran lampau untuk menengok datanya.
 *
 * Semester tidak pernah dipilih admin karena ia fakta kalender: Juli–Desember
 * Semester 1, Januari–Juni Semester 2. Menyimpannya sebagai pengaturan membuka
 * peluang label semester tidak cocok dengan tanggal datanya (lihat T-8).
 */
export function semesterBerjalan(): Semester | null {
  const tahun = tahunAktif();
  if (!tahun) return null;

  const kalender = periodeAkademik(tanggalLokal());
  return kalender.tahunAjaran === tahun.nama ? kalender.semester : null;
}

/** Periode yang dipakai sebagai nilai awal penyaring observasi, rapor, laporan. */
export function periodeAktif(): { tahunAjaran: string; semester: Semester } | null {
  const tahun = tahunAktif();
  if (!tahun) return null;

  // Tahun ajaran lampau atau mendatang dimulai dari Semester 1.
  return { tahunAjaran: tahun.nama, semester: semesterBerjalan() ?? 1 };
}

/** Rentang bulan sebuah semester pada satu tahun ajaran, mis. "Jul–Des 2026". */
export function rentangSemester(namaTahun: string, semester: Semester): string {
  const [awal, akhir] = namaTahun.split("/");
  return semester === 1 ? `Juli–Desember ${awal}` : `Januari–Juni ${akhir}`;
}

export function kelasTahun(tahunAjaranId: string): Kelas[] {
  return repoKelas.semua().filter((k) => k.tahunAjaranId === tahunAjaranId);
}

/** Kelas yang diampu seorang guru. Satu guru paling banyak satu kelas per tahun. */
export function kelasDariGuru(guruId: string, tahunAjaranId?: string): Kelas | undefined {
  const tahun = tahunAjaranId ?? tahunAktif()?.id;
  return repoKelas.semua().find((k) => k.guruId === guruId && k.tahunAjaranId === tahun);
}

export function siswaDariKelas(kelasId: string): Siswa[] {
  return repoSiswa.semua().filter((s) => s.kelasId === kelasId);
}

export function anakDariOrtu(ortuId: string): Siswa[] {
  return repoSiswa.semua().filter((s) => s.ortuId === ortuId);
}

export function namaTahun(tahunAjaranId: string): string {
  return repoTahunAjaran.cari(tahunAjaranId)?.nama ?? "—";
}

export function namaKelas(kelasId: string | null): string {
  if (kelasId === null) return "—";
  const kelas = repoKelas.cari(kelasId);
  return kelas ? kelas.nama : "—";
}

export function namaUser(userId: string | null): string {
  if (userId === null) return "—";
  return repoUser.cari(userId)?.nama ?? "—";
}

/**
 * Guru yang masih boleh dipilih sebagai wali kelas pada satu tahun ajaran:
 * guru aktif yang belum menjadi wali kelas lain di tahun yang sama.
 */
export function guruTersedia(tahunAjaranId: string, kecualiKelasId?: string): User[] {
  const terpakai = new Set(
    repoKelas
      .semua()
      .filter((k) => k.tahunAjaranId === tahunAjaranId && k.id !== kecualiKelasId)
      .map((k) => k.guruId)
      .filter((id): id is string => id !== null),
  );
  return repoUser.semua().filter((u) => u.role === "guru" && u.aktif && !terpakai.has(u.id));
}

/** Alasan penghapusan ditolak, atau null bila boleh dihapus. */
export function cekHapusUser(user: User): string | null {
  if (user.role === "ortu") {
    const anak = anakDariOrtu(user.id);
    if (anak.length > 0) {
      return `Masih menjadi orang tua dari ${anak.length} siswa. Lepaskan hubungannya di Data Siswa terlebih dahulu.`;
    }
  }

  if (user.role === "guru") {
    const kelas = repoKelas.semua().filter((k) => k.guruId === user.id);
    if (kelas.length > 0) {
      const daftar = kelas.map((k) => `${k.nama} (${namaTahun(k.tahunAjaranId)})`).join(", ");
      return `Masih menjadi wali kelas ${daftar}. Ganti wali kelasnya terlebih dahulu.`;
    }
  }

  return null;
}

export function cekHapusKelas(kelasId: string): string | null {
  const siswa = siswaDariKelas(kelasId);
  if (siswa.length > 0) {
    return `Masih berisi ${siswa.length} siswa. Pindahkan siswanya terlebih dahulu.`;
  }
  return null;
}

export function cekHapusTahunAjaran(tahun: TahunAjaran): string | null {
  if (tahun.aktif) {
    return "Tahun ajaran yang sedang aktif tidak dapat dihapus. Aktifkan tahun lain terlebih dahulu.";
  }
  const kelas = kelasTahun(tahun.id);
  if (kelas.length > 0) {
    return `Masih memiliki ${kelas.length} kelas. Hapus kelasnya terlebih dahulu.`;
  }
  return null;
}
