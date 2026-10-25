import type { DailyReport, Mood, PorsiMakan, TidurSiang } from "../data/types";
import { absensiSiswa } from "./absensi";
import { repoDailyReport } from "./repo";

export const MOOD: { nilai: Mood; label: string; ikon: string }[] = [
  { nilai: "senang", label: "Senang", ikon: "face-grin-beam" },
  { nilai: "biasa", label: "Biasa", ikon: "face-smile" },
  { nilai: "rewel", label: "Rewel", ikon: "face-grimace" },
  { nilai: "sedih", label: "Sedih", ikon: "face-sad-tear" },
  { nilai: "lelah", label: "Lelah", ikon: "face-tired" },
];

export const MAKAN: { nilai: PorsiMakan; label: string; ikon: string }[] = [
  { nilai: "habis", label: "Habis", ikon: "utensils" },
  { nilai: "sebagian", label: "Sebagian", ikon: "spoon" },
  { nilai: "tidak", label: "Tidak mau", ikon: "ban" },
];

export const TIDUR: { nilai: TidurSiang; label: string; ikon: string }[] = [
  { nilai: "nyenyak", label: "Nyenyak", ikon: "bed" },
  { nilai: "sebentar", label: "Sebentar", ikon: "clock" },
  { nilai: "tidak", label: "Tidak tidur", ikon: "sun" },
];

export const LABEL_MOOD = Object.fromEntries(MOOD.map((m) => [m.nilai, m])) as Record<
  Mood,
  (typeof MOOD)[number]
>;
export const LABEL_MAKAN = Object.fromEntries(MAKAN.map((m) => [m.nilai, m])) as Record<
  PorsiMakan,
  (typeof MAKAN)[number]
>;
export const LABEL_TIDUR = Object.fromEntries(TIDUR.map((t) => [t.nilai, t])) as Record<
  TidurSiang,
  (typeof TIDUR)[number]
>;

export function reportSiswa(siswaId: string, tanggal: string): DailyReport | undefined {
  return repoDailyReport.semua().find((r) => r.siswaId === siswaId && r.tanggal === tanggal);
}

/**
 * Report yang boleh dibaca orang tua: hanya yang sudah terbit, terbaru di atas.
 * Draft milik guru tidak pernah ikut.
 */
export function reportTerbitSiswa(siswaId: string): DailyReport[] {
  return repoDailyReport
    .semua()
    .filter((r) => r.siswaId === siswaId && r.status === "published")
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export function reportTanggal(tanggal: string): DailyReport[] {
  return repoDailyReport.semua().filter((r) => r.tanggal === tanggal);
}

/**
 * BR-1 — daily report hanya boleh dibuat bila anak berstatus Hadir pada tanggal
 * tersebut. Mengembalikan alasan penolakan, atau null bila boleh diisi.
 */
export function alasanTidakBolehIsi(siswaId: string, tanggal: string): string | null {
  const absensi = absensiSiswa(siswaId, tanggal);

  if (!absensi) {
    return "Absensi tanggal ini belum dicatat. Catat absensi terlebih dahulu.";
  }
  if (absensi.status !== "H") {
    const sebab = { I: "izin", S: "sakit", A: "alpa" }[absensi.status];
    return `Anak berstatus ${sebab} pada tanggal ini, jadi daily report tidak dapat dibuat.`;
  }
  return null;
}

/** BR-2 — kegiatan wajib terisi. */
export function validasiReport(kegiatan: string): string | null {
  const isi = kegiatan.trim();
  if (!isi) return "Kegiatan wajib diisi.";
  if (isi.length < 10) return "Ceritakan kegiatan sedikit lebih lengkap, minimal 10 karakter.";
  return null;
}

/** Satu report per anak per hari (BR-5): yang sudah ada ditimpa. */
export function simpanReport(data: Omit<DailyReport, "id">): DailyReport {
  const ada = reportSiswa(data.siswaId, data.tanggal);
  if (ada) return repoDailyReport.ubah(ada.id, data) ?? ada;
  return repoDailyReport.tambah(data);
}
