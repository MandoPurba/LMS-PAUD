import { useOutletContext } from "react-router";

import { JudulHalaman, KartuFitur, Panel, tanggalPanjang } from "../../components/ui";
import type { KontekAplikasi } from "../app-layout";
import { MENU } from "../../lib/menu";

export function meta() {
  return [{ title: "Dashboard Guru — LMS TK/PAUD" }];
}

export default function DashboardGuru() {
  const { sesi } = useOutletContext<KontekAplikasi>();
  const belumSiap = MENU.guru.filter((m) => !m.siap);

  return (
    <>
      <JudulHalaman judul={`Selamat datang, ${sesi.nama}`} deskripsi={tanggalPanjang()} />

      <div className="space-y-5">
        <Panel judul="Kelas yang Anda ampu">
          <p className="text-sm text-fg-muted">
            Belum ada kelas yang ditetapkan. Admin menugaskan guru kelas pada{" "}
            <span className="font-semibold">FR-03</span>; setelah itu daftar siswa muncul di sini.
          </p>
        </Panel>

        <Panel judul="Tugas harian">
          <p className="text-sm text-fg-muted">
            Alur harian guru: catat absensi, lalu isi daily report untuk anak yang hadir. Daily report
            hanya dapat dibuat bila anak berstatus <span className="font-semibold">Hadir</span>.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {belumSiap.map((m) => (
              <KartuFitur key={m.to} item={m} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
