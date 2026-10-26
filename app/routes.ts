import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("403", "routes/forbidden.tsx"),
  route("tokens", "routes/tokens.tsx"),

  // Halaman yang butuh login. Role dicek dari segmen pertama path (FR-01).
  layout("routes/app-layout.tsx", [
    // 1.0 Login & Autentikasi
    route("admin", "routes/admin/dashboard.tsx"),
    route("guru", "routes/guru/dashboard.tsx"),
    route("ortu", "routes/ortu/dashboard.tsx"),

    // 2.0 Kelola Master Data — FR-02
    route("admin/siswa", "routes/admin/siswa.tsx"),
    route("admin/guru", "routes/admin/guru.tsx"),
    route("admin/orang-tua", "routes/admin/orang-tua.tsx"),

    // 2.0 Kelola Master Data — FR-03
    route("admin/tahun-ajaran", "routes/admin/tahun-ajaran.tsx"),
    route("admin/kelas", "routes/admin/kelas.tsx"),

    // 2.0 Kelola Master Data — FR-04
    route("admin/pengumuman", "routes/admin/pengumuman.tsx"),
    route("admin/jadwal", "routes/admin/jadwal.tsx"),
    route("admin/menu-makan", "routes/admin/menu-makan.tsx"),

    // 3.0 Absensi & Izin — FR-05
    route("guru/absensi", "routes/guru/absensi.tsx"),

    // 3.0 Absensi & Izin — FR-06
    route("guru/izin", "routes/guru/izin.tsx"),
    route("ortu/izin", "routes/ortu/izin.tsx"),

    // 4.0 Daily Report & Galeri — FR-07
    route("guru/daily-report", "routes/guru/daily-report.tsx"),
    route("ortu/daily-report", "routes/ortu/daily-report.tsx"),

    // 5.0 Observasi & Rapor — FR-10
    route("guru/observasi", "routes/guru/observasi.tsx"),
    route("guru/rapor", "routes/guru/rapor.tsx"),

    // 6.0 Laporan — FR-14
    route("admin/laporan", "routes/admin/laporan.tsx"),
    route("guru/laporan", "routes/guru/laporan.tsx"),

    // Notifikasi lintas proses — FR-13
    route("admin/notifikasi", "routes/admin/notifikasi.tsx"),
    route("guru/notifikasi", "routes/guru/notifikasi.tsx"),
    route("ortu/notifikasi", "routes/ortu/notifikasi.tsx"),
    route("ortu/rapor", "routes/ortu/rapor.tsx"),
  ]),
] satisfies RouteConfig;
