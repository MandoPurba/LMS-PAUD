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

    // 3.0 Absensi & Izin — FR-05
    route("guru/absensi", "routes/guru/absensi.tsx"),

    // 4.0 Daily Report & Galeri — FR-07
    route("guru/daily-report", "routes/guru/daily-report.tsx"),
  ]),
] satisfies RouteConfig;
