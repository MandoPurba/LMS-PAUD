/** Tipe domain bersama. Entitas per fitur ditambahkan di issue masing-masing. */

export type Role = "admin" | "guru" | "ortu";

/** Status kehadiran (FR-05). */
export type StatusHadir = "H" | "I" | "S" | "A";

/** Skala capaian STPPA, berurutan dari terendah (FR-10). */
export type Capaian = "BB" | "MB" | "BSH" | "BSB";

/** Enam aspek perkembangan STPPA. Lihat PRD §4.2.1 soal penamaan aspek pertama. */
export type AspekStppa =
  | "nilai-moral-sosial"
  | "fisik-motorik"
  | "kognitif"
  | "bahasa"
  | "sosial-emosional"
  | "seni";

/** D1 — User */
export type User = {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: Role;
  aktif: boolean;
};

/** Data user yang disimpan sebagai sesi login, tanpa password. */
export type Session = Omit<User, "password" | "aktif"> & {
  masukPada: string;
};
