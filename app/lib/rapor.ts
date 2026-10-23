import type { AspekStppa, Capaian, CapaianRapor, Rapor, Semester } from "../data/types";
import { repoRapor, repoSiswa } from "./repo";
import { LABEL_CAPAIAN, capaianTerakhir, labelAspek, observasiSiswa, teksIndikator } from "./stppa";
import { tanggalLokal } from "./tanggal";

export type Periode = { tahunAjaran: string; semester: Semester };

/** Frasa dasar narasi otomatis per tingkat capaian. */
const FRASA: Record<Capaian, string> = {
  BB: "belum menunjukkan perkembangan pada aspek ini dan masih memerlukan bimbingan penuh",
  MB: "mulai menunjukkan perkembangan dan masih memerlukan sedikit bimbingan",
  BSH: "sudah berkembang sesuai harapan dan dapat melakukannya secara mandiri",
  BSB: "berkembang sangat baik dan bahkan mampu membantu temannya",
};

/**
 * Narasi draft disusun dari observasi: tingkat capaian beserta indikator yang
 * benar-benar teramati. Guru lalu menyuntingnya (FR-11).
 */
function narasiOtomatis(
  nama: string,
  aspek: AspekStppa,
  capaian: Capaian,
  indikator: string[],
): string {
  const pembuka = `Dalam aspek ${labelAspek(aspek)}, ${nama} ${FRASA[capaian]}.`;
  if (indikator.length === 0) return pembuka;

  const daftar = indikator.map((t) => t.toLowerCase()).join("; ");
  return `${pembuka} Hal ini teramati dari: ${daftar}.`;
}

export function raporSiswa(siswaId: string, periode: Periode): Rapor | undefined {
  return repoRapor
    .semua()
    .find(
      (r) =>
        r.siswaId === siswaId &&
        r.tahunAjaran === periode.tahunAjaran &&
        r.semester === periode.semester,
    );
}

/** Rapor terbit milik seorang siswa, terbaru di atas. Dipakai FR-12. */
export function raporTerbitSiswa(siswaId: string): Rapor[] {
  return repoRapor
    .semua()
    .filter((r) => r.siswaId === siswaId && r.status === "published")
    .sort(
      (a, b) => b.tahunAjaran.localeCompare(a.tahunAjaran) || b.semester - a.semester,
    );
}

/**
 * BR-4 — rapor selalu diturunkan dari observasi yang sudah tercatat, tidak bisa
 * dibuat dari nol. Mengembalikan alasan penolakan, atau null bila boleh disusun.
 */
export function alasanTidakBisaSusun(siswaId: string, periode: Periode): string | null {
  if (observasiSiswa(siswaId, periode).length === 0) {
    return "Belum ada observasi pada semester ini. Catat observasi terlebih dahulu di menu Observasi STPPA.";
  }
  return null;
}

/** Hitung capaian per aspek beserta narasi otomatisnya dari data observasi. */
export function susunCapaian(siswaId: string, periode: Periode): CapaianRapor[] {
  const nama = repoSiswa.cari(siswaId)?.nama ?? "Anak";
  const ringkasan = capaianTerakhir(siswaId, periode);
  const observasi = observasiSiswa(siswaId, periode);

  const hasil: CapaianRapor[] = [];
  for (const [aspek, r] of Object.entries(ringkasan) as [
    AspekStppa,
    { capaian: Capaian; tanggal: string; jumlah: number },
  ][]) {
    const indikator = [
      ...new Set(
        observasi.filter((o) => o.aspek === aspek).map((o) => teksIndikator(o.indikatorId)),
      ),
    ];
    hasil.push({
      aspek,
      capaian: r.capaian,
      jumlahObservasi: r.jumlah,
      narasi: narasiOtomatis(nama, aspek, r.capaian, indikator),
    });
  }
  return hasil;
}

export function susunDraft(siswaId: string, periode: Periode, disusunOleh: string): Rapor {
  const alasan = alasanTidakBisaSusun(siswaId, periode);
  if (alasan !== null) throw new Error(alasan);

  const ada = raporSiswa(siswaId, periode);
  if (ada) return ada;

  return repoRapor.tambah({
    siswaId,
    tahunAjaran: periode.tahunAjaran,
    semester: periode.semester,
    capaian: susunCapaian(siswaId, periode),
    catatanUmum: null,
    status: "draft",
    tglPublikasi: null,
    disusunOleh,
  });
}

/**
 * Hitung ulang capaian dari observasi terbaru. Narasi yang sudah ada sengaja
 * tidak ditimpa agar hasil suntingan guru tidak hilang; aspek yang baru muncul
 * mendapat narasi otomatis.
 */
export function perbaruiDariObservasi(raporId: string): Rapor | undefined {
  const rapor = repoRapor.cari(raporId);
  if (!rapor || rapor.status === "published") return rapor;

  const periode = { tahunAjaran: rapor.tahunAjaran, semester: rapor.semester };
  const baru = susunCapaian(rapor.siswaId, periode);

  const capaian = baru.map((b) => {
    const lama = rapor.capaian.find((c) => c.aspek === b.aspek);
    return lama ? { ...b, narasi: lama.narasi } : b;
  });

  return repoRapor.ubah(raporId, { capaian });
}

/** Rapor terbit bersifat read-only, jadi penyuntingan ditolak. */
export function simpanRapor(
  raporId: string,
  data: { capaian: CapaianRapor[]; catatanUmum: string | null },
): Rapor | undefined {
  const rapor = repoRapor.cari(raporId);
  if (!rapor) return undefined;
  if (rapor.status === "published") return rapor;
  return repoRapor.ubah(raporId, data);
}

export function terbitkanRapor(raporId: string): Rapor | undefined {
  return repoRapor.ubah(raporId, { status: "published", tglPublikasi: tanggalLokal() });
}

/**
 * Tarik rapor terbit kembali menjadi draft. Disediakan karena rapor terbit
 * bersifat read-only — tanpa jalan ini, salah ketik tidak akan bisa diperbaiki.
 */
export function tarikKeDraft(raporId: string): Rapor | undefined {
  return repoRapor.ubah(raporId, { status: "draft", tglPublikasi: null });
}

export { LABEL_CAPAIAN };
