import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/galeri";
import { Modal } from "../../components/Modal";
import { JudulHalaman, Panel } from "../../components/ui";
import { galeriKelas } from "../../lib/galeri";
import { anakDariOrtu, namaKelas } from "../../lib/relasi";
import { ambilSesi } from "../../lib/session";
import { tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Galeri — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const anak = sesi ? anakDariOrtu(sesi.id) : [];

  // Hanya anak milik akun ini yang boleh dipilih (NFR-04), sama seperti Daily Report.
  const diminta = new URL(request.url).searchParams.get("anak");
  const terpilih = anak.find((a) => a.id === diminta) ?? anak[0] ?? null;

  return {
    anak: anak.map((a) => ({ id: a.id, nama: a.nama })),
    terpilih: terpilih
      ? {
          id: terpilih.id,
          nama: terpilih.nama,
          kelasId: terpilih.kelasId,
          labelKelas: namaKelas(terpilih.kelasId),
        }
      : null,
    galeri: terpilih?.kelasId ? galeriKelas(terpilih.kelasId) : [],
  };
}

export default function OrtuGaleri({ loaderData }: Route.ComponentProps) {
  const { anak, terpilih, galeri } = loaderData;
  const [, setParams] = useSearchParams();
  const [fotoBesar, setFotoBesar] = useState<{ src: string; alt: string } | null>(null);

  if (terpilih === null) {
    return (
      <>
        <JudulHalaman judul="Galeri" />
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
        judul="Galeri"
        deskripsi={
          terpilih.kelasId === null
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

      {terpilih.kelasId === null ? (
        <Panel judul="Belum ada kelas">
          <p className="text-sm text-fg-muted">
            {terpilih.nama} belum ditempatkan di kelas, jadi belum ada galeri yang bisa ditampilkan.
          </p>
        </Panel>
      ) : galeri.length === 0 ? (
        <Panel judul="Belum ada foto">
          <p className="text-sm text-fg-muted">
            Guru di kelas {terpilih.labelKelas} belum mengunggah foto kegiatan.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {galeri.map((g) => (
            <article key={g.id} className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
              <p className="text-xs text-fg-subtle">{tanggalPanjang(g.tanggal)}</p>
              <p className="mt-1 text-sm">{g.caption}</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {g.foto.map((f, i) => (
                  <li key={f.slice(-24)}>
                    <button
                      type="button"
                      onClick={() => setFotoBesar({ src: f, alt: `${g.caption} — foto ${i + 1}` })}
                      className="block w-full overflow-hidden rounded-field border border-border"
                    >
                      <img
                        src={f}
                        alt={`${g.caption} — foto ${i + 1}`}
                        className="aspect-square w-full object-cover transition hover:opacity-90"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-fg-subtle">
        Anda hanya dapat melihat galeri kelas anak Anda sendiri.{" "}
        <Link to="/ortu" className="underline">
          Kembali ke dashboard
        </Link>
      </p>

      <Modal judul={fotoBesar?.alt ?? ""} terbuka={fotoBesar !== null} onTutup={() => setFotoBesar(null)}>
        {fotoBesar && (
          <img src={fotoBesar.src} alt={fotoBesar.alt} className="w-full rounded-field object-contain" />
        )}
      </Modal>
    </>
  );
}
