import { useState } from "react";
import { Link, useRevalidator, useSearchParams } from "react-router";

import type { Route } from "./+types/rapor";
import {
  Field,
  PesanGagal,
  Select,
  TombolSekunder,
  TombolUtama,
} from "../../components/form";
import { Modal } from "../../components/Modal";
import { JudulHalaman, Panel } from "../../components/ui";
import type { CapaianRapor } from "../../data/types";
import {
  alasanTidakBisaSusun,
  perbaruiDariObservasi,
  raporSiswa,
  simpanRapor,
  susunDraft,
  tarikKeDraft,
  terbitkanRapor,
} from "../../lib/rapor";
import { kelasDariGuru, periodeAktif, siswaDariKelas, tahunAktif } from "../../lib/relasi";
import { ambilSesi } from "../../lib/session";
import { LABEL_CAPAIAN, WARNA_CAPAIAN, labelAspek, periodeTersedia } from "../../lib/stppa";
import { labelPeriode, periodeAkademik, tanggalLokal, tanggalPendek } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Rapor — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const params = new URL(request.url).searchParams;

  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;
  const siswa = kelas ? siswaDariKelas(kelas.id) : [];
  const terpilih = siswa.find((s) => s.id === params.get("anak")) ?? siswa[0] ?? null;

  const tahun = tahunAktif() ?? null;
  const periodeAwal = periodeAktif() ?? periodeAkademik(tanggalLokal());

  const daftarPeriode = terpilih ? periodeTersedia(terpilih.id) : [];
  if (!daftarPeriode.some((p) => labelPeriode(p) === labelPeriode(periodeAwal))) {
    daftarPeriode.unshift(periodeAwal);
  }
  const periode =
    daftarPeriode.find((p) => labelPeriode(p) === params.get("periode")) ?? periodeAwal;

  return {
    kelas,
    siswa: siswa.map((s) => ({ id: s.id, nama: s.nama })),
    terpilih: terpilih ? { id: terpilih.id, nama: terpilih.nama } : null,
    periode,
    daftarPeriode,
    rapor: terpilih ? (raporSiswa(terpilih.id, periode) ?? null) : null,
    alasanTolak: terpilih ? alasanTidakBisaSusun(terpilih.id, periode) : null,
  };
}

export default function GuruRapor({ loaderData }: Route.ComponentProps) {
  const { kelas, siswa, terpilih, periode, daftarPeriode, rapor, alasanTolak } = loaderData;
  const [params, setParams] = useSearchParams();
  const { revalidate } = useRevalidator();
  const sesi = ambilSesi();

  const [draf, setDraf] = useState<{
    id: string;
    capaian: CapaianRapor[];
    catatanUmum: string;
  } | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [konfirmasiTerbit, setKonfirmasiTerbit] = useState(false);

  function gantiParam(kunci: string, nilai: string) {
    const baru = new URLSearchParams(params);
    baru.set(kunci, nilai);
    if (kunci === "anak") baru.delete("periode");
    setParams(baru, { preventScrollReset: true });
    setDraf(null);
  }

  function mulaiSunting() {
    if (!rapor) return;
    setDraf({
      id: rapor.id,
      capaian: rapor.capaian.map((c) => ({ ...c })),
      catatanUmum: rapor.catatanUmum ?? "",
    });
  }

  function susun() {
    if (!terpilih) return;
    try {
      susunDraft(terpilih.id, periode, sesi?.id ?? "");
      setPesanGagal(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof Error ? err.message : "Draft rapor gagal disusun.");
    }
  }

  function perbarui() {
    if (!rapor) return;
    try {
      perbaruiDariObservasi(rapor.id);
      setDraf(null);
      revalidate();
    } catch {
      setPesanGagal("Gagal memperbarui dari observasi.");
    }
  }

  function simpan() {
    if (!draf) return;
    try {
      simpanRapor(draf.id, {
        capaian: draf.capaian,
        catatanUmum: draf.catatanUmum.trim() === "" ? null : draf.catatanUmum.trim(),
      });
      setDraf(null);
      revalidate();
    } catch {
      setPesanGagal("Rapor gagal disimpan.");
    }
  }

  function terbitkan() {
    if (!rapor) return;
    try {
      terbitkanRapor(rapor.id);
      setKonfirmasiTerbit(false);
      setDraf(null);
      revalidate();
    } catch {
      setPesanGagal("Rapor gagal diterbitkan.");
      setKonfirmasiTerbit(false);
    }
  }

  function kembalikanKeDraft() {
    if (!rapor) return;
    try {
      tarikKeDraft(rapor.id);
      revalidate();
    } catch {
      setPesanGagal("Gagal menarik rapor ke draft.");
    }
  }

  if (kelas === null) {
    return (
      <>
        <JudulHalaman judul="Rapor" />
        <Panel judul="Kelas belum ditetapkan">
          <p className="text-sm text-fg-muted">
            Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif.
          </p>
        </Panel>
      </>
    );
  }

  if (terpilih === null) {
    return (
      <>
        <JudulHalaman judul="Rapor" deskripsi={kelas.nama} />
        <Panel judul="Kelas masih kosong">
          <p className="text-sm text-fg-muted">Belum ada siswa di {kelas.nama}.</p>
        </Panel>
      </>
    );
  }

  const terbit = rapor?.status === "published";
  const sedangSunting = draf !== null && !terbit;
  const tampil = sedangSunting ? draf.capaian : (rapor?.capaian ?? []);

  return (
    <>
      <JudulHalaman
        judul="Rapor Semester"
        deskripsi="Draft disusun otomatis dari observasi STPPA, lalu dilengkapi narasi oleh guru."
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-surface-raised p-4 shadow-card">
          <div className="min-w-40">
            <label htmlFor="anak" className="block text-sm font-medium">Anak</label>
            <Select id="anak" value={terpilih.id} onChange={(e) => gantiParam("anak", e.target.value)}>
              {siswa.map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </Select>
          </div>
          <div className="min-w-48">
            <label htmlFor="periode" className="block text-sm font-medium">Semester</label>
            <Select
              id="periode"
              value={labelPeriode(periode)}
              onChange={(e) => gantiParam("periode", e.target.value)}
            >
              {daftarPeriode.map((p) => (
                <option key={labelPeriode(p)} value={labelPeriode(p)}>{labelPeriode(p)}</option>
              ))}
            </Select>
          </div>
        </div>

        {rapor === null ? (
          <Panel judul="Belum ada rapor">
            {alasanTolak !== null ? (
              <>
                <p className="text-sm text-fg-muted">{alasanTolak}</p>
                <Link
                  to={`/guru/observasi?anak=${terpilih.id}`}
                  className="mt-3 inline-block text-sm font-semibold text-primary underline"
                >
                  Ke Observasi STPPA →
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-fg-muted">
                  Observasi {terpilih.nama} pada {labelPeriode(periode)} sudah tersedia. Draft
                  rapor akan disusun dari data tersebut.
                </p>
                <div className="mt-4">
                  <TombolUtama type="button" onClick={susun}>
                    Susun Draft Rapor
                  </TombolUtama>
                </div>
              </>
            )}
          </Panel>
        ) : (
          <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-base">
                  {terpilih.nama} · {labelPeriode(periode)}
                </h2>
                <p className="mt-0.5 text-xs text-fg-subtle">
                  {terbit
                    ? `Terbit ${rapor.tglPublikasi ? tanggalPendek(rapor.tglPublikasi) : ""} · hanya dapat dibaca`
                    : "Masih draft · belum terlihat oleh orang tua"}
                </p>
              </div>
              <span
                className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${
                  terbit ? "bg-success-soft text-success" : "bg-surface-sunken text-fg-subtle"
                }`}
              >
                {terbit ? "Terbit" : "Draft"}
              </span>
            </div>

            <ul className="divide-y divide-border">
              {tampil.map((c, i) => (
                <li key={c.aspek} className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-field px-2 py-1 text-xs font-bold ${WARNA_CAPAIAN[c.capaian]}`}
                      title={LABEL_CAPAIAN[c.capaian]}
                    >
                      {c.capaian}
                    </span>
                    <p className="min-w-0 flex-1 text-sm font-medium">{labelAspek(c.aspek)}</p>
                    <span className="text-xs text-fg-subtle">
                      {c.jumlahObservasi} observasi
                    </span>
                  </div>

                  {sedangSunting ? (
                    <textarea
                      aria-label={`Narasi ${labelAspek(c.aspek)}`}
                      rows={3}
                      value={c.narasi}
                      onChange={(e) => {
                        const baru = draf.capaian.map((x, j) =>
                          j === i ? { ...x, narasi: e.target.value } : x,
                        );
                        setDraf({ ...draf, capaian: baru });
                      }}
                      className="mt-2 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-fg-muted">{c.narasi}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-4">
              {sedangSunting ? (
                <Field label="Catatan umum" htmlFor="catatanUmum" petunjuk="Opsional.">
                  <textarea
                    id="catatanUmum"
                    rows={2}
                    value={draf.catatanUmum}
                    onChange={(e) => setDraf({ ...draf, catatanUmum: e.target.value })}
                    className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
                  />
                </Field>
              ) : (
                rapor.catatanUmum && (
                  <>
                    <p className="text-sm font-medium">Catatan umum</p>
                    <p className="mt-1 text-sm text-fg-muted">{rapor.catatanUmum}</p>
                  </>
                )
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {terbit ? (
                <TombolSekunder type="button" onClick={kembalikanKeDraft}>
                  Tarik kembali ke draft
                </TombolSekunder>
              ) : sedangSunting ? (
                <>
                  <TombolSekunder type="button" onClick={() => setDraf(null)}>
                    Batal
                  </TombolSekunder>
                  <TombolUtama type="button" onClick={simpan}>
                    Simpan Draft
                  </TombolUtama>
                </>
              ) : (
                <>
                  <TombolSekunder type="button" onClick={perbarui}>
                    Perbarui dari Observasi
                  </TombolSekunder>
                  <TombolSekunder type="button" onClick={mulaiSunting}>
                    Sunting Narasi
                  </TombolSekunder>
                  <TombolUtama type="button" onClick={() => setKonfirmasiTerbit(true)}>
                    Terbitkan
                  </TombolUtama>
                </>
              )}
            </div>

            {!terbit && !sedangSunting && (
              <p className="mt-3 text-xs text-fg-subtle">
                “Perbarui dari Observasi” menghitung ulang capaian dari data terbaru dan tidak
                menimpa narasi yang sudah Anda sunting.
              </p>
            )}
          </div>
        )}
      </div>

      <Modal
        judul="Terbitkan rapor?"
        terbuka={konfirmasiTerbit}
        onTutup={() => setKonfirmasiTerbit(false)}
      >
        <p className="text-sm text-fg-muted">
          Rapor {terpilih.nama} untuk {labelPeriode(periode)} akan terbit dan langsung dapat
          dilihat orang tua. Setelah terbit, rapor hanya dapat dibaca — untuk menyuntingnya lagi,
          tarik kembali ke draft terlebih dahulu.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <TombolSekunder type="button" onClick={() => setKonfirmasiTerbit(false)}>
            Batal
          </TombolSekunder>
          <TombolUtama type="button" onClick={terbitkan}>
            Ya, terbitkan
          </TombolUtama>
        </div>
      </Modal>
    </>
  );
}
