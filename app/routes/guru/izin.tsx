import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/izin";
import { Field, PesanGagal, TombolBahaya, TombolSekunder, TombolUtama } from "../../components/form";
import { Modal } from "../../components/Modal";
import { JudulHalaman, Panel } from "../../components/ui";
import type { Izin } from "../../data/types";
import { LABEL_STATUS, WARNA_STATUS, absensiSiswa } from "../../lib/absensi";
import { reportSiswa } from "../../lib/daily-report";
import {
  LABEL_JENIS,
  LABEL_STATUS_IZIN,
  WARNA_STATUS_IZIN,
  izinKelas,
  setujuiIzin,
  tolakIzin,
} from "../../lib/izin";
import { kelasDariGuru, siswaDariKelas } from "../../lib/relasi";
import { ambilSesi } from "../../lib/session";
import { tanggalPendek } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Pengajuan Izin — LMS TK/PAUD" }];
}

export function clientLoader() {
  const sesi = ambilSesi();
  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;
  if (!kelas) return { kelas: null, daftar: [] };

  const namaSiswa = new Map(siswaDariKelas(kelas.id).map((s) => [s.id, s.nama]));

  return {
    kelas,
    daftar: izinKelas(kelas.id).map((i) => {
      const report = reportSiswa(i.siswaId, i.tanggal);
      return {
        ...i,
        namaAnak: namaSiswa.get(i.siswaId) ?? "—",
        absensiSaatIni: absensiSiswa(i.siswaId, i.tanggal)?.status ?? null,
        adaReportTerbit: report?.status === "published",
      };
    }),
  };
}

export default function GuruIzin({ loaderData }: Route.ComponentProps) {
  const { kelas, daftar } = loaderData;
  const { revalidate } = useRevalidator();
  const sesi = ambilSesi();

  type Target = (typeof daftar)[number];
  const [setuju, setSetuju] = useState<Target | null>(null);
  const [tolak, setTolak] = useState<Target | null>(null);
  const [catatan, setCatatan] = useState("");
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  function jalankanSetuju() {
    if (!setuju || !sesi) return;
    try {
      const hasil = setujuiIzin(setuju.id, sesi.id);
      setPesanSukses(
        hasil?.reportDitarik
          ? `Izin disetujui. Absensi ${tanggalPendek(setuju.tanggal)} menjadi ${LABEL_JENIS[setuju.jenis]}, dan daily report tanggal itu dikembalikan ke draft.`
          : `Izin disetujui. Absensi ${tanggalPendek(setuju.tanggal)} otomatis menjadi ${LABEL_JENIS[setuju.jenis]}.`,
      );
      setSetuju(null);
      revalidate();
    } catch {
      setPesanGagal("Gagal menyetujui pengajuan.");
      setSetuju(null);
    }
  }

  function jalankanTolak() {
    if (!tolak || !sesi) return;
    try {
      tolakIzin(tolak.id, sesi.id, catatan);
      setPesanSukses("Pengajuan ditolak. Absensi tidak diubah.");
      setTolak(null);
      setCatatan("");
      revalidate();
    } catch {
      setPesanGagal("Gagal menolak pengajuan.");
      setTolak(null);
    }
  }

  if (kelas === null) {
    return (
      <>
        <JudulHalaman judul="Pengajuan Izin" />
        <Panel judul="Kelas belum ditetapkan">
          <p className="text-sm text-fg-muted">
            Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif.
          </p>
        </Panel>
      </>
    );
  }

  const pending = daftar.filter((i) => i.status === "pending");

  return (
    <>
      <JudulHalaman
        judul="Pengajuan Izin"
        deskripsi={`${kelas.nama} · menyetujui pengajuan akan langsung mengubah absensi tanggal tersebut`}
      />
      <PesanGagal pesan={pesanGagal} />

      {pesanSukses && (
        <p
          role="status"
          className="mb-4 rounded-field bg-success-soft px-3 py-2 text-sm font-medium text-success"
        >
          ✓ {pesanSukses}
        </p>
      )}

      <div className="space-y-4">
        <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card">
          <p className="text-sm text-fg-muted">
            {pending.length === 0
              ? "Tidak ada pengajuan yang menunggu."
              : `${pending.length} pengajuan menunggu persetujuan Anda.`}
          </p>
        </div>

        <Panel judul="Daftar pengajuan">
          {daftar.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Belum ada pengajuan izin dari orang tua di kelas ini.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {daftar.map((i) => (
                <li key={i.id} className="flex flex-wrap items-start gap-3 py-3">
                  <span
                    className={`rounded-pill px-2 py-1 text-xs font-semibold ${WARNA_STATUS_IZIN[i.status]}`}
                  >
                    {LABEL_STATUS_IZIN[i.status]}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {i.namaAnak} · {LABEL_JENIS[i.jenis]} · {tanggalPendek(i.tanggal)}
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">{i.alasan}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
                      Diajukan {tanggalPendek(i.tglPengajuan)} · Absensi saat ini:
                      {i.absensiSaatIni === null ? (
                        <span>belum dicatat</span>
                      ) : (
                        <span
                          className={`rounded-pill px-1.5 py-0.5 font-semibold ${WARNA_STATUS[i.absensiSaatIni].lembut}`}
                        >
                          {i.absensiSaatIni} {LABEL_STATUS[i.absensiSaatIni]}
                        </span>
                      )}
                    </p>
                    {i.status === "ditolak" && i.catatanVerifikasi && (
                      <p className="mt-1 text-xs text-fg-muted italic">
                        Catatan Anda: {i.catatanVerifikasi}
                      </p>
                    )}
                  </div>

                  {i.status === "pending" && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSetuju(i)}
                        className="rounded-field px-2 py-1 text-xs font-semibold text-success transition hover:bg-success-soft"
                      >
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCatatan("");
                          setTolak(i);
                        }}
                        className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Modal judul="Setujui pengajuan?" terbuka={setuju !== null} onTutup={() => setSetuju(null)}>
        {setuju && (
          <>
            <p className="text-sm text-fg-muted">
              Absensi <span className="font-semibold text-fg">{setuju.namaAnak}</span> pada{" "}
              {tanggalPendek(setuju.tanggal)} akan otomatis tercatat sebagai{" "}
              <span className="font-semibold text-fg">{LABEL_JENIS[setuju.jenis]}</span>.
            </p>

            {setuju.absensiSaatIni !== null && setuju.absensiSaatIni !== "I" && setuju.absensiSaatIni !== "S" && (
              <p className="mt-3 rounded-field bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
                Absensi tanggal itu saat ini {LABEL_STATUS[setuju.absensiSaatIni]} dan akan ditimpa.
              </p>
            )}

            {setuju.adaReportTerbit && (
              <p className="mt-2 rounded-field bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
                Tanggal itu sudah punya daily report terbit. Karena anak menjadi tidak hadir,
                report tersebut akan dikembalikan ke draft dan tidak lagi terlihat orang tua.
                Datanya tidak dihapus.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <TombolSekunder type="button" onClick={() => setSetuju(null)}>
                Batal
              </TombolSekunder>
              <TombolUtama type="button" onClick={jalankanSetuju}>
                Ya, setujui
              </TombolUtama>
            </div>
          </>
        )}
      </Modal>

      <Modal judul="Tolak pengajuan?" terbuka={tolak !== null} onTutup={() => setTolak(null)}>
        {tolak && (
          <>
            <p className="text-sm text-fg-muted">
              Pengajuan {LABEL_JENIS[tolak.jenis]} untuk{" "}
              <span className="font-semibold text-fg">{tolak.namaAnak}</span> pada{" "}
              {tanggalPendek(tolak.tanggal)} akan ditolak. Absensi tidak diubah.
            </p>

            <div className="mt-4">
              <Field label="Catatan untuk orang tua" htmlFor="catatan" petunjuk="Opsional.">
                <textarea
                  id="catatan"
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <TombolSekunder type="button" onClick={() => setTolak(null)}>
                Batal
              </TombolSekunder>
              <TombolBahaya type="button" onClick={jalankanTolak}>
                Ya, tolak
              </TombolBahaya>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
