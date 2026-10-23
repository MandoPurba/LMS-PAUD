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

export type Mood = "senang" | "biasa" | "rewel" | "sedih" | "lelah";
export type PorsiMakan = "habis" | "sebagian" | "tidak";
export type TidurSiang = "nyenyak" | "sebentar" | "tidak";

/** D5 — Daily Report. Satu report per anak per hari. */
export type DailyReport = {
  id: string;
  siswaId: string;
  /** Format ISO, yyyy-mm-dd. */
  tanggal: string;
  kegiatan: string;
  makan: PorsiMakan;
  tidur: TidurSiang;
  mood: Mood;
  catatan: string | null;
  /** Data URL hasil kompresi. */
  foto: string[];
  status: "draft" | "published";
  dibuatOleh: string;
};

export type IndikatorStppa = { id: string; teks: string };

/** Master STPPA: satu baris per aspek beserta indikatornya. */
export type AspekMaster = {
  aspek: AspekStppa;
  label: string;
  indikator: IndikatorStppa[];
};

/** D6 — Observasi. Satu catatan per indikator per tanggal. */
export type Observasi = {
  id: string;
  siswaId: string;
  /** Format ISO, yyyy-mm-dd. */
  tanggal: string;
  aspek: AspekStppa;
  indikatorId: string;
  capaian: Capaian;
  catatan: string | null;
  dicatatOleh: string;
};

export type CapaianRapor = {
  aspek: AspekStppa;
  capaian: Capaian;
  /** Banyak observasi yang mendasari capaian ini. */
  jumlahObservasi: number;
  narasi: string;
};

/**
 * D7 — Rapor. Periode disimpan sebagai nama tahun ajaran + semester, bukan id,
 * agar sejalan dengan cara observasi dikelompokkan (lihat periodeAkademik()).
 */
export type Rapor = {
  id: string;
  siswaId: string;
  tahunAjaran: string;
  semester: Semester;
  capaian: CapaianRapor[];
  catatanUmum: string | null;
  status: "draft" | "published";
  tglPublikasi: string | null;
  disusunOleh: string;
};

export type JenisIzin = "izin" | "sakit";
export type StatusIzin = "pending" | "disetujui" | "ditolak";

/** D4 — Izin. Diajukan orang tua, diverifikasi guru kelas. */
export type Izin = {
  id: string;
  siswaId: string;
  /** ID akun orang tua yang mengajukan. */
  diajukanOleh: string;
  /** Tanggal anak tidak masuk, format ISO yyyy-mm-dd. */
  tanggal: string;
  jenis: JenisIzin;
  alasan: string;
  status: StatusIzin;
  tglPengajuan: string;
  diverifikasiOleh: string | null;
  catatanVerifikasi: string | null;
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
