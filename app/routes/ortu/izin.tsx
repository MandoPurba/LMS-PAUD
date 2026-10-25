import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/izin";
import {
  Field,
  Input,
  Select,
  TombolSekunder,
  TombolUtama,
} from "../../components/form";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { JudulHalaman, Panel } from "../../components/ui";
import type { Izin, JenisIzin } from "../../data/types";
import {
  LABEL_JENIS,
  LABEL_STATUS_IZIN,
  MAKS_HARI_KE_DEPAN,
  WARNA_STATUS_IZIN,
  ajukanIzin,
  izinBentrok,
  izinOrtu,
} from "../../lib/izin";
import { anakDariOrtu } from "../../lib/relasi";
import { ambilSesi } from "../../lib/session";
import { tanggalLokal, tanggalPanjang, tanggalPendek } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Ajukan Izin — LMS TK/PAUD" }];
}

export function clientLoader() {
  const sesi = ambilSesi();
  const anak = sesi ? anakDariOrtu(sesi.id) : [];
  const namaAnak = new Map(anak.map((a) => [a.id, a.nama]));

  const batas = new Date();
  batas.setDate(batas.getDate() + MAKS_HARI_KE_DEPAN);

  return {
    anak: anak.map((a) => ({ id: a.id, nama: a.nama })),
    maksTanggal: tanggalLokal(batas),
    riwayat: sesi
      ? izinOrtu(sesi.id).map((i) => ({ ...i, namaAnak: namaAnak.get(i.siswaId) ?? "—" }))
      : [],
  };
}

export default function OrtuIzin({ loaderData }: Route.ComponentProps) {
  const { anak, maksTanggal, riwayat } = loaderData;
  const { revalidate } = useRevalidator();
  const { tampilkan } = useToast();
  const sesi = ambilSesi();

  const [terbuka, setTerbuka] = useState(false);
  const [draf, setDraf] = useState({
    siswaId: anak[0]?.id ?? "",
    tanggal: tanggalLokal(),
    jenis: "izin" as JenisIzin,
    alasan: "",
  });
  /** Ditampilkan di dalam modal form, bukan di body halaman. */
  const [galatForm, setGalatForm] = useState<string | null>(null);
  /** Pengajuan yang sudah ada pada tanggal yang diminta. */
  const [bentrok, setBentrok] = useState<{ izin: Izin; namaAnak: string } | null>(null);

  function buka() {
    setDraf({
      siswaId: anak[0]?.id ?? "",
      tanggal: tanggalLokal(),
      jenis: "izin",
      alasan: "",
    });
    setGalatForm(null);
    setTerbuka(true);
  }

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!sesi) return;

    // Tanggal yang sudah punya pengajuan ditampilkan sebagai popup tersendiri,
    // karena ini bukan salah ketik melainkan bentrok dengan data yang ada.
    const sudahAda = izinBentrok(draf.siswaId, draf.tanggal);
    if (sudahAda) {
      setTerbuka(false);
      setGalatForm(null);
      setBentrok({
        izin: sudahAda,
        namaAnak: anak.find((a) => a.id === draf.siswaId)?.nama ?? "—",
      });
      return;
    }

    try {
      ajukanIzin({ ...draf, diajukanOleh: sesi.id });
      setTerbuka(false);
      setGalatForm(null);
      tampilkan("Pengajuan terkirim. Guru kelas akan memverifikasinya.");
      revalidate();
    } catch (err) {
      // Modal tetap terbuka, jadi pesannya harus tampil DI DALAM modal.
      setGalatForm(err instanceof Error ? err.message : "Pengajuan gagal dikirim.");
    }
  }

  /** Buka kembali form dari popup bentrok, dengan tanggal dibersihkan. */
  function gantiTanggal() {
    setDraf({ ...draf, tanggal: "" });
    setBentrok(null);
    setGalatForm(null);
    setTerbuka(true);
  }

  if (anak.length === 0) {
    return (
      <>
        <JudulHalaman judul="Ajukan Izin" />
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
      <JudulHalaman
        judul="Ajukan Izin"
        deskripsi="Ajukan izin atau sakit untuk anak Anda. Guru kelas akan menyetujui atau menolaknya."
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface-raised p-4 shadow-card">
          <p className="text-sm text-fg-muted">
            {riwayat.filter((i) => i.status === "pending").length} pengajuan menunggu persetujuan
          </p>
          <div className="ml-auto">
            <TombolUtama type="button" onClick={buka}>
              + Ajukan Izin
            </TombolUtama>
          </div>
        </div>

        <Panel judul="Riwayat pengajuan">
          {riwayat.length === 0 ? (
            <p className="text-sm text-fg-muted">Belum ada pengajuan.</p>
          ) : (
            <ul className="divide-y divide-border">
              {riwayat.map((i) => (
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
                    <p className="mt-0.5 text-xs text-fg-subtle">
                      Diajukan {tanggalPendek(i.tglPengajuan)}
                    </p>
                    {i.status === "ditolak" && i.catatanVerifikasi && (
                      <p className="mt-1 rounded-field bg-danger-soft px-2 py-1 text-xs text-danger">
                        Catatan guru: {i.catatanVerifikasi}
                      </p>
                    )}
                    {i.status === "disetujui" && (
                      <p className="mt-1 text-xs text-success">
                        Absensi tanggal ini otomatis tercatat sebagai{" "}
                        {LABEL_JENIS[i.jenis]}.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Modal judul="Ajukan Izin" terbuka={terbuka} onTutup={() => setTerbuka(false)}>
        <form onSubmit={kirim} className="space-y-4" noValidate>
          {anak.length > 1 && (
            <Field label="Anak" htmlFor="siswaId">
              <Select
                id="siswaId"
                value={draf.siswaId}
                onChange={(e) => setDraf({ ...draf, siswaId: e.target.value })}
              >
                {anak.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nama}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field
            label="Tanggal tidak masuk"
            htmlFor="tanggal"
            petunjuk={`Boleh untuk hari mendatang, maksimal ${MAKS_HARI_KE_DEPAN} hari dari sekarang.`}
          >
            <Input
              id="tanggal"
              type="date"
              value={draf.tanggal}
              max={maksTanggal}
              onChange={(e) => setDraf({ ...draf, tanggal: e.target.value })}
            />
          </Field>

          <Field label="Jenis" htmlFor="jenis">
            <Select
              id="jenis"
              value={draf.jenis}
              onChange={(e) => setDraf({ ...draf, jenis: e.target.value as JenisIzin })}
            >
              <option value="izin">Izin — keperluan keluarga, acara, dan sebagainya</option>
              <option value="sakit">Sakit</option>
            </Select>
          </Field>

          <Field label="Alasan" htmlFor="alasan">
            <textarea
              id="alasan"
              rows={3}
              value={draf.alasan}
              onChange={(e) => setDraf({ ...draf, alasan: e.target.value })}
              placeholder="Mis. demam sejak semalam, sudah diperiksa dokter"
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
            />
          </Field>

          {galatForm && (
            <p
              role="alert"
              className="rounded-field bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
            >
              {galatForm}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setTerbuka(false)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="submit">Kirim Pengajuan</TombolUtama>
          </div>
        </form>
      </Modal>

      <Modal
        judul="Tanggal ini sudah diajukan"
        terbuka={bentrok !== null}
        onTutup={() => setBentrok(null)}
      >
        {bentrok && (
          <>
            <p className="text-sm text-fg-muted">
              Sudah ada pengajuan untuk{" "}
              <span className="font-semibold text-fg">{bentrok.namaAnak}</span> pada{" "}
              <span className="font-semibold text-fg">{tanggalPanjang(bentrok.izin.tanggal)}</span>
              , jadi pengajuan baru tidak dikirim.
            </p>

            <div className="mt-3 rounded-field bg-surface-sunken px-3 py-3">
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${WARNA_STATUS_IZIN[bentrok.izin.status]}`}
                >
                  {LABEL_STATUS_IZIN[bentrok.izin.status]}
                </span>
                <span className="font-medium">{LABEL_JENIS[bentrok.izin.jenis]}</span>
              </p>
              <p className="mt-1.5 text-sm text-fg-muted">{bentrok.izin.alasan}</p>
              <p className="mt-1 text-xs text-fg-subtle">
                Diajukan {tanggalPendek(bentrok.izin.tglPengajuan)}
              </p>
            </div>

            <p className="mt-3 text-sm text-fg-muted">
              {bentrok.izin.status === "pending"
                ? "Pengajuan tersebut masih menunggu persetujuan guru kelas. Tunggu hasilnya, atau ajukan untuk tanggal lain."
                : "Pengajuan tersebut sudah disetujui guru kelas. Bila tanggalnya keliru, hubungi guru kelas."}
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <TombolSekunder type="button" onClick={() => setBentrok(null)}>
                Tutup
              </TombolSekunder>
              <TombolUtama type="button" onClick={gantiTanggal}>
                Ajukan tanggal lain
              </TombolUtama>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
