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

export type Semester = 1 | 2;

/** D2 — Tahun ajaran. Tepat satu baris berstatus aktif. */
export type TahunAjaran = {
  id: string;
  /** Mis. "2026/2027". */
  nama: string;
  semesterAktif: Semester;
  aktif: boolean;
};

/** D2 — Kelas. Satu guru menjadi wali paling banyak satu kelas per tahun ajaran. */
export type Kelas = {
  id: string;
  nama: string;
  tahunAjaranId: string;
  guruId: string | null;
};

export type JenisKelamin = "L" | "P";

/** D2 — Siswa. kelasId & ortuId ditetapkan di FR-03. */
export type Siswa = {
  id: string;
  nama: string;
  nisn: string;
  /** Format ISO, yyyy-mm-dd. */
  tglLahir: string;
  jenisKelamin: JenisKelamin;
  kelasId: string | null;
  /** Satu siswa punya satu orang tua; satu orang tua bisa punya beberapa siswa. */
  ortuId: string | null;
};

/** D3 — Absensi. Satu record per siswa per tanggal. */
export type Absensi = {
  id: string;
  siswaId: string;
  /** Format ISO, yyyy-mm-dd. */
  tanggal: string;
  status: StatusHadir;
  catatan: string | null;
  /** ID user yang mencatat. */
  dicatatOleh: string;
};

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
