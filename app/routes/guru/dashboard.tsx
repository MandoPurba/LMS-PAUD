import { Link } from "react-router";

import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel } from "../../components/ui";
import { tanggalLokal, tanggalPanjang, tanggalPendek } from "../../lib/tanggal";
import { MENU } from "../../lib/menu";
import { jadwalMendatang, menuTanggal } from "../../lib/pengumuman";
import { kelasDariGuru, semesterBerjalan, siswaDariKelas, tahunAktif } from "../../lib/relasi";
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
    semester: semesterBerjalan(),
    kelas,
    siswa: kelas ? siswaDariKelas(kelas.id) : [],
    // FR-04: jadwal kegiatan terdekat dan menu makan hari ini, dilihat lewat dashboard (lihat lib/pengumuman.ts).
    jadwal: jadwalMendatang(tanggalLokal(), 3),
    menuHariIni: menuTanggal(tanggalLokal()) ?? null,
  };
}

export default function DashboardGuru({ loaderData }: Route.ComponentProps) {
  const { nama, tahun, semester, kelas, siswa, jadwal, menuHariIni } = loaderData;
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
                    {tahun.nama}
                    {semester ? ` · Semester ${semester}` : ""}
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

        <Panel judul="Jadwal Kegiatan & Menu Makan">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-fg-muted">Kegiatan mendatang</p>
              {jadwal.length === 0 ? (
                <p className="mt-1.5 text-sm text-fg-subtle">Belum ada jadwal kegiatan.</p>
              ) : (
                <ul className="mt-1.5 space-y-2">
                  {jadwal.map((j) => (
                    <li key={j.id} className="rounded-field bg-surface-sunken px-3 py-2">
                      <p className="text-sm font-medium">{j.nama}</p>
                      <p className="text-xs text-fg-subtle">
                        {tanggalPendek(j.tanggal)}
                        {j.lokasi ? ` · ${j.lokasi}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-fg-muted">Menu makan hari ini</p>
              {menuHariIni === null ? (
                <p className="mt-1.5 text-sm text-fg-subtle">Menu makan hari ini belum diisi.</p>
              ) : (
                <div className="mt-1.5 rounded-field bg-surface-sunken px-3 py-2 text-sm">
                  <p>
                    {menuHariIni.makananPokok} · {menuHariIni.laukPauk}
                  </p>
                  {menuHariIni.sayur && <p className="text-fg-muted">{menuHariIni.sayur}</p>}
                  {menuHariIni.buah && <p className="text-fg-muted">{menuHariIni.buah}</p>}
                  {menuHariIni.catatanAlergi && (
                    <p className="mt-1 text-xs font-medium text-warning">
                      {menuHariIni.catatanAlergi}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
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
