import masterStppa from "../data/seed/stppa.json";
import type { AspekMaster, AspekStppa, Capaian, Observasi } from "../data/types";
import { repoObservasi } from "./repo";
import { periodeAkademik } from "./tanggal";

export const MASTER: AspekMaster[] = masterStppa as AspekMaster[];

export const URUTAN_CAPAIAN: Capaian[] = ["BB", "MB", "BSH", "BSB"];

export const LABEL_CAPAIAN: Record<Capaian, string> = {
  BB: "Belum Berkembang",
  MB: "Mulai Berkembang",
  BSH: "Berkembang Sesuai Harapan",
  BSB: "Berkembang Sangat Baik",
};

/**
 * Warna capaian: satu rona, terang ke gelap, karena BB→BSB adalah data
 * berurutan. Ditulis eksplisit karena Tailwind tidak memindai kelas dinamis.
 */
export const WARNA_CAPAIAN: Record<Capaian, string> = {
  BB: "bg-stppa-bb text-stppa-bb-fg",
  MB: "bg-stppa-mb text-stppa-mb-fg",
  BSH: "bg-stppa-bsh text-stppa-bsh-fg",
  BSB: "bg-stppa-bsb text-stppa-bsb-fg",
};

export function labelAspek(aspek: AspekStppa): string {
  return MASTER.find((m) => m.aspek === aspek)?.label ?? aspek;
}

export function indikatorAspek(aspek: AspekStppa) {
  return MASTER.find((m) => m.aspek === aspek)?.indikator ?? [];
}

export function teksIndikator(indikatorId: string): string {
  for (const m of MASTER) {
    const i = m.indikator.find((x) => x.id === indikatorId);
    if (i) return i.teks;
  }
  return "—";
}

/** Daftar periode yang punya observasi, terbaru di atas. */
export function periodeTersedia(siswaId?: string): { tahunAjaran: string; semester: 1 | 2 }[] {
  const sumber = siswaId
    ? repoObservasi.semua().filter((o) => o.siswaId === siswaId)
    : repoObservasi.semua();

  const unik = new Map<string, { tahunAjaran: string; semester: 1 | 2 }>();
  for (const o of sumber) {
    const p = periodeAkademik(o.tanggal);
    unik.set(`${p.tahunAjaran}-${p.semester}`, p);
  }

  return [...unik.values()].sort(
    (a, b) => b.tahunAjaran.localeCompare(a.tahunAjaran) || b.semester - a.semester,
  );
}

export function observasiSiswa(
  siswaId: string,
  periode?: { tahunAjaran: string; semester: 1 | 2 },
): Observasi[] {
  return repoObservasi
    .semua()
    .filter((o) => {
      if (o.siswaId !== siswaId) return false;
      if (!periode) return true;
      const p = periodeAkademik(o.tanggal);
      return p.tahunAjaran === periode.tahunAjaran && p.semester === periode.semester;
    })
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.aspek.localeCompare(b.aspek));
}

/** Satu catatan per indikator per tanggal: yang sudah ada ditimpa. */
export function simpanObservasi(data: Omit<Observasi, "id">): Observasi {
  const ada = repoObservasi
    .semua()
    .find(
      (o) =>
        o.siswaId === data.siswaId &&
        o.indikatorId === data.indikatorId &&
        o.tanggal === data.tanggal,
    );
  if (ada) return repoObservasi.ubah(ada.id, data) ?? ada;
  return repoObservasi.tambah(data);
}

/**
 * Capaian terakhir per aspek dalam satu periode — dasar penyusunan draft rapor
 * di FR-11. Yang diambil adalah observasi bertanggal paling baru pada aspek itu.
 */
export function capaianTerakhir(
  siswaId: string,
  periode: { tahunAjaran: string; semester: 1 | 2 },
): Partial<Record<AspekStppa, { capaian: Capaian; tanggal: string; jumlah: number }>> {
  const hasil: Partial<
    Record<AspekStppa, { capaian: Capaian; tanggal: string; jumlah: number }>
  > = {};

  for (const o of observasiSiswa(siswaId, periode)) {
    const ada = hasil[o.aspek];
    if (!ada) {
      hasil[o.aspek] = { capaian: o.capaian, tanggal: o.tanggal, jumlah: 1 };
    } else {
      ada.jumlah += 1;
      if (o.tanggal > ada.tanggal) {
        ada.capaian = o.capaian;
        ada.tanggal = o.tanggal;
      }
    }
  }

  return hasil;
}
