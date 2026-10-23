import { useState } from "react";
import { useRevalidator, useSearchParams } from "react-router";

import type { Route } from "./+types/observasi";
import {
  Field,
  PesanGagal,
  Select,
  TombolBahaya,
  TombolSekunder,
  TombolUtama,
} from "../../components/form";
import { Modal } from "../../components/Modal";
import { JudulHalaman, Panel } from "../../components/ui";
import type { AspekStppa, Capaian, Observasi } from "../../data/types";
import { kelasDariGuru, siswaDariKelas, tahunAktif } from "../../lib/relasi";
import { GagalSimpan, repoObservasi } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import {
  LABEL_CAPAIAN,
  MASTER,
  URUTAN_CAPAIAN,
  WARNA_CAPAIAN,
  capaianTerakhir,
  indikatorAspek,
  labelAspek,
  observasiSiswa,
  periodeTersedia,
  simpanObservasi,
  teksIndikator,
} from "../../lib/stppa";
import { labelPeriode, periodeAkademik, tanggalLokal, tanggalPendek } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Observasi STPPA — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const params = new URL(request.url).searchParams;

  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;
  const siswa = kelas ? siswaDariKelas(kelas.id) : [];

  // Hanya siswa di kelas yang diampu yang boleh dibuka (NFR-04).
  const terpilih = siswa.find((s) => s.id === params.get("anak")) ?? siswa[0] ?? null;
  const tahun = tahunAktif() ?? null;

  const periodeAktif = tahun
    ? { tahunAjaran: tahun.nama, semester: tahun.semesterAktif }
    : periodeAkademik(tanggalLokal());

  // Periode yang bisa dipilih: yang punya data, plus periode aktif sekarang.
  const daftarPeriode = terpilih ? periodeTersedia(terpilih.id) : [];
  if (!daftarPeriode.some((p) => labelPeriode(p) === labelPeriode(periodeAktif))) {
    daftarPeriode.unshift(periodeAktif);
  }

  const dimintaPeriode = params.get("periode");
  const periode =
    daftarPeriode.find((p) => labelPeriode(p) === dimintaPeriode) ?? periodeAktif;

  return {
    kelas,
    tahun,
    siswa: siswa.map((s) => ({ id: s.id, nama: s.nama })),
    terpilih: terpilih ? { id: terpilih.id, nama: terpilih.nama } : null,
    periode,
    daftarPeriode,
    riwayat: terpilih
      ? observasiSiswa(terpilih.id, periode).map((o) => ({
          ...o,
          teksIndikator: teksIndikator(o.indikatorId),
          labelAspek: labelAspek(o.aspek),
        }))
      : [],
    ringkasan: terpilih ? capaianTerakhir(terpilih.id, periode) : {},
  };
}

type Draf = {
  tanggal: string;
  aspek: AspekStppa;
  indikatorId: string;
  capaian: Capaian;
  catatan: string;
};

function drafBaru(): Draf {
  return {
    tanggal: tanggalLokal(),
    aspek: MASTER[0].aspek,
    indikatorId: MASTER[0].indikator[0].id,
    capaian: "BSH",
    catatan: "",
  };
}

export default function GuruObservasi({ loaderData }: Route.ComponentProps) {
  const { kelas, tahun, siswa, terpilih, periode, daftarPeriode, riwayat, ringkasan } = loaderData;
  const [params, setParams] = useSearchParams();
  const { revalidate } = useRevalidator();
  const sesi = ambilSesi();

  const [form, setForm] = useState<{ ubah: Observasi | null } | null>(null);
  const [draf, setDraf] = useState<Draf>(drafBaru);
  const [targetHapus, setTargetHapus] = useState<Observasi | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  function gantiParam(kunci: string, nilai: string) {
    const baru = new URLSearchParams(params);
    baru.set(kunci, nilai);
    if (kunci === "anak") baru.delete("periode");
    setParams(baru, { preventScrollReset: true });
  }

  function bukaCatat() {
    setDraf(drafBaru());
    setPesanGagal(null);
    setForm({ ubah: null });
  }

  function bukaUbah(o: Observasi) {
    setDraf({
      tanggal: o.tanggal,
      aspek: o.aspek,
      indikatorId: o.indikatorId,
      capaian: o.capaian,
      catatan: o.catatan ?? "",
    });
    setPesanGagal(null);
    setForm({ ubah: o });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!terpilih) return;

    try {
      simpanObservasi({
        siswaId: terpilih.id,
        tanggal: draf.tanggal,
        aspek: draf.aspek,
        indikatorId: draf.indikatorId,
        capaian: draf.capaian,
        catatan: draf.catatan.trim() === "" ? null : draf.catatan.trim(),
        dicatatOleh: sesi?.id ?? "",
      });
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Observasi gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoObservasi.hapus(targetHapus.id);
      setTargetHapus(null);
      revalidate();
    } catch {
      setPesanGagal("Observasi gagal dihapus.");
      setTargetHapus(null);
    }
  }

  if (kelas === null) {
    return (
      <>
        <JudulHalaman judul="Observasi STPPA" />
        <Panel judul="Kelas belum ditetapkan">
          <p className="text-sm text-fg-muted">
            Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif. Admin
            menetapkannya di menu Kelas.
          </p>
        </Panel>
      </>
    );
  }

  if (terpilih === null) {
    return (
      <>
        <JudulHalaman judul="Observasi STPPA" deskripsi={kelas.nama} />
        <Panel judul="Kelas masih kosong">
          <p className="text-sm text-fg-muted">
            Belum ada siswa di {kelas.nama}. Admin menempatkan siswa di menu Data Siswa.
          </p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <JudulHalaman
        judul="Observasi STPPA"
        deskripsi={`${kelas.nama}${tahun ? ` · ${tahun.nama} Semester ${tahun.semesterAktif}` : ""}`}
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-surface-raised p-4 shadow-card">
          <div className="min-w-40">
            <label htmlFor="anak" className="block text-sm font-medium">
              Anak
            </label>
            <Select id="anak" value={terpilih.id} onChange={(e) => gantiParam("anak", e.target.value)}>
              {siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-48">
            <label htmlFor="periode" className="block text-sm font-medium">
              Semester
            </label>
            <Select
              id="periode"
              value={labelPeriode(periode)}
              onChange={(e) => gantiParam("periode", e.target.value)}
            >
              {daftarPeriode.map((p) => (
                <option key={labelPeriode(p)} value={labelPeriode(p)}>
                  {labelPeriode(p)}
                </option>
              ))}
            </Select>
          </div>

          <div className="ml-auto">
            <TombolUtama type="button" onClick={bukaCatat}>
              + Catat Observasi
            </TombolUtama>
          </div>
        </div>

        <Panel judul="Capaian terakhir per aspek">
          <ul className="grid gap-2 sm:grid-cols-2">
            {MASTER.map((m) => {
              const r = ringkasan[m.aspek];
              return (
                <li
                  key={m.aspek}
                  className="flex items-center gap-3 rounded-field bg-surface-sunken px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">{m.label}</span>
                  {r ? (
                    <>
                      <span className="text-xs text-fg-subtle">{r.jumlah}×</span>
                      <span
                        className={`rounded-field px-2 py-1 text-xs font-bold ${WARNA_CAPAIAN[r.capaian]}`}
                        title={LABEL_CAPAIAN[r.capaian]}
                      >
                        {r.capaian}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-fg-subtle">belum ada</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-fg-subtle">
            Capaian yang diambil adalah observasi bertanggal paling baru pada tiap aspek. Ini yang
            akan menjadi dasar draft rapor di FR-11.
          </p>
        </Panel>

        <Panel judul={`Riwayat observasi — ${labelPeriode(periode)}`}>
          {riwayat.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Belum ada observasi untuk {terpilih.nama} pada semester ini.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {riwayat.map((o) => (
                <li key={o.id} className="flex flex-wrap items-start gap-3 py-3">
                  <span
                    className={`rounded-field px-2 py-1 text-xs font-bold ${WARNA_CAPAIAN[o.capaian]}`}
                    title={LABEL_CAPAIAN[o.capaian]}
                  >
                    {o.capaian}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{o.teksIndikator}</p>
                    <p className="mt-0.5 text-xs text-fg-subtle">
                      {o.labelAspek} · {tanggalPendek(o.tanggal)}
                    </p>
                    {o.catatan && (
                      <p className="mt-1 text-xs text-fg-muted italic">“{o.catatan}”</p>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => bukaUbah(o)}
                      className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetHapus(o)}
                      className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Modal
        judul={form?.ubah ? "Ubah Observasi" : `Catat Observasi — ${terpilih.nama}`}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4">
          <Field label="Tanggal observasi" htmlFor="tanggal">
            <input
              id="tanggal"
              type="date"
              value={draf.tanggal}
              max={tanggalLokal()}
              onChange={(e) => setDraf({ ...draf, tanggal: e.target.value })}
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Aspek perkembangan" htmlFor="aspek">
            <Select
              id="aspek"
              value={draf.aspek}
              onChange={(e) => {
                const aspek = e.target.value as AspekStppa;
                setDraf({ ...draf, aspek, indikatorId: indikatorAspek(aspek)[0]?.id ?? "" });
              }}
            >
              {MASTER.map((m) => (
                <option key={m.aspek} value={m.aspek}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Indikator" htmlFor="indikatorId">
            <Select
              id="indikatorId"
              value={draf.indikatorId}
              onChange={(e) => setDraf({ ...draf, indikatorId: e.target.value })}
            >
              {indikatorAspek(draf.aspek).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.teks}
                </option>
              ))}
            </Select>
          </Field>

          <fieldset>
            <legend className="text-sm font-medium">Capaian</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {URUTAN_CAPAIAN.map((c) => {
                const terpilihCapaian = draf.capaian === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={terpilihCapaian}
                    onClick={() => setDraf({ ...draf, capaian: c })}
                    className={`rounded-field px-2 py-2 text-xs font-bold transition ${
                      terpilihCapaian
                        ? `${WARNA_CAPAIAN[c]} ring-2 ring-primary`
                        : "border border-border text-fg-muted hover:bg-surface-hover"
                    }`}
                  >
                    {c}
                    <span className="mt-0.5 block text-[10px] font-medium opacity-90">
                      {LABEL_CAPAIAN[c]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Catatan" htmlFor="catatan" petunjuk="Opsional — contoh perilaku yang teramati.">
            <textarea
              id="catatan"
              rows={2}
              value={draf.catatan}
              onChange={(e) => setDraf({ ...draf, catatan: e.target.value })}
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
            />
          </Field>

          <p className="rounded-field bg-info-soft px-3 py-2 text-xs text-info">
            Satu indikator hanya punya satu catatan per tanggal. Mencatat ulang pada tanggal yang
            sama akan menimpa catatan sebelumnya.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(null)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="submit">Simpan</TombolUtama>
          </div>
        </form>
      </Modal>

      <Modal
        judul="Hapus observasi?"
        terbuka={targetHapus !== null}
        onTutup={() => setTargetHapus(null)}
      >
        <p className="text-sm text-fg-muted">
          Catatan <span className="font-semibold text-fg">{targetHapus?.capaian}</span> untuk
          indikator “{targetHapus ? teksIndikator(targetHapus.indikatorId) : ""}” pada{" "}
          {targetHapus ? tanggalPendek(targetHapus.tanggal) : ""} akan dihapus.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <TombolSekunder type="button" onClick={() => setTargetHapus(null)}>
            Batal
          </TombolSekunder>
          <TombolBahaya type="button" onClick={hapus}>
            Ya, hapus
          </TombolBahaya>
        </div>
      </Modal>
    </>
  );
}
