import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel, tanggalPanjang } from "../../components/ui";
import { MENU } from "../../lib/menu";
import { daftarUser } from "../../lib/session";

export function meta() {
  return [{ title: "Dashboard Admin — LMS TK/PAUD" }];
}

export function clientLoader() {
  const user = daftarUser();
  return {
    total: user.length,
    guru: user.filter((u) => u.role === "guru" && u.aktif).length,
    ortu: user.filter((u) => u.role === "ortu" && u.aktif).length,
    nonaktif: user.filter((u) => !u.aktif).length,
  };
}

export default function DashboardAdmin({ loaderData }: Route.ComponentProps) {
  const belumSiap = MENU.admin.filter((m) => !m.siap);

  const statistik = [
    { label: "Total akun", nilai: loaderData.total },
    { label: "Guru aktif", nilai: loaderData.guru },
    { label: "Orang tua aktif", nilai: loaderData.ortu },
    { label: "Akun nonaktif", nilai: loaderData.nonaktif },
  ];

  return (
    <>
      <JudulHalaman judul="Dashboard Admin" deskripsi={tanggalPanjang()} />

      <div className="space-y-5">
        <Panel judul="Akun pengguna (D1)">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statistik.map((s) => (
              <div key={s.label} className="rounded-field bg-surface-sunken px-3 py-3">
                <dt className="text-xs text-fg-muted">{s.label}</dt>
                <dd className="font-display text-2xl font-bold">{s.nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-fg-subtle">
            Dihitung dari data akun. Pengelolaan datanya dikerjakan di FR-02.
          </p>
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
