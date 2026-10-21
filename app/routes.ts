import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("403", "routes/forbidden.tsx"),
  route("tokens", "routes/tokens.tsx"),

  // Halaman yang butuh login. Role dicek dari segmen pertama path (FR-01).
  layout("routes/app-layout.tsx", [
    route("admin", "routes/admin/dashboard.tsx"),
    route("guru", "routes/guru/dashboard.tsx"),
    route("ortu", "routes/ortu/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
