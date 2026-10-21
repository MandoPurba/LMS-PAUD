import { Link } from "react-router";

import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel } from "../../components/ui";
import { tanggalPanjang } from "../../lib/tanggal";
import { MENU } from "../../lib/menu";
import { tahunAktif } from "../../lib/relasi";
import { repoKelas, repoSiswa, repoUser } from "../../lib/repo";

export function meta() {
  return [{ title: "Dashboard Admin — LMS TK/PAUD" }];
}

export function clientLoader() {
  const user = repoUser.semua();
  const siswa = repoSiswa.semua();
  const tahun = tahunAktif() ?? null;

  return {
    tahun,
    siswa: siswa.length,
    guru: user.filter((u) => u.role === "guru").length,
    ortu: user.filter((u) => u.role === "ortu").length,
    kelas: tahun ? repoKelas.semua().filter((k) => k.tahunAjaranId === tahun.id).length : 0,
    belumBerkelas: siswa.filter((s) => s.kelasId === null).length,
    belumBerortu: siswa.filter((s) => s.ortuId === null).length,
    kelasTanpaWali: repoKelas
      .semua()
      .filter((k) => k.guruId === null && (tahun === null || k.tahunAjaranId === tahun.id)).length,
  };
}

export default function DashboardAdmin({ loaderData }: Route.ComponentProps) {
  const belumSiap = MENU.admin.filter((m) => !m.siap);

  const statistik = [
    { label: "Siswa", nilai: loaderData.siswa, to: "/admin/siswa" },
    { label: "Guru", nilai: loaderData.guru, to: "/admin/guru" },
    { label: "Orang tua", nilai: loaderData.ortu, to: "/admin/orang-tua" },
    { label: "Kelas (tahun aktif)", nilai: loaderData.kelas, to: "/admin/kelas" },
  ];

  const perluTindakan = [
    {
      jumlah: loaderData.belumBerkelas,
      pesan: `${loaderData.belumBerkelas} siswa belum ditempatkan di kelas.`,
      to: "/admin/siswa",
    },
    {
      jumlah: loaderData.belumBerortu,
      pesan: `${loaderData.belumBerortu} siswa belum dihubungkan ke akun orang tua.`,
      to: "/admin/siswa",
    },
    {
      jumlah: loaderData.kelasTanpaWali,
      pesan: `${loaderData.kelasTanpaWali} kelas belum punya wali kelas.`,
      to: "/admin/kelas",
    },
  ].filter((p) => p.jumlah > 0);

  return (
    <>
      <JudulHalaman
        judul="Dashboard Admin"
        deskripsi={
          loaderData.tahun
            ? `${tanggalPanjang()} · Tahun ajaran ${loaderData.tahun.nama} Semester ${loaderData.tahun.semesterAktif}`
            : `${tanggalPanjang()} · Belum ada tahun ajaran aktif`
        }
      />

      <div className="space-y-5">
        <Panel judul="Master data">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statistik.map((s) => {
              const isi = (
                <>
                  <dt className="text-xs text-fg-muted">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold">{s.nilai}</dd>
                </>
              );
              return s.to ? (
                <Link
                  key={s.label}
                  to={s.to}
                  className="rounded-field bg-surface-sunken px-3 py-3 transition hover:bg-surface-hover"
                >
                  {isi}
                </Link>
              ) : (
                <div key={s.label} className="rounded-field bg-surface-sunken px-3 py-3">
                  {isi}
                </div>
              );
            })}
          </dl>

          {perluTindakan.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {perluTindakan.map((p) => (
                <li key={p.pesan}>
                  <Link
                    to={p.to}
                    className="block rounded-field bg-warning-soft px-3 py-2 text-xs font-medium text-warning transition hover:opacity-90"
                  >
                    {p.pesan} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel judul="Menu yang belum tersedia">
          <div className="grid gap-2 sm:grid-cols-2">
            {belumSiap.map((m) => (
              <KartuFitur key={m.to} item={m} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
