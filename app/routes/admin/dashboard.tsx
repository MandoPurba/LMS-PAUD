import { Link } from "react-router";

import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel, tanggalPanjang } from "../../components/ui";
import { MENU } from "../../lib/menu";
import { repoSiswa, repoUser } from "../../lib/repo";

export function meta() {
  return [{ title: "Dashboard Admin — LMS TK/PAUD" }];
}

export function clientLoader() {
  const user = repoUser.semua();
  return {
    siswa: repoSiswa.semua().length,
    guru: user.filter((u) => u.role === "guru").length,
    ortu: user.filter((u) => u.role === "ortu").length,
    nonaktif: user.filter((u) => !u.aktif).length,
    belumBerkelas: repoSiswa.semua().filter((s) => s.kelasId === null).length,
  };
}

export default function DashboardAdmin({ loaderData }: Route.ComponentProps) {
  const belumSiap = MENU.admin.filter((m) => !m.siap);

  const statistik = [
    { label: "Siswa", nilai: loaderData.siswa, to: "/admin/siswa" },
    { label: "Guru", nilai: loaderData.guru, to: "/admin/guru" },
    { label: "Orang tua", nilai: loaderData.ortu, to: "/admin/orang-tua" },
    { label: "Akun nonaktif", nilai: loaderData.nonaktif, to: null },
  ];

  return (
    <>
      <JudulHalaman judul="Dashboard Admin" deskripsi={tanggalPanjang()} />

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

          {loaderData.belumBerkelas > 0 && (
            <p className="mt-3 rounded-field bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
              {loaderData.belumBerkelas} siswa belum ditempatkan di kelas. Penempatan kelas
              dikerjakan di FR-03.
            </p>
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
