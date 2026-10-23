import seedAbsensi from "../data/seed/absensi.json";
import seedDailyReport from "../data/seed/daily-report.json";
import seedKelas from "../data/seed/kelas.json";
import seedObservasi from "../data/seed/observasi.json";
import seedSiswa from "../data/seed/siswa.json";
import seedTahunAjaran from "../data/seed/tahun-ajaran.json";
import seedUsers from "../data/seed/users.json";
import type {
  Absensi,
  DailyReport,
  Kelas,
  Observasi,
  Siswa,
  TahunAjaran,
  User,
} from "../data/types";
import { baca, hapus as hapusKunci, tulis } from "./storage";

/** Dilempar bila localStorage menolak penulisan, mis. kuota penuh. */
export class GagalSimpan extends Error {
  constructor() {
    super("Data gagal disimpan. Penyimpanan browser mungkin penuh.");
    this.name = "GagalSimpan";
  }
}

export type Repo<T extends { id: string }> = {
  semua(): T[];
  cari(id: string): T | undefined;
  tambah(data: Omit<T, "id">): T;
  ubah(id: string, data: Partial<Omit<T, "id">>): T | undefined;
  hapus(id: string): boolean;
  /** Kembalikan koleksi ini ke kondisi seed. */
  reset(): void;
};

/**
 * ID berurutan agar mudah dibaca saat demo: u-001, s-011, …
 *
 * Nomor urut disimpan terpisah, bukan dihitung dari data terbesar, supaya ID
 * yang sudah dihapus tidak pernah dipakai ulang. Kalau dipakai ulang, record
 * lama yang masih menyebut ID itu (relasi ortu-anak di FR-03, absensi di FR-05,
 * daily report di FR-07) akan ikut menempel ke data baru tanpa disadari.
 */
function idBaru(kunci: string, prefix: string, daftar: { id: string }[]): string {
  const kunciUrutan = `${kunci}:urutan`;
  const dariData = daftar.reduce((maks, d) => {
    const n = Number.parseInt(d.id.split("-")[1] ?? "", 10);
    return Number.isNaN(n) ? maks : Math.max(maks, n);
  }, 0);

  const berikut = Math.max(dariData, baca<number>(kunciUrutan, 0)) + 1;
  tulis(kunciUrutan, berikut);
  return `${prefix}-${String(berikut).padStart(3, "0")}`;
}

export function buatRepo<T extends { id: string }>(
  kunci: string,
  prefix: string,
  seed: T[],
): Repo<T> {
  function semua(): T[] {
    return baca<T[]>(kunci, seed);
  }

  function simpan(daftar: T[]): void {
    if (!tulis(kunci, daftar)) throw new GagalSimpan();
  }

  return {
    semua,

    cari(id) {
      return semua().find((d) => d.id === id);
    },

    tambah(data) {
      const daftar = semua();
      const baru = { ...data, id: idBaru(kunci, prefix, daftar) } as T;
      simpan([...daftar, baru]);
      return baru;
    },

    ubah(id, data) {
      const daftar = semua();
      const i = daftar.findIndex((d) => d.id === id);
      if (i === -1) return undefined;

      const diubah: T = { ...daftar[i], ...data, id };
      const salinan = [...daftar];
      salinan[i] = diubah;
      simpan(salinan);
      return diubah;
    },

    hapus(id) {
      const daftar = semua();
      const sisa = daftar.filter((d) => d.id !== id);
      if (sisa.length === daftar.length) return false;
      simpan(sisa);
      return true;
    },

    reset() {
      hapusKunci(kunci);
      hapusKunci(`${kunci}:urutan`);
    },
  };
}

export const repoUser = buatRepo<User>("users", "u", seedUsers as User[]);
export const repoSiswa = buatRepo<Siswa>("siswa", "s", seedSiswa as Siswa[]);
export const repoKelas = buatRepo<Kelas>("kelas", "k", seedKelas as Kelas[]);
export const repoAbsensi = buatRepo<Absensi>("absensi", "ab", seedAbsensi as Absensi[]);
export const repoObservasi = buatRepo<Observasi>("observasi", "ob", seedObservasi as Observasi[]);
export const repoDailyReport = buatRepo<DailyReport>(
  "daily-report",
  "dr",
  seedDailyReport as DailyReport[],
);
export const repoTahunAjaran = buatRepo<TahunAjaran>(
  "tahun-ajaran",
  "ta",
  seedTahunAjaran as TahunAjaran[],
);
