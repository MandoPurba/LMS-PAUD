import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/pengumuman";
import { Field, PesanGagal, TombolBahaya, TombolSekunder, TombolUtama } from "../../components/form";
import { Ikon } from "../../components/Ikon";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { JudulHalaman, Panel } from "../../components/ui";
import type { Pengumuman } from "../../data/types";
import { validasiPengumuman } from "../../lib/pengumuman";
import { GagalSimpan, repoPengumuman } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { tanggalLokal, tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Pengumuman — LMS TK/PAUD" }];
}

export function clientLoader() {
  return {
    daftar: repoPengumuman
      .semua()
      .slice()
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
  };
}

type Draf = { judul: string; isi: string; tanggal: string };
type Galat = Partial<Record<keyof Draf, string>>;

function drafKosong(): Draf {
  return { judul: "", isi: "", tanggal: tanggalLokal() };
}

export default function AdminPengumuman({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();
  const { tampilkan } = useToast();
  const sesi = ambilSesi();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; data?: Pengumuman } | null>(null);
  const [draf, setDraf] = useState<Draf>(drafKosong());
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<Pengumuman | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  function bukaTambah() {
    setDraf(drafKosong());
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(p: Pengumuman) {
    setDraf({ judul: p.judul, isi: p.isi, tanggal: p.tanggal });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "ubah", data: p });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !sesi) return;

    const pesanGalat = validasiPengumuman(draf.judul, draf.isi);
    if (pesanGalat) {
      setGalat({ judul: !draf.judul.trim() ? pesanGalat : undefined, isi: draf.judul.trim() ? pesanGalat : undefined });
      return;
    }
    setGalat({});

    const isi = {
      judul: draf.judul.trim(),
      isi: draf.isi.trim(),
      tanggal: draf.tanggal || tanggalLokal(),
      dibuatOleh: sesi.id,
    };

    try {
      if (form.mode === "tambah") {
        repoPengumuman.tambah(isi);
        tampilkan("Pengumuman diterbitkan. Guru dan orang tua akan melihatnya di lonceng notifikasi.");
      } else if (form.data) {
        repoPengumuman.ubah(form.data.id, isi);
        tampilkan("Pengumuman diperbarui.");
      }
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Pengumuman gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoPengumuman.hapus(targetHapus.id);
      tampilkan("Pengumuman dihapus.");
      setTargetHapus(null);
      revalidate();
    } catch {
      setPesanGagal("Pengumuman gagal dihapus.");
      setTargetHapus(null);
    }
  }

  return (
    <>
      <JudulHalaman
        judul="Pengumuman"
        deskripsi="Pengumuman yang diterbitkan tampil di lonceng notifikasi Guru dan Orang Tua (FR-13)."
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="mb-4 flex justify-end">
        <TombolUtama type="button" onClick={bukaTambah}>
          <Ikon nama="plus" className="mr-1.5" />
          Tambah Pengumuman
        </TombolUtama>
      </div>

      {loaderData.daftar.length === 0 ? (
        <Panel judul="Belum ada pengumuman">
          <p className="text-sm text-fg-muted">Terbitkan pengumuman pertama Anda.</p>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {loaderData.daftar.map((p) => (
            <li key={p.id} className="rounded-card border border-border bg-surface-raised p-4 shadow-card">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold">{p.judul}</p>
                  <p className="text-xs text-fg-subtle">{tanggalPanjang(p.tanggal)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-fg-muted">{p.isi}</p>
                </div>
                <div className="ml-auto flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => bukaUbah(p)}
                    className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetHapus(p)}
                    className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        judul={form?.mode === "ubah" ? "Ubah Pengumuman" : "Tambah Pengumuman"}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field label="Judul" htmlFor="judul" error={galat.judul}>
            <input
              id="judul"
              value={draf.judul}
              onChange={(e) => setDraf({ ...draf, judul: e.target.value })}
              placeholder="Mis. Libur Hari Guru Nasional"
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
            />
          </Field>

          <Field label="Tanggal" htmlFor="tanggal">
            <input
              id="tanggal"
              type="date"
              value={draf.tanggal}
              onChange={(e) => setDraf({ ...draf, tanggal: e.target.value })}
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Isi pengumuman" htmlFor="isi" error={galat.isi}>
            <textarea
              id="isi"
              rows={4}
              value={draf.isi}
              onChange={(e) => setDraf({ ...draf, isi: e.target.value })}
              placeholder="Jelaskan pengumumannya secara lengkap"
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(null)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="submit">Simpan</TombolUtama>
          </div>
        </form>
      </Modal>

      <Modal judul="Hapus pengumuman?" terbuka={targetHapus !== null} onTutup={() => setTargetHapus(null)}>
        <p className="text-sm text-fg-muted">
          Pengumuman <span className="font-semibold text-fg">{targetHapus?.judul}</span> akan
          dihapus dan tidak lagi tampil di notifikasi. Tindakan ini tidak dapat dibatalkan.
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
