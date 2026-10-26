/**
 * Pengumuman, jadwal kegiatan, dan menu makan (FR-04, proses DFD 2.0).
 *
 * Ketiganya dikelola admin lewat CRUD sederhana — tidak ada halaman baca
 * terpisah untuk Guru/Ortu. Pengumuman disampaikan lewat lonceng notifikasi
 * (FR-13, lihat lib/notifikasi.ts); jadwal dan menu cukup dilihat lewat
 * dashboard masing-masing role.
 */

import type { JadwalKegiatan, MenuMakan, Pengumuman } from "../data/types";
import { repoJadwalKegiatan, repoMenuMakan, repoPengumuman } from "./repo";

export function pengumumanTerbaru(maks = 5): Pengumuman[] {
  return repoPengumuman
    .semua()
    .slice()
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, maks);
}

export function jadwalMendatang(dariTanggal: string, maks = 5): JadwalKegiatan[] {
  return repoJadwalKegiatan
    .semua()
    .filter((j) => j.tanggal >= dariTanggal)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(0, maks);
}

export function menuTanggal(tanggal: string): MenuMakan | undefined {
  return repoMenuMakan.semua().find((m) => m.tanggal === tanggal);
}

export function validasiPengumuman(judul: string, isi: string): string | null {
  if (!judul.trim()) return "Judul wajib diisi.";
  if (!isi.trim()) return "Isi pengumuman wajib diisi.";
  if (isi.trim().length < 10) return "Isi pengumuman minimal 10 karakter.";
  return null;
}

export function validasiJadwal(nama: string, tanggal: string): string | null {
  if (!nama.trim()) return "Nama kegiatan wajib diisi.";
  if (!tanggal) return "Tanggal wajib diisi.";
  return null;
}

export function validasiMenu(makananPokok: string, laukPauk: string): string | null {
  if (!makananPokok.trim()) return "Makanan pokok wajib diisi.";
  if (!laukPauk.trim()) return "Lauk-pauk wajib diisi.";
  return null;
}

/** Satu menu per tanggal (serupa BR-5 pada Daily Report): yang sudah ada ditimpa. */
export function simpanMenu(data: Omit<MenuMakan, "id">): MenuMakan {
  const ada = menuTanggal(data.tanggal);
  if (ada) return repoMenuMakan.ubah(ada.id, data) ?? ada;
  return repoMenuMakan.tambah(data);
}
