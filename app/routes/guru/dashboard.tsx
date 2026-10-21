import { Link } from "react-router";

import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel } from "../../components/ui";
import { tanggalPanjang } from "../../lib/tanggal";
import { MENU } from "../../lib/menu";
import { kelasDariGuru, siswaDariKelas, tahunAktif } from "../../lib/relasi";
import { ambilSesi } from "../../lib/session";

export function meta() {
  return [{ title: "Dashboard Guru — LMS TK/PAUD" }];
}

export function clientLoader() {
  const sesi = ambilSesi();
  const tahun = tahunAktif() ?? null;
  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;

  return {
    nama: sesi?.nama ?? "",
    tahun,
    kelas,
    siswa: kelas ? siswaDariKelas(kelas.id) : [],
  };
}

export default function DashboardGuru({ loaderData }: Route.ComponentProps) {
  const { nama, tahun, kelas, siswa } = loaderData;
  const belumSiap = MENU.guru.filter((m) => !m.siap);

  return (
    <>
      <JudulHalaman judul={`Selamat datang, ${nama}`} deskripsi={tanggalPanjang()} />

      <div className="space-y-5">
        <Panel judul="Kelas yang Anda ampu">
          {kelas === null ? (
            <p className="text-sm text-fg-muted">
              Anda belum ditetapkan sebagai wali kelas
              {tahun ? ` pada tahun ajaran ${tahun.nama}` : ""}. Admin menetapkannya di menu Kelas.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-display text-xl font-bold">{kelas.nama}</p>
                {tahun && (
                  <p className="text-sm text-fg-muted">
                    {tahun.nama} · Semester {tahun.semesterAktif}
                  </p>
                )}
              </div>

              {siswa.length === 0 ? (
                <p className="mt-3 text-sm text-fg-muted">
                  Belum ada siswa di kelas ini. Admin menempatkan siswa di menu Data Siswa.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm text-fg-muted">{siswa.length} siswa</p>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {siswa.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-field bg-surface-sunken px-3 py-2 text-sm"
                      >
                        {s.nama}
                        <span className="ml-1.5 text-xs text-fg-subtle">({s.jenisKelamin})</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </Panel>

        <Panel judul="Tugas harian">
          <p className="text-sm text-fg-muted">
            Alur harian guru: catat absensi, lalu isi daily report untuk anak yang hadir. Daily
            report hanya dapat dibuat bila anak berstatus <span className="font-semibold">Hadir</span>.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {belumSiap.map((m) => (
              <KartuFitur key={m.to} item={m} />
            ))}
          </div>
        </Panel>

        <p className="text-xs text-fg-subtle">
          Anda hanya dapat mengakses data kelas yang Anda ampu.{" "}
          <Link to="/guru" className="underline">
            Muat ulang
          </Link>{" "}
          bila admin baru mengubah penugasan.
        </p>
      </div>
    </>
  );
}
