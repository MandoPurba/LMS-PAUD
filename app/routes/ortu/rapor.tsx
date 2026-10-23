import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/rapor";
import { TombolSekunder, TombolUtama } from "../../components/form";
import { JudulHalaman, Panel } from "../../components/ui";
import { raporTerbitSiswa } from "../../lib/rapor";
import { anakDariOrtu, namaKelas, namaUser } from "../../lib/relasi";
import { repoKelas } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { LABEL_CAPAIAN, WARNA_CAPAIAN, labelAspek } from "../../lib/stppa";
import { tanggalPendek } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Rapor — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const anak = sesi ? anakDariOrtu(sesi.id) : [];
  const params = new URL(request.url).searchParams;

  // Hanya anak milik akun ini (NFR-04); id asing jatuh ke anak pertama.
  const terpilihAnak = anak.find((a) => a.id === params.get("anak")) ?? anak[0] ?? null;

  // raporTerbitSiswa() sudah memfilter status published, jadi draft guru
  // tidak pernah sampai ke sisi orang tua.
  const daftar = terpilihAnak ? raporTerbitSiswa(terpilihAnak.id) : [];
  const dimintaRapor = params.get("rapor");
  const rapor = daftar.find((r) => r.id === dimintaRapor) ?? daftar[0] ?? null;

  return {
    anak: anak.map((a) => ({ id: a.id, nama: a.nama })),
    terpilihAnak: terpilihAnak
      ? {
          id: terpilihAnak.id,
          nama: terpilihAnak.nama,
          nisn: terpilihAnak.nisn,
          labelKelas: namaKelas(terpilihAnak.kelasId),
          namaWali: terpilihAnak.kelasId
            ? namaUser(repoKelas.cari(terpilihAnak.kelasId)?.guruId ?? null)
            : "—",
        }
      : null,
    daftar: daftar.map((r) => ({
      id: r.id,
      label: `${r.tahunAjaran} Semester ${r.semester}`,
      tglPublikasi: r.tglPublikasi,
    })),
    rapor,
  };
}

export default function OrtuRapor({ loaderData }: Route.ComponentProps) {
  const { anak, terpilihAnak, daftar, rapor } = loaderData;
  const [params, setParams] = useSearchParams();

  function gantiParam(kunci: string, nilai: string) {
    const baru = new URLSearchParams(params);
    baru.set(kunci, nilai);
    if (kunci === "anak") baru.delete("rapor");
    setParams(baru, { preventScrollReset: true });
  }

  if (terpilihAnak === null) {
    return (
      <>
        <JudulHalaman judul="Rapor" />
        <Panel judul="Belum ada anak terhubung">
          <p className="text-sm text-fg-muted">
            Akun Anda belum dihubungkan dengan data anak. Hubungi admin sekolah terlebih dahulu.
          </p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <div className="tanpa-cetak">
        <JudulHalaman
          judul="Rapor Perkembangan"
          deskripsi={`${terpilihAnak.nama} · ${terpilihAnak.labelKelas}`}
        />

        {anak.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-fg-muted">Pilih anak</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {anak.map((a) => {
                const aktif = a.id === terpilihAnak.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => gantiParam("anak", a.id)}
                    className={`rounded-pill px-3 py-1.5 text-sm font-medium transition ${
                      aktif
                        ? "bg-primary text-fg-on-brand"
                        : "border border-border text-fg-muted hover:bg-surface-hover"
                    }`}
                  >
                    {a.nama}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {rapor === null ? (
        <Panel judul="Belum ada rapor">
          <p className="text-sm text-fg-muted">
            Belum ada rapor terbit untuk {terpilihAnak.nama}. Rapor diterbitkan guru pada akhir
            semester.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {daftar.length > 1 && (
            <div className="tanpa-cetak">
              <label htmlFor="rapor" className="block text-xs font-semibold text-fg-muted">
                Semester
              </label>
              <select
                id="rapor"
                value={rapor.id}
                onChange={(e) => gantiParam("rapor", e.target.value)}
                className="mt-1 rounded-field border border-border bg-surface px-3 py-2 text-sm"
              >
                {daftar.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <article className="area-cetak rounded-card border border-border bg-surface-raised p-5 shadow-card sm:p-6">
            {/* Kepala surat hanya muncul di hasil cetak. */}
            <header className="hanya-cetak mb-6 border-b border-border pb-4 text-center">
              <p className="text-sm font-semibold">TK/PAUD TUNAS HARAPAN</p>
              <h1 className="mt-1 text-lg">RAPOR PERKEMBANGAN ANAK</h1>
            </header>

            <div className="mb-5 grid gap-x-6 gap-y-1.5 border-b border-border pb-4 text-sm sm:grid-cols-2">
              <p>
                <span className="text-fg-muted">Nama</span>
                <span className="ml-2 font-medium">{terpilihAnak.nama}</span>
              </p>
              <p>
                <span className="text-fg-muted">NISN</span>
                <span className="ml-2 font-medium">{terpilihAnak.nisn}</span>
              </p>
              <p>
                <span className="text-fg-muted">Kelas</span>
                <span className="ml-2 font-medium">{terpilihAnak.labelKelas}</span>
              </p>
              <p>
                <span className="text-fg-muted">Semester</span>
                <span className="ml-2 font-medium">
                  {rapor.tahunAjaran} Semester {rapor.semester}
                </span>
              </p>
              <p>
                <span className="text-fg-muted">Wali kelas</span>
                <span className="ml-2 font-medium">{terpilihAnak.namaWali}</span>
              </p>
              <p>
                <span className="text-fg-muted">Tanggal terbit</span>
                <span className="ml-2 font-medium">
                  {rapor.tglPublikasi ? tanggalPendek(rapor.tglPublikasi) : "—"}
                </span>
              </p>
            </div>

            <h2 className="text-base">Capaian Perkembangan</h2>
            <ul className="mt-2 divide-y divide-border">
              {rapor.capaian.map((c) => (
                <li key={c.aspek} className="putus-halaman py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-field px-2 py-1 text-xs font-bold ${WARNA_CAPAIAN[c.capaian]}`}
                    >
                      {c.capaian}
                    </span>
                    <p className="min-w-0 flex-1 text-sm font-medium">{labelAspek(c.aspek)}</p>
                    <span className="text-xs text-fg-subtle">{LABEL_CAPAIAN[c.capaian]}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-fg-muted">{c.narasi}</p>
                </li>
              ))}
            </ul>

            {rapor.catatanUmum && (
              <div className="putus-halaman mt-5 border-t border-border pt-4">
                <h2 className="text-base">Catatan Umum</h2>
                <p className="mt-1.5 text-sm text-fg-muted">{rapor.catatanUmum}</p>
              </div>
            )}

            <div className="hanya-cetak mt-10 text-sm">
              <div className="flex justify-between">
                <div className="text-center">
                  <p>Orang Tua / Wali</p>
                  <p className="mt-16">( …………………………… )</p>
                </div>
                <div className="text-center">
                  <p>Wali Kelas</p>
                  <p className="mt-16">( {terpilihAnak.namaWali} )</p>
                </div>
              </div>
            </div>

            <p className="hanya-cetak mt-6 border-t border-border pt-2 text-center text-xs text-fg-subtle">
              Keterangan: BB Belum Berkembang · MB Mulai Berkembang · BSH Berkembang Sesuai
              Harapan · BSB Berkembang Sangat Baik
            </p>
          </article>

          <div className="tanpa-cetak flex flex-wrap items-center gap-3">
            <p className="text-xs text-fg-subtle">
              Unduh akan membuka dialog cetak peramban. Pilih tujuan{" "}
              <span className="font-semibold">Save as PDF</span>.
            </p>
            <div className="ml-auto flex gap-2">
              <TombolSekunder type="button" onClick={() => window.print()}>
                Cetak
              </TombolSekunder>
              <TombolUtama type="button" onClick={() => window.print()}>
                Unduh PDF
              </TombolUtama>
            </div>
          </div>
        </div>
      )}

      <p className="tanpa-cetak mt-6 text-xs text-fg-subtle">
        Anda hanya dapat melihat rapor anak Anda sendiri.{" "}
        <Link to="/ortu" className="underline">
          Kembali ke dashboard
        </Link>
      </p>
    </>
  );
}
