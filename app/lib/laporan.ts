import type { AspekStppa, Capaian, Siswa, StatusHadir } from "../data/types";
import { URUTAN_STATUS, absensiTanggal } from "./absensi";
import { siswaDariKelas } from "./relasi";
import { repoAbsensi } from "./repo";
import { capaianTerakhir } from "./stppa";

export type BarisAbsensi = {
  siswa: Siswa;
  hitung: Record<StatusHadir, number>;
  total: number;
  /** Persentase hadir dari hari yang tercatat; null bila belum ada data. */
  persenHadir: number | null;
};

export type RekapAbsensi = {
  baris: BarisAbsensi[];
  /** Tanggal (yyyy-mm-dd) yang punya absensi untuk kelas ini pada bulan tsb. */
  hariTercatat: string[];
  total: Record<StatusHadir, number>;
  persenHadirKelas: number | null;
};

const KOSONG = (): Record<StatusHadir, number> => ({ H: 0, I: 0, S: 0, A: 0 });

/** `bulan` dalam format yyyy-mm. */
export function rekapAbsensi(kelasId: string, bulan: string): RekapAbsensi {
  const siswa = siswaDariKelas(kelasId);
  const idSiswa = new Set(siswa.map((s) => s.id));

  const relevan = repoAbsensi
    .semua()
    .filter((a) => idSiswa.has(a.siswaId) && a.tanggal.startsWith(`${bulan}-`));

  const hariTercatat = [...new Set(relevan.map((a) => a.tanggal))].sort();

  const perSiswa = new Map<string, Record<StatusHadir, number>>();
  for (const s of siswa) perSiswa.set(s.id, KOSONG());
  for (const a of relevan) perSiswa.get(a.siswaId)![a.status] += 1;

  const total = KOSONG();
  const baris = siswa.map((s) => {
    const hitung = perSiswa.get(s.id)!;
    const jumlah = URUTAN_STATUS.reduce((n, st) => n + hitung[st], 0);
    for (const st of URUTAN_STATUS) total[st] += hitung[st];
    return {
      siswa: s,
      hitung,
      total: jumlah,
      persenHadir: jumlah === 0 ? null : Math.round((hitung.H / jumlah) * 100),
    };
  });

  const totalSemua = URUTAN_STATUS.reduce((n, st) => n + total[st], 0);

  return {
    baris,
    hariTercatat,
    total,
    persenHadirKelas: totalSemua === 0 ? null : Math.round((total.H / totalSemua) * 100),
  };
}

export type BarisCapaian = {
  siswa: Siswa;
  perAspek: Partial<Record<AspekStppa, { capaian: Capaian; jumlah: number }>>;
  jumlahObservasi: number;
};

export function rekapCapaian(
  kelasId: string,
  periode: { tahunAjaran: string; semester: 1 | 2 },
): BarisCapaian[] {
  return siswaDariKelas(kelasId).map((s) => {
    const ringkasan = capaianTerakhir(s.id, periode);
    const perAspek: BarisCapaian["perAspek"] = {};
    let jumlahObservasi = 0;

    for (const [aspek, r] of Object.entries(ringkasan) as [
      AspekStppa,
      { capaian: Capaian; tanggal: string; jumlah: number },
    ][]) {
      perAspek[aspek] = { capaian: r.capaian, jumlah: r.jumlah };
      jumlahObservasi += r.jumlah;
    }

    return { siswa: s, perAspek, jumlahObservasi };
  });
}

/** Bulan (yyyy-mm) yang punya data absensi untuk kelas ini, terbaru di atas. */
export function bulanTersedia(kelasId: string): string[] {
  const idSiswa = new Set(siswaDariKelas(kelasId).map((s) => s.id));
  const bulan = new Set(
    repoAbsensi
      .semua()
      .filter((a) => idSiswa.has(a.siswaId))
      .map((a) => a.tanggal.slice(0, 7)),
  );
  return [...bulan].sort((a, b) => b.localeCompare(a));
}

export function labelBulan(bulan: string): string {
  const [tahun, bln] = bulan.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(tahun, bln - 1, 1),
  );
}

/** Tanggal yang tercatat tapi tidak satu pun siswa hadir — tanda data belum lengkap. */
export function absensiKosong(kelasId: string, hariTercatat: string[]): string[] {
  const idSiswa = new Set(siswaDariKelas(kelasId).map((s) => s.id));
  return hariTercatat.filter(
    (t) => !absensiTanggal(t).some((a) => idSiswa.has(a.siswaId) && a.status === "H"),
  );
}
