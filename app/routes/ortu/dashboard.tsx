import { useOutletContext } from "react-router";

import { JudulHalaman, KartuFitur, Panel, tanggalPanjang } from "../../components/ui";
import type { KontekAplikasi } from "../app-layout";
import { MENU } from "../../lib/menu";

export function meta() {
  return [{ title: "Dashboard Orang Tua — LMS TK/PAUD" }];
}

export default function DashboardOrtu() {
  const { sesi } = useOutletContext<KontekAplikasi>();
  const belumSiap = MENU.ortu.filter((m) => !m.siap);

  return (
    <>
      <JudulHalaman judul={`Selamat datang, ${sesi.nama}`} deskripsi={tanggalPanjang()} />

      <div className="space-y-5">
        <Panel judul="Anak Anda">
          <p className="text-sm text-fg-muted">
            Belum ada anak yang terhubung ke akun ini. Admin menghubungkan akun orang tua dengan data
            anaknya pada <span className="font-semibold">FR-03</span>.
          </p>
        </Panel>

        <Panel judul="Yang bisa Anda lihat nanti">
          <div className="grid gap-2 sm:grid-cols-2">
            {belumSiap.map((m) => (
              <KartuFitur key={m.to} item={m} />
            ))}
          </div>
          <p className="mt-3 text-xs text-fg-subtle">
            Anda hanya dapat melihat data anak Anda sendiri.
          </p>
        </Panel>
      </div>
    </>
  );
}
