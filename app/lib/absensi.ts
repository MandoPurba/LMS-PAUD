import type { Absensi, StatusHadir } from "../data/types";
import { repoAbsensi } from "./repo";

export const URUTAN_STATUS: StatusHadir[] = ["H", "I", "S", "A"];

export const LABEL_STATUS: Record<StatusHadir, string> = {
  H: "Hadir",
  I: "Izin",
  S: "Sakit",
  A: "Alpa",
};

/** Kelas warna per status. Eksplisit karena Tailwind tidak memindai kelas dinamis. */
export const WARNA_STATUS: Record<StatusHadir, { lembut: string; penuh: string }> = {
  H: { lembut: "bg-hadir-soft text-hadir", penuh: "bg-hadir text-fg-on-strong" },
  I: { lembut: "bg-izin-soft text-izin", penuh: "bg-izin text-fg-on-accent" },
  S: { lembut: "bg-sakit-soft text-sakit", penuh: "bg-sakit text-fg-on-strong" },
  A: { lembut: "bg-alpa-soft text-alpa", penuh: "bg-alpa text-fg-on-strong" },
};

export function absensiTanggal(tanggal: string): Absensi[] {
  return repoAbsensi.semua().filter((a) => a.tanggal === tanggal);
}

export function absensiSiswa(siswaId: string, tanggal: string): Absensi | undefined {
  return repoAbsensi.semua().find((a) => a.siswaId === siswaId && a.tanggal === tanggal);
}

/**
 * Simpan satu absensi. Satu siswa hanya punya satu record per tanggal (BR-5),
 * jadi record yang sudah ada ditimpa, bukan ditambah baru.
 */
export function simpanAbsensi(data: Omit<Absensi, "id">): Absensi {
  const ada = absensiSiswa(data.siswaId, data.tanggal);
  if (ada) return repoAbsensi.ubah(ada.id, data) ?? ada;
  return repoAbsensi.tambah(data);
}

export function rekapStatus(daftar: Absensi[]): Record<StatusHadir, number> {
  const rekap: Record<StatusHadir, number> = { H: 0, I: 0, S: 0, A: 0 };
  for (const a of daftar) rekap[a.status] += 1;
  return rekap;
}
