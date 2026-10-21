import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/daily-report";
import { Modal } from "../../components/Modal";
import { JudulHalaman, Panel } from "../../components/ui";
import type { DailyReport } from "../../data/types";
import { LABEL_MAKAN, LABEL_MOOD, LABEL_TIDUR, reportTerbitSiswa } from "../../lib/daily-report";
import { anakDariOrtu, namaKelas } from "../../lib/relasi";
import { ambilSesi } from "../../lib/session";
import { tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Daily Report — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const anak = sesi ? anakDariOrtu(sesi.id) : [];

  // Hanya anak milik akun ini yang boleh dipilih (NFR-04). ID asing diabaikan,
  // bukan ditolak dengan galat, supaya tautan lama tetap mendarat di anak pertama.
  const diminta = new URL(request.url).searchParams.get("anak");
  const terpilih = anak.find((a) => a.id === diminta) ?? anak[0] ?? null;

  return {
    anak: anak.map((a) => ({ id: a.id, nama: a.nama })),
    terpilih: terpilih
      ? {
          id: terpilih.id,
          nama: terpilih.nama,
          labelKelas: namaKelas(terpilih.kelasId),
          belumBerkelas: terpilih.kelasId === null,
        }
      : null,
    report: terpilih ? reportTerbitSiswa(terpilih.id) : [],
  };
}

function Butir({ ikon, label, nilai }: { ikon: string; label: string; nilai: string }) {
  return (
    <div className="rounded-field bg-surface-sunken px-3 py-2">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
        <span aria-hidden="true">{ikon}</span>
        {nilai}
      </p>
    </div>
  );
}

function KartuReport({
  report,
  namaAnak,
  onLihatFoto,
}: {
  report: DailyReport;
  namaAnak: string;
  onLihatFoto: (foto: string, alt: string) => void;
}) {
  const makan = LABEL_MAKAN[report.makan];
  const tidur = LABEL_TIDUR[report.tidur];
  const mood = LABEL_MOOD[report.mood];

  return (
    <article className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
      <h3 className="text-base">{tanggalPanjang(report.tanggal)}</h3>

      <p className="mt-2 text-sm whitespace-pre-line">{report.kegiatan}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Butir ikon={makan.ikon} label="Makan" nilai={makan.label} />
        <Butir ikon={tidur.ikon} label="Tidur siang" nilai={tidur.label} />
        <Butir ikon={mood.ikon} label="Suasana hati" nilai={mood.label} />
      </div>

      {report.catatan && (
        <div className="mt-3 rounded-field bg-info-soft px-3 py-2">
          <p className="text-xs font-semibold text-info">Catatan dari guru</p>
          <p className="mt-0.5 text-sm whitespace-pre-line text-info">{report.catatan}</p>
        </div>
      )}

      {report.foto.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {report.foto.map((f, i) => (
            <li key={f.slice(-24)}>
              <button
                type="button"
                onClick={() => onLihatFoto(f, `Foto ${namaAnak} ${i + 1}`)}
                className="block w-full overflow-hidden rounded-field border border-border"
              >
                <img
                  src={f}
                  alt={`Foto kegiatan ${namaAnak} ${i + 1}`}
                  className="aspect-square w-full object-cover transition hover:opacity-90"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function OrtuDailyReport({ loaderData }: Route.ComponentProps) {
  const { anak, terpilih, report } = loaderData;
  const [, setParams] = useSearchParams();
  const [fotoBesar, setFotoBesar] = useState<{ src: string; alt: string } | null>(null);

  if (terpilih === null) {
    return (
      <>
        <JudulHalaman judul="Daily Report" />
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
        judul="Daily Report"
        deskripsi={
          terpilih.belumBerkelas
            ? `${terpilih.nama} belum ditempatkan di kelas.`
            : `${terpilih.nama} · ${terpilih.labelKelas}`
        }
      />

      {anak.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-fg-muted">Pilih anak</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {anak.map((a) => {
              const aktif = a.id === terpilih.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => setParams({ anak: a.id }, { preventScrollReset: true })}
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

      {report.length === 0 ? (
        <Panel judul="Belum ada daily report">
          <p className="text-sm text-fg-muted">
            Belum ada daily report terbit untuk {terpilih.nama}. Guru mengisinya pada hari anak
            masuk sekolah.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-fg-subtle">
            {report.length} daily report, terbaru di atas.
          </p>
          {report.map((r) => (
            <KartuReport
              key={r.id}
              report={r}
              namaAnak={terpilih.nama}
              onLihatFoto={(src, alt) => setFotoBesar({ src, alt })}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-fg-subtle">
        Anda hanya dapat melihat daily report anak Anda sendiri.{" "}
        <Link to="/ortu" className="underline">
          Kembali ke dashboard
        </Link>
      </p>

      <Modal
        judul={fotoBesar?.alt ?? ""}
        terbuka={fotoBesar !== null}
        onTutup={() => setFotoBesar(null)}
      >
        {fotoBesar && (
          <img
            src={fotoBesar.src}
            alt={fotoBesar.alt}
            className="w-full rounded-field object-contain"
          />
        )}
      </Modal>
    </>
  );
}
