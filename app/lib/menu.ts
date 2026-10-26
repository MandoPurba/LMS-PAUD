import type { Role } from "../data/types";

export type ItemMenu = {
  label: string;
  to: string;
  /** Nama ikon Font Awesome tanpa awalan, mis. "house". */
  ikon: string;
  /** Kode FR yang mengerjakan halaman ini. */
  fr: string;
  /** false = halaman belum dibuat, ditampilkan sebagai "Segera". */
  siap: boolean;
};

export const MENU: Record<Role, ItemMenu[]> = {
  admin: [
    { label: "Dashboard", to: "/admin", ikon: "house", fr: "FR-01", siap: true },
    { label: "Data Siswa", to: "/admin/siswa", ikon: "children", fr: "FR-02", siap: true },
    { label: "Data Guru", to: "/admin/guru", ikon: "chalkboard-user", fr: "FR-02", siap: true },
    { label: "Data Orang Tua", to: "/admin/orang-tua", ikon: "user-group", fr: "FR-02", siap: true },
    { label: "Kelas", to: "/admin/kelas", ikon: "school", fr: "FR-03", siap: true },
    { label: "Tahun Ajaran", to: "/admin/tahun-ajaran", ikon: "calendar-days", fr: "FR-03", siap: true },
    { label: "Pengumuman", to: "/admin/pengumuman", ikon: "bullhorn", fr: "FR-04", siap: true },
    { label: "Jadwal Kegiatan", to: "/admin/jadwal", ikon: "calendar-check", fr: "FR-04", siap: true },
    { label: "Menu Makan", to: "/admin/menu-makan", ikon: "utensils", fr: "FR-04", siap: true },
    { label: "Laporan", to: "/admin/laporan", ikon: "chart-column", fr: "FR-14", siap: true },
  ],
  guru: [
    { label: "Dashboard", to: "/guru", ikon: "house", fr: "FR-01", siap: true },
    { label: "Absensi", to: "/guru/absensi", ikon: "clipboard-check", fr: "FR-05", siap: true },
    { label: "Pengajuan Izin", to: "/guru/izin", ikon: "file-signature", fr: "FR-06", siap: true },
    { label: "Daily Report", to: "/guru/daily-report", ikon: "book-open", fr: "FR-07", siap: true },
    { label: "Galeri", to: "/guru/galeri", ikon: "images", fr: "FR-09", siap: true },
    { label: "Observasi STPPA", to: "/guru/observasi", ikon: "seedling", fr: "FR-10", siap: true },
    { label: "Rapor", to: "/guru/rapor", ikon: "file-lines", fr: "FR-11", siap: true },
    { label: "Laporan", to: "/guru/laporan", ikon: "chart-column", fr: "FR-14", siap: true },
  ],
  ortu: [
    { label: "Dashboard", to: "/ortu", ikon: "house", fr: "FR-01", siap: true },
    { label: "Daily Report", to: "/ortu/daily-report", ikon: "book-open", fr: "FR-08", siap: true },
    { label: "Galeri", to: "/ortu/galeri", ikon: "images", fr: "FR-09", siap: true },
    { label: "Ajukan Izin", to: "/ortu/izin", ikon: "file-signature", fr: "FR-06", siap: true },
    { label: "Rapor", to: "/ortu/rapor", ikon: "file-lines", fr: "FR-12", siap: true },
  ],
};

export const LABEL_ROLE: Record<Role, string> = {
  admin: "Admin Sekolah",
  guru: "Guru",
  ortu: "Orang Tua",
};

/** Kelas warna per role. Ditulis eksplisit karena Tailwind tidak memindai kelas dinamis. */
export const WARNA_ROLE: Record<Role, { chip: string; titik: string }> = {
  admin: { chip: "bg-role-admin-soft text-role-admin", titik: "bg-role-admin" },
  guru: { chip: "bg-role-guru-soft text-role-guru", titik: "bg-role-guru" },
  ortu: { chip: "bg-role-ortu-soft text-role-ortu", titik: "bg-role-ortu" },
};
