import type { Route } from "./+types/orang-tua";
import { HalamanUser } from "../../components/HalamanUser";
import { anakDariOrtu, cekHapusUser } from "../../lib/relasi";
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
      deskripsi="Akun wali murid. Penghubungan dengan anak dilakukan dari Data Siswa."
      labelSatuan="Orang Tua"
      data={loaderData.data}
      kolomTambahan={{
        judul: "Anak",
        render: (u) => {
          const anak = anakDariOrtu(u.id);
          return anak.length === 0 ? "—" : anak.map((s) => s.nama).join(", ");
        },
      }}
      cekHapus={cekHapusUser}
    />
  );
}
