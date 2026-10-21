import type { Route } from "./+types/orang-tua";
import { HalamanUser } from "../../components/HalamanUser";
import { repoUser } from "../../lib/repo";

export function meta() {
  return [{ title: "Data Orang Tua — LMS TK/PAUD" }];
}

export function clientLoader() {
  return { data: repoUser.semua().filter((u) => u.role === "ortu") };
}

export default function AdminOrangTua({ loaderData }: Route.ComponentProps) {
  return (
    <HalamanUser
      role="ortu"
      judul="Data Orang Tua"
      deskripsi="Akun wali murid. Penghubungan dengan data anak dilakukan di FR-03."
      labelSatuan="Orang Tua"
      data={loaderData.data}
    />
  );
}
