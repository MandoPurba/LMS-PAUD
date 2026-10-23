import type { Route } from "./+types/laporan";
import { HalamanLaporan } from "../../components/HalamanLaporan";
import { muatLaporan } from "../../lib/laporan-loader";

export function meta() {
  return [{ title: "Laporan — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  return { data: muatLaporan(request.url, "admin") };
}

export default function AdminLaporan({ loaderData }: Route.ComponentProps) {
  return <HalamanLaporan data={loaderData.data} judul="Laporan Sekolah" />;
}
