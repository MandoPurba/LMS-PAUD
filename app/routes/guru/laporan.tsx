import type { Route } from "./+types/laporan";
import { HalamanLaporan } from "../../components/HalamanLaporan";
import { muatLaporan } from "../../lib/laporan-loader";

export function meta() {
  return [{ title: "Laporan Kelas — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  return { data: muatLaporan(request.url, "guru") };
}

export default function GuruLaporan({ loaderData }: Route.ComponentProps) {
  return <HalamanLaporan data={loaderData.data} judul="Laporan Kelas" />;
}
