import type { Route } from "./+types/guru";
import { HalamanUser } from "../../components/HalamanUser";
import { repoUser } from "../../lib/repo";

export function meta() {
  return [{ title: "Data Guru — LMS TK/PAUD" }];
}

export function clientLoader() {
  return { data: repoUser.semua().filter((u) => u.role === "guru") };
}

export default function AdminGuru({ loaderData }: Route.ComponentProps) {
  return (
    <HalamanUser
      role="guru"
      judul="Data Guru"
      deskripsi="Akun guru kelas. Penugasan ke kelas dilakukan di FR-03."
      labelSatuan="Guru"
      data={loaderData.data}
    />
  );
}
