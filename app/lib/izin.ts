import type { Izin, JenisIzin, StatusIzin } from "../data/types";
import { simpanAbsensi } from "./absensi";
import { reportSiswa } from "./daily-report";
import { siswaDariKelas } from "./relasi";
import { repoDailyReport, repoIzin } from "./repo";
import { tanggalLokal } from "./tanggal";

export const LABEL_JENIS: Record<JenisIzin, string> = {
  izin: "Izin",
  sakit: "Sakit",
};

export const LABEL_STATUS_IZIN: Record<StatusIzin, string> = {
  pending: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

export const WARNA_STATUS_IZIN: Record<StatusIzin, string> = {
  pending: "bg-warning-soft text-warning",
  disetujui: "bg-success-soft text-success",
  ditolak: "bg-danger-soft text-danger",
};

/** Izin yang disetujui mengubah absensi: izin → I, sakit → S. */
const STATUS_HADIR: Record<JenisIzin, "I" | "S"> = { izin: "I", sakit: "S" };

/** Batas pengajuan ke depan, sekadar penjaga salah ketik tahun. */
export const MAKS_HARI_KE_DEPAN = 30;

export function izinSiswa(siswaId: string): Izin[] {
  return repoIzin
    .semua()
    .filter((i) => i.siswaId === siswaId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export function izinOrtu(ortuId: string): Izin[] {
  return repoIzin
    .semua()
    .filter((i) => i.diajukanOleh === ortuId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

/** Pengajuan untuk siswa di satu kelas; yang menunggu diletakkan di atas. */
export function izinKelas(kelasId: string): Izin[] {
  const idSiswa = new Set(siswaDariKelas(kelasId).map((s) => s.id));
  return repoIzin
    .semua()
    .filter((i) => idSiswa.has(i.siswaId))
    .sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
      }
      return b.tanggal.localeCompare(a.tanggal);
    });
}

export function jumlahPending(kelasId: string): number {
  return izinKelas(kelasId).filter((i) => i.status === "pending").length;
}

/** Alasan pengajuan ditolak, atau null bila boleh diajukan. */
export function validasiPengajuan(
  siswaId: string,
  tanggal: string,
  alasan: string,
): string | null {
  if (!tanggal) return "Tanggal wajib dipilih.";

  const batas = new Date();
  batas.setDate(batas.getDate() + MAKS_HARI_KE_DEPAN);
  if (tanggal > tanggalLokal(batas)) {
    return `Tanggal maksimal ${MAKS_HARI_KE_DEPAN} hari dari sekarang.`;
  }

  const isi = alasan.trim();
  if (!isi) return "Alasan wajib diisi.";
  if (isi.length < 5) return "Alasan terlalu singkat.";

  const bentrok = repoIzin
    .semua()
    .find((i) => i.siswaId === siswaId && i.tanggal === tanggal && i.status !== "ditolak");
  if (bentrok) {
    return bentrok.status === "pending"
      ? "Sudah ada pengajuan yang menunggu persetujuan untuk tanggal ini."
      : "Tanggal ini sudah punya izin yang disetujui.";
  }

  return null;
}

export function ajukanIzin(data: {
  siswaId: string;
  diajukanOleh: string;
  tanggal: string;
  jenis: JenisIzin;
  alasan: string;
}): Izin {
  const alasanTolak = validasiPengajuan(data.siswaId, data.tanggal, data.alasan);
  if (alasanTolak !== null) throw new Error(alasanTolak);

  return repoIzin.tambah({
    ...data,
    alasan: data.alasan.trim(),
    status: "pending",
    tglPengajuan: tanggalLokal(),
    diverifikasiOleh: null,
    catatanVerifikasi: null,
  });
}

export type HasilPersetujuan = {
  izin: Izin;
  /** Daily report tanggal itu ikut dikembalikan ke draft. */
  reportDitarik: boolean;
};

/**
 * BR-3 — menyetujui izin mengubah status absensi tanggal tersebut menjadi
 * Izin atau Sakit. Ini relasi «extend» Verifikasi Izin → Input Absensi.
 *
 * Efek lanjutannya: bila tanggal itu sudah punya daily report, report tersebut
 * dikembalikan ke draft. BR-1 mensyaratkan anak berstatus Hadir untuk punya
 * daily report, jadi report terbit untuk hari anak tidak masuk tidak boleh
 * tetap terlihat orang tua. Datanya tidak dihapus, hanya disembunyikan kembali.
 */
export function setujuiIzin(izinId: string, guruId: string): HasilPersetujuan | undefined {
  const izin = repoIzin.cari(izinId);
  if (!izin || izin.status !== "pending") return undefined;

  simpanAbsensi({
    siswaId: izin.siswaId,
    tanggal: izin.tanggal,
    status: STATUS_HADIR[izin.jenis],
    catatan: izin.alasan,
    dicatatOleh: guruId,
  });

  const report = reportSiswa(izin.siswaId, izin.tanggal);
  let reportDitarik = false;
  if (report && report.status === "published") {
    repoDailyReport.ubah(report.id, { status: "draft" });
    reportDitarik = true;
  }

  const diperbarui = repoIzin.ubah(izinId, {
    status: "disetujui",
    diverifikasiOleh: guruId,
  });

  return diperbarui ? { izin: diperbarui, reportDitarik } : undefined;
}

export function tolakIzin(izinId: string, guruId: string, catatan: string): Izin | undefined {
  const izin = repoIzin.cari(izinId);
  if (!izin || izin.status !== "pending") return undefined;

  return repoIzin.ubah(izinId, {
    status: "ditolak",
    diverifikasiOleh: guruId,
    catatanVerifikasi: catatan.trim() === "" ? null : catatan.trim(),
  });
}
