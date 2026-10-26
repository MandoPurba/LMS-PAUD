import { Link } from "react-router";

import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel } from "../../components/ui";
import { tanggalLokal, tanggalPanjang, tanggalPendek } from "../../lib/tanggal";
import { MENU } from "../../lib/menu";
import { jadwalMendatang, menuTanggal } from "../../lib/pengumuman";
import { anakDariOrtu, namaKelas, namaUser, tahunAktif } from "../../lib/relasi";
import { repoKelas } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";

export function meta() {
  return [{ title: "Dashboard Orang Tua — LMS TK/PAUD" }];
}

export function clientLoader() {
  const sesi = ambilSesi();
  const anak = sesi ? anakDariOrtu(sesi.id) : [];

  return {
    nama: sesi?.nama ?? "",
    tahun: tahunAktif() ?? null,
    anak: anak.map((s) => ({
      id: s.id,
      nama: s.nama,
      jenisKelamin: s.jenisKelamin,
      labelKelas: namaKelas(s.kelasId),
      belumBerkelas: s.kelasId === null,
      namaWali: s.kelasId ? namaUser(repoKelas.cari(s.kelasId)?.guruId ?? null) : "—",
    })),
    // FR-04: jadwal kegiatan terdekat dan menu makan hari ini, dilihat lewat dashboard (lihat lib/pengumuman.ts).
    jadwal: jadwalMendatang(tanggalLokal(), 3),
    menuHariIni: menuTanggal(tanggalLokal()) ?? null,
  };
}

export default function DashboardOrtu({ loaderData }: Route.ComponentProps) {
  const { nama, tahun, anak, jadwal, menuHariIni } = loaderData;
  const belumSiap = MENU.ortu.filter((m) => !m.siap);

  return (
    <>
      <JudulHalaman judul={`Selamat datang, ${nama}`} deskripsi={tanggalPanjang()} />

      <div className="space-y-5">
        <Panel judul={anak.length > 1 ? `Anak Anda (${anak.length})` : "Anak Anda"}>
          {anak.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Belum ada anak yang terhubung ke akun ini. Hubungi admin sekolah untuk
              menghubungkan data anak Anda.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {anak.map((a) => (
                <li key={a.id} className="rounded-field bg-surface-sunken px-3 py-3">
                  <p className="font-medium">{a.nama}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {a.belumBerkelas ? (
                      <span className="text-warning">Belum ditempatkan di kelas</span>
                    ) : (
                      <>
                        {a.labelKelas}
                        {tahun ? ` · ${tahun.nama}` : ""} · Wali: {a.namaWali}
                      </>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Link
                      to={`/ortu/daily-report?anak=${a.id}`}
                      className="text-xs font-semibold text-primary underline"
                    >
                      Daily report →
                    </Link>
                    <Link
                      to={`/ortu/rapor?anak=${a.id}`}
                      className="text-xs font-semibold text-primary underline"
                    >
                      Rapor →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
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
