/**
 * Galeri foto kegiatan kelas (FR-09, proses DFD 4.0, data store D5).
 *
 * Berbeda dari Daily Report: galeri mendokumentasikan kegiatan satu kelas
 * secara umum (bukan per anak), jadi diunggah per kelas per tanggal, bukan
 * per siswa. Scoping aksesnya sama seperti fitur lain (NFR-04/BR-6): guru
 * hanya kelasnya sendiri, ortu hanya kelas anaknya.
 */

import type { Galeri } from "../data/types";
import { repoGaleri } from "./repo";

export function galeriKelas(kelasId: string): Galeri[] {
  return repoGaleri
    .semua()
    .filter((g) => g.kelasId === kelasId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export function validasiGaleri(caption: string, foto: string[]): string | null {
  if (!caption.trim()) return "Keterangan kegiatan wajib diisi.";
  if (foto.length === 0) return "Unggah minimal satu foto.";
  return null;
}
