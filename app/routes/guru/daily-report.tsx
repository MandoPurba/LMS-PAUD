import { useState } from "react";
import { Link, useRevalidator, useSearchParams } from "react-router";

import type { Route } from "./+types/daily-report";
import {
  Field,
  PesanGagal,
  TombolSekunder,
  TombolUtama,
} from "../../components/form";
import { Modal } from "../../components/Modal";
import { PilihIkon } from "../../components/PilihIkon";
import { useToast } from "../../components/Toast";
import { JudulHalaman, Panel } from "../../components/ui";
import type { DailyReport, Mood, PorsiMakan, Siswa, TidurSiang } from "../../data/types";
import { LABEL_STATUS, WARNA_STATUS, absensiSiswa } from "../../lib/absensi";
import {
  MAKAN,
  MOOD,
  TIDUR,
  alasanTidakBolehIsi,
  reportSiswa,
  simpanReport,
  validasiReport,
} from "../../lib/daily-report";
import { MAKS_FOTO, byteDataUrl, formatByte, kompresFoto } from "../../lib/foto";
import { kelasDariGuru, siswaDariKelas, tahunAktif } from "../../lib/relasi";
import { GagalSimpan } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { perkiraanPemakaian } from "../../lib/storage";
import { tanggalLokal, tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Daily Report — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const maksTanggal = tanggalLokal();
  const diminta = new URL(request.url).searchParams.get("tanggal");
  const tanggal = diminta && diminta <= maksTanggal ? diminta : maksTanggal;

  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;
  const siswa = kelas ? siswaDariKelas(kelas.id) : [];

  return {
    tanggal,
    maksTanggal,
    kelas,
    tahun: tahunAktif() ?? null,
    pemakaian: perkiraanPemakaian(),
    baris: siswa.map((s) => ({
      siswa: s,
      statusAbsensi: absensiSiswa(s.id, tanggal)?.status ?? null,
      report: reportSiswa(s.id, tanggal) ?? null,
      alasanTolak: alasanTidakBolehIsi(s.id, tanggal),
    })),
  };
}

type Draf = {
  kegiatan: string;
  makan: PorsiMakan;
  tidur: TidurSiang;
  mood: Mood;
  catatan: string;
  foto: string[];
};

const DRAF_KOSONG: Draf = {
  kegiatan: "",
  makan: "habis",
  tidur: "nyenyak",
  mood: "senang",
  catatan: "",
  foto: [],
};

function dariReport(r: DailyReport): Draf {
  return {
    kegiatan: r.kegiatan,
    makan: r.makan,
    tidur: r.tidur,
    mood: r.mood,
    catatan: r.catatan ?? "",
    foto: r.foto,
  };
}

export default function GuruDailyReport({ loaderData }: Route.ComponentProps) {
  const { tanggal, maksTanggal, kelas, tahun, baris, pemakaian } = loaderData;
  const [, setParams] = useSearchParams();
  const { revalidate } = useRevalidator();
  const { tampilkan } = useToast();
  const sesi = ambilSesi();

  const [form, setForm] = useState<{ siswa: Siswa; report: DailyReport | null } | null>(null);
  const [draf, setDraf] = useState<Draf>(DRAF_KOSONG);
  const [galatKegiatan, setGalatKegiatan] = useState<string | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [sedangKompres, setSedangKompres] = useState(false);
  const [infoFoto, setInfoFoto] = useState<string | null>(null);

  const jumlahHadir = baris.filter((b) => b.statusAbsensi === "H").length;
  const sudahDiisi = baris.filter((b) => b.report !== null).length;

  function buka(b: (typeof baris)[number]) {
    setDraf(b.report ? dariReport(b.report) : DRAF_KOSONG);
    setGalatKegiatan(null);
    setPesanGagal(null);
    setInfoFoto(null);
    setForm({ siswa: b.siswa, report: b.report });
  }

  async function tambahFoto(berkas: FileList | null) {
    if (!berkas || berkas.length === 0) return;

    const sisa = MAKS_FOTO - draf.foto.length;
    if (sisa <= 0) {
      setInfoFoto(`Maksimal ${MAKS_FOTO} foto per report.`);
      return;
    }

    setSedangKompres(true);
    setInfoFoto(null);
    try {
      const terpilih = Array.from(berkas).slice(0, sisa);
      const hasil = await Promise.all(terpilih.map(kompresFoto));
      setDraf((d) => ({ ...d, foto: [...d.foto, ...hasil.map((h) => h.dataUrl)] }));
      setInfoFoto(
        hasil
          .map((h) => `${formatByte(h.byteAsli)} → ${formatByte(h.byteAkhir)}`)
          .join(" · ") + " (dikompres otomatis)",
      );
    } catch (err) {
      setInfoFoto(err instanceof Error ? err.message : "Foto gagal diproses.");
    } finally {
      setSedangKompres(false);
    }
  }

  function simpan(status: "draft" | "published") {
    if (!form) return;

    const galat = validasiReport(draf.kegiatan);
    setGalatKegiatan(galat);
    if (galat) return;

    try {
      simpanReport({
        siswaId: form.siswa.id,
        tanggal,
        kegiatan: draf.kegiatan.trim(),
        makan: draf.makan,
        tidur: draf.tidur,
        mood: draf.mood,
        catatan: draf.catatan.trim() === "" ? null : draf.catatan.trim(),
        foto: draf.foto,
        status,
        dibuatOleh: sesi?.id ?? "",
      });
      setForm(null);
      tampilkan(
        status === "published"
          ? `Daily report ${form.siswa.nama} terbit. Orang tua sudah dapat membacanya.`
          : `Daily report ${form.siswa.nama} disimpan sebagai draft.`,
      );
      revalidate();
    } catch (err) {
      setPesanGagal(
        err instanceof GagalSimpan
          ? "Penyimpanan browser penuh. Hapus sebagian foto atau reset data demo."
          : "Daily report gagal disimpan.",
      );
    }
  }

  return (
    <>
      <JudulHalaman
        judul="Daily Report"
        deskripsi={
          kelas
            ? `${kelas.nama}${tahun ? ` · ${tahun.nama} Semester ${tahun.semesterAktif}` : ""}`
            : "Belum ada kelas yang Anda ampu."
        }
      />
      <PesanGagal pesan={pesanGagal} />

      {kelas === null ? (
        <Panel judul="Kelas belum ditetapkan">
          <p className="text-sm text-fg-muted">
            Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif. Admin
            menetapkannya di menu Kelas.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-surface-raised p-4 shadow-card">
            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium">
                Tanggal
              </label>
              <input
                id="tanggal"
                type="date"
                value={tanggal}
                max={maksTanggal}
                onChange={(e) =>
                  setParams(e.target.value ? { tanggal: e.target.value } : {}, {
                    preventScrollReset: true,
                  })
                }
                className="mt-1 rounded-field border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg-muted">{tanggalPanjang(tanggal)}</p>
              <p className="text-xs text-fg-subtle">
                {sudahDiisi} dari {jumlahHadir} anak hadir sudah diisi
              </p>
            </div>

            <p className="text-xs text-fg-subtle">
              Penyimpanan demo: {pemakaian.persen}% terpakai
            </p>
          </div>

          {baris.length === 0 ? (
            <Panel judul="Kelas masih kosong">
              <p className="text-sm text-fg-muted">
                Belum ada siswa di {kelas.nama}. Admin menempatkan siswa di menu Data Siswa.
              </p>
            </Panel>
          ) : (
            <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
              <ul className="divide-y divide-border">
                {baris.map((b) => (
                  <li key={b.siswa.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{b.siswa.nama}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                        {b.statusAbsensi === null ? (
                          <span className="text-warning">belum diabsen</span>
                        ) : (
                          <span
                            className={`rounded-pill px-1.5 py-0.5 font-semibold ${WARNA_STATUS[b.statusAbsensi].lembut}`}
                          >
                            {b.statusAbsensi} {LABEL_STATUS[b.statusAbsensi]}
                          </span>
                        )}

                        {b.report && (
                          <span
                            className={`rounded-pill px-1.5 py-0.5 font-semibold ${
                              b.report.status === "published"
                                ? "bg-success-soft text-success"
                                : "bg-surface-sunken text-fg-subtle"
                            }`}
                          >
                            {b.report.status === "published" ? "Terbit" : "Draft"}
                          </span>
                        )}

                        {b.report && b.report.foto.length > 0 && (
                          <span className="text-fg-subtle">{b.report.foto.length} foto</span>
                        )}
                      </p>
                    </div>

                    {b.alasanTolak !== null ? (
                      <p className="max-w-xs text-right text-xs text-fg-subtle">
                        {b.alasanTolak}
                        {b.statusAbsensi === null && (
                          <>
                            {" "}
                            <Link to={`/guru/absensi?tanggal=${tanggal}`} className="underline">
                              Ke Absensi
                            </Link>
                          </>
                        )}
                      </p>
                    ) : (
                      <TombolSekunder type="button" onClick={() => buka(b)}>
                        {b.report ? "Ubah" : "Isi"}
                      </TombolSekunder>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal
        judul={form ? `Daily Report — ${form.siswa.nama}` : ""}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <div className="space-y-4">
          <p className="text-xs text-fg-subtle">{tanggalPanjang(tanggal)}</p>

          <Field label="Kegiatan hari ini" htmlFor="kegiatan" error={galatKegiatan ?? undefined}>
            <textarea
              id="kegiatan"
              rows={3}
              value={draf.kegiatan}
              onChange={(e) => setDraf({ ...draf, kegiatan: e.target.value })}
              placeholder="Mis. bermain balok, mewarnai gambar buah, bernyanyi bersama"
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
            />
          </Field>

          <PilihIkon
            label="Makan"
            pilihan={MAKAN}
            nilai={draf.makan}
            onPilih={(v) => setDraf({ ...draf, makan: v })}
          />
          <PilihIkon
            label="Tidur siang"
            pilihan={TIDUR}
            nilai={draf.tidur}
            onPilih={(v) => setDraf({ ...draf, tidur: v })}
          />
          <PilihIkon
            label="Suasana hati"
            pilihan={MOOD}
            nilai={draf.mood}
            onPilih={(v) => setDraf({ ...draf, mood: v })}
          />

          <Field label="Catatan untuk orang tua" htmlFor="catatan" petunjuk="Opsional.">
            <textarea
              id="catatan"
              rows={2}
              value={draf.catatan}
              onChange={(e) => setDraf({ ...draf, catatan: e.target.value })}
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
            />
          </Field>

          <div>
            <p className="text-sm font-medium">Foto</p>
            <p className="text-xs text-fg-subtle">
              Maksimal {MAKS_FOTO} foto, dikompres otomatis sebelum disimpan.
            </p>

            {draf.foto.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {draf.foto.map((f, i) => (
                  <li key={f.slice(-24)} className="relative">
                    <img
                      src={f}
                      alt={`Foto ${i + 1}`}
                      className="size-20 rounded-field border border-border object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Hapus foto ${i + 1}`}
                      onClick={() =>
                        setDraf({ ...draf, foto: draf.foto.filter((_, j) => j !== i) })
                      }
                      className="absolute -right-1.5 -top-1.5 rounded-pill bg-danger px-1.5 text-xs font-bold text-fg-on-strong"
                    >
                      ✕
                    </button>
                    <p className="mt-0.5 text-center text-[10px] text-fg-subtle">
                      {formatByte(byteDataUrl(f))}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {draf.foto.length < MAKS_FOTO && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={sedangKompres}
                onChange={(e) => {
                  void tambahFoto(e.target.files);
                  e.target.value = "";
                }}
                className="mt-2 block w-full text-sm text-fg-muted"
              />
            )}

            {sedangKompres && <p className="mt-1 text-xs text-fg-muted">Mengompres foto…</p>}
            {infoFoto && <p className="mt-1 text-xs text-fg-subtle">{infoFoto}</p>}
          </div>

          {form?.report?.status === "published" && (
            <p className="rounded-field bg-info-soft px-3 py-2 text-xs text-info">
              Report ini sudah terbit dan terlihat oleh orang tua. Perubahan akan langsung
              tampil di sisi mereka.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(null)}>
              Batal
            </TombolSekunder>
            <TombolSekunder type="button" onClick={() => simpan("draft")}>
              Simpan Draft
            </TombolSekunder>
            <TombolUtama type="button" onClick={() => simpan("published")}>
              Terbitkan
            </TombolUtama>
          </div>
        </div>
      </Modal>
    </>
  );
}
