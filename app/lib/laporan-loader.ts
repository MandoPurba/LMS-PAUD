import type { DataLaporan } from "../components/HalamanLaporan";
import { absensiKosong, bulanTersedia, rekapAbsensi, rekapCapaian } from "./laporan";
import { kelasDariGuru, namaTahun, periodeAktif, siswaDariKelas, tahunAktif } from "./relasi";
import { repoKelas } from "./repo";
import { ambilSesi } from "./session";
import { periodeTersedia } from "./stppa";
import { labelPeriode, periodeAkademik, tanggalLokal } from "./tanggal";

/**
 * Data laporan untuk satu role. Guru terkunci ke kelasnya (NFR-04), admin
 * boleh memilih kelas mana pun.
 */
export function muatLaporan(url: string, role: "admin" | "guru"): DataLaporan {
  const params = new URL(url).searchParams;
  const sesi = ambilSesi();
  const tahun = tahunAktif() ?? null;

  const semuaKelas = repoKelas
    .semua()
    .slice()
    .sort(
      (a, b) =>
        namaTahun(b.tahunAjaranId).localeCompare(namaTahun(a.tahunAjaranId)) ||
        a.nama.localeCompare(b.nama),
    );

  const terkunciKelas = role === "guru";
  const kelas = terkunciKelas
    ? (sesi ? (kelasDariGuru(sesi.id) ?? null) : null)
    : (semuaKelas.find((k) => k.id === params.get("kelas")) ?? semuaKelas[0] ?? null);

  const kosong: DataLaporan = {
    terkunciKelas,
    daftarKelas: semuaKelas.map((k) => ({
      id: k.id,
      label: `${k.nama} — ${namaTahun(k.tahunAjaranId)}`,
    })),
    kelas: null,
    bulan: tanggalLokal().slice(0, 7),
    daftarBulan: [tanggalLokal().slice(0, 7)],
    periode: periodeAkademik(tanggalLokal()),
    daftarPeriode: [periodeAkademik(tanggalLokal())],
    absensi: { baris: [], hariTercatat: [], total: { H: 0, I: 0, S: 0, A: 0 }, persenHadirKelas: null },
    capaian: [],
    hariKosong: [],
  };
  if (kelas === null) return kosong;

  // Bulan: yang punya data, selalu ditambah bulan berjalan agar bisa dibuka.
  const bulanIni = tanggalLokal().slice(0, 7);
  const daftarBulan = bulanTersedia(kelas.id);
  if (!daftarBulan.includes(bulanIni)) daftarBulan.unshift(bulanIni);
  const bulan = daftarBulan.includes(params.get("bulan") ?? "")
    ? (params.get("bulan") as string)
    : daftarBulan[0];

  const periodeAwal = periodeAktif() ?? periodeAkademik(tanggalLokal());
  const daftarPeriode = [
    ...new Map(
      [periodeAwal, ...kelasPeriode(kelas.id)].map((p) => [labelPeriode(p), p]),
    ).values(),
  ].sort((a, b) => b.tahunAjaran.localeCompare(a.tahunAjaran) || b.semester - a.semester);
  const periode =
    daftarPeriode.find((p) => labelPeriode(p) === params.get("periode")) ?? periodeAwal;

  const absensi = rekapAbsensi(kelas.id, bulan);

  return {
    ...kosong,
    kelas,
    bulan,
    daftarBulan,
    periode,
    daftarPeriode,
    absensi,
    capaian: rekapCapaian(kelas.id, periode),
    hariKosong: absensiKosong(kelas.id, absensi.hariTercatat),
  };
}

/** Periode yang punya observasi untuk siswa mana pun di kelas ini. */
function kelasPeriode(kelasId: string) {
  return siswaDariKelas(kelasId).flatMap((s) => periodeTersedia(s.id));
}
