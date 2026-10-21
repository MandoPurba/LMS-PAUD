import type { Route } from "./+types/guru";
import { HalamanUser } from "../../components/HalamanUser";
import { cekHapusUser, kelasDariGuru, namaTahun, tahunAktif } from "../../lib/relasi";
import { repoUser } from "../../lib/repo";

export function meta() {
  return [{ title: "Data Guru — LMS TK/PAUD" }];
}

export function clientLoader() {
  return {
    data: repoUser.semua().filter((u) => u.role === "guru"),
    tahun: tahunAktif() ?? null,
  };
}

export default function AdminGuru({ loaderData }: Route.ComponentProps) {
  const tahun = loaderData.tahun;

  return (
    <HalamanUser
      role="guru"
      judul="Data Guru"
      deskripsi={
        tahun
          ? `Akun guru kelas. Kolom kelas menunjukkan kelas yang diampu pada tahun ajaran ${tahun.nama}.`
          : "Akun guru kelas. Belum ada tahun ajaran aktif."
      }
      labelSatuan="Guru"
      data={loaderData.data}
      kolomTambahan={{
        judul: "Kelas diampu",
        render: (u) => {
          const kelas = kelasDariGuru(u.id);
          return kelas ? `${kelas.nama} (${namaTahun(kelas.tahunAjaranId)})` : "—";
        },
      }}
      cekHapus={cekHapusUser}
    />
  );
}
