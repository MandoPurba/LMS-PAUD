import type { Route } from "./+types/dashboard";
import { JudulHalaman, KartuFitur, Panel, tanggalPanjang } from "../../components/ui";
import { MENU } from "../../lib/menu";
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
  };
}

export default function DashboardOrtu({ loaderData }: Route.ComponentProps) {
  const { nama, tahun, anak } = loaderData;
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
                </li>
              ))}
            </ul>
          )}
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
