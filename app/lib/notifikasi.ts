/**
 * Notifikasi in-app (FR-13).
 *
 * Notifikasi TIDAK disimpan sebagai record saat aksi terjadi, melainkan
 * diturunkan dari data yang sudah ada setiap kali dibutuhkan. Alasannya ada dua
 * jalur pembatalan di aplikasi ini: rapor dapat ditarik kembali ke draft
 * (FR-11), dan menyetujui izin mengembalikan daily report terbit ke draft
 * (BR-14). Bila notifikasi disimpan, keduanya meninggalkan notifikasi basi yang
 * menuntun orang tua ke halaman kosong.
 *
 * Yang disimpan hanyalah penanda baca: daftar kunci peristiwa yang sudah dibuka
 * tiap pengguna. Kunci bersifat tetap untuk peristiwa yang sama, sehingga status
 * baca bertahan meski daftarnya dihitung ulang.
 */

import type { Session } from "../data/types";
import { reportTerbitSiswa } from "./daily-report";
import { pengumumanTerbaru } from "./pengumuman";
import { LABEL_JENIS, izinKelas, izinOrtu } from "./izin";
import { raporTerbitSiswa } from "./rapor";
import { anakDariOrtu, kelasDariGuru, siswaDariKelas } from "./relasi";
import { baca, tulis } from "./storage";
import { labelPeriode, tanggalPanjang, tanggalPendek } from "./tanggal";

export type Peristiwa = {
  /** Tetap untuk peristiwa yang sama, mis. "rapor:rp-002". */
  kunci: string;
  /** Nama ikon Font Awesome tanpa awalan. */
  ikon: string;
  judul: string;
  pesan: string;
  /** Dipakai untuk mengurutkan, format ISO yyyy-mm-dd. */
  tanggal: string;
  tautan: string;
  belumDibaca: boolean;
};

type Sumber = (sesi: Session) => Omit<Peristiwa, "belumDibaca">[];

// ——— Sumber peristiwa ———

const sumberDailyReport: Sumber = (sesi) => {
  if (sesi.role !== "ortu") return [];

  return anakDariOrtu(sesi.id).flatMap((anak) =>
    reportTerbitSiswa(anak.id).map((r) => ({
      kunci: `report:${r.id}`,
      ikon: "book-open",
      judul: "Daily report baru",
      pesan: `${anak.nama} · ${tanggalPanjang(r.tanggal)}`,
      tanggal: r.tanggal,
      tautan: `/ortu/daily-report?anak=${anak.id}`,
    })),
  );
};

const sumberRapor: Sumber = (sesi) => {
  if (sesi.role !== "ortu") return [];

  return anakDariOrtu(sesi.id).flatMap((anak) =>
    raporTerbitSiswa(anak.id).map((r) => ({
      kunci: `rapor:${r.id}`,
      ikon: "file-lines",
      judul: "Rapor terbit",
      pesan: `${anak.nama} · ${labelPeriode({ tahunAjaran: r.tahunAjaran, semester: r.semester })}`,
      tanggal: r.tglPublikasi ?? "",
      tautan: `/ortu/rapor?anak=${anak.id}&rapor=${r.id}`,
    })),
  );
};

const sumberStatusIzin: Sumber = (sesi) => {
  if (sesi.role !== "ortu") return [];

  const nama = new Map(anakDariOrtu(sesi.id).map((a) => [a.id, a.nama]));

  return izinOrtu(sesi.id)
    .filter((i) => i.status !== "pending")
    .map((i) => ({
      kunci: `izin:${i.id}`,
      ikon: i.status === "disetujui" ? "circle-check" : "circle-xmark",
      judul: i.status === "disetujui" ? "Izin disetujui" : "Izin ditolak",
      pesan: `${nama.get(i.siswaId) ?? "—"} · ${LABEL_JENIS[i.jenis]} ${tanggalPendek(i.tanggal)}`,
      tanggal: i.tanggal,
      tautan: "/ortu/izin",
    }));
};

const sumberPengajuanIzin: Sumber = (sesi) => {
  if (sesi.role !== "guru") return [];

  const kelas = kelasDariGuru(sesi.id);
  if (!kelas) return [];

  const nama = new Map(siswaDariKelas(kelas.id).map((s) => [s.id, s.nama]));

  return izinKelas(kelas.id)
    .filter((i) => i.status === "pending")
    .map((i) => ({
      kunci: `izin-baru:${i.id}`,
      ikon: "file-signature",
      judul: "Pengajuan izin baru",
      pesan: `${nama.get(i.siswaId) ?? "—"} · ${LABEL_JENIS[i.jenis]} ${tanggalPendek(i.tanggal)}`,
      tanggal: i.tglPengajuan,
      tautan: "/guru/izin",
    }));
};

/**
 * FR-04 — pengumuman admin tampil sebagai notifikasi untuk Guru dan Ortu.
 * Admin tidak diberi tahu soal pengumumannya sendiri.
 */
const sumberPengumuman: Sumber = (sesi) => {
  if (sesi.role === "admin") return [];

  return pengumumanTerbaru(10).map((p) => ({
    kunci: `pengumuman:${p.id}`,
    ikon: "bullhorn",
    judul: p.judul,
    pesan: tanggalPanjang(p.tanggal),
    tanggal: p.tanggal,
    tautan: `/${sesi.role}`,
  }));
};

/**
 * Daftar sumber notifikasi. Pengumuman (FR-04) ditambahkan di sini sebagai
 * sumber berikutnya tanpa mengubah lonceng, daftar, maupun penanda baca.
 */
const SUMBER: Sumber[] = [
  sumberDailyReport,
  sumberRapor,
  sumberStatusIzin,
  sumberPengajuanIzin,
  sumberPengumuman,
];

// ——— Penanda baca ———

const KUNCI_DIBACA = "notifikasi-dibaca";

function semuaPenanda(): Record<string, string[]> {
  return baca<Record<string, string[]>>(KUNCI_DIBACA, {});
}

function penandaUser(userId: string): Set<string> {
  return new Set(semuaPenanda()[userId] ?? []);
}

export function tandaiDibaca(userId: string, kunci: string): void {
  const semua = semuaPenanda();
  const milik = new Set(semua[userId] ?? []);
  if (milik.has(kunci)) return;

  milik.add(kunci);
  tulis(KUNCI_DIBACA, { ...semua, [userId]: [...milik] });
}

export function tandaiSemuaDibaca(userId: string, kunci: string[]): void {
  const semua = semuaPenanda();
  const milik = new Set([...(semua[userId] ?? []), ...kunci]);
  tulis(KUNCI_DIBACA, { ...semua, [userId]: [...milik] });
}

// ——— Pembacaan ———

export function notifikasiSaya(sesi: Session): Peristiwa[] {
  const dibaca = penandaUser(sesi.id);

  return SUMBER.flatMap((sumber) => sumber(sesi))
    .map((p) => ({ ...p, belumDibaca: !dibaca.has(p.kunci) }))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export function jumlahBelumDibaca(sesi: Session): number {
  return notifikasiSaya(sesi).filter((p) => p.belumDibaca).length;
}
