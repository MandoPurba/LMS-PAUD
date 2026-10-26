import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/jadwal";
import { Field, Input, PesanGagal, TombolBahaya, TombolSekunder, TombolUtama } from "../../components/form";
import { Ikon } from "../../components/Ikon";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { JudulHalaman, Panel } from "../../components/ui";
import type { JadwalKegiatan } from "../../data/types";
import { validasiJadwal } from "../../lib/pengumuman";
import { GagalSimpan, repoJadwalKegiatan } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { tanggalLokal, tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Jadwal Kegiatan — LMS TK/PAUD" }];
}

export function clientLoader() {
  return {
    daftar: repoJadwalKegiatan
      .semua()
      .slice()
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
  };
}

type Draf = { nama: string; tanggal: string; waktu: string; lokasi: string; keterangan: string };
type Galat = Partial<Record<"nama" | "tanggal", string>>;

function drafKosong(): Draf {
  return { nama: "", tanggal: tanggalLokal(), waktu: "", lokasi: "", keterangan: "" };
}

export default function AdminJadwal({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();
  const { tampilkan } = useToast();
  const sesi = ambilSesi();
  const hariIni = tanggalLokal();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; data?: JadwalKegiatan } | null>(null);
  const [draf, setDraf] = useState<Draf>(drafKosong());
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<JadwalKegiatan | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  function bukaTambah() {
    setDraf(drafKosong());
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(j: JadwalKegiatan) {
    setDraf({
      nama: j.nama,
      tanggal: j.tanggal,
      waktu: j.waktu ?? "",
      lokasi: j.lokasi ?? "",
      keterangan: j.keterangan ?? "",
    });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "ubah", data: j });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !sesi) return;

    const pesanGalat = validasiJadwal(draf.nama, draf.tanggal);
    if (pesanGalat) {
      setGalat({
        nama: !draf.nama.trim() ? pesanGalat : undefined,
        tanggal: draf.nama.trim() && !draf.tanggal ? pesanGalat : undefined,
      });
      return;
    }
    setGalat({});

    const isi = {
      nama: draf.nama.trim(),
      tanggal: draf.tanggal,
      waktu: draf.waktu.trim() === "" ? null : draf.waktu.trim(),
      lokasi: draf.lokasi.trim() === "" ? null : draf.lokasi.trim(),
      keterangan: draf.keterangan.trim() === "" ? null : draf.keterangan.trim(),
      dibuatOleh: sesi.id,
    };

    try {
      if (form.mode === "tambah") {
        repoJadwalKegiatan.tambah(isi);
        tampilkan("Jadwal kegiatan ditambahkan.");
      } else if (form.data) {
        repoJadwalKegiatan.ubah(form.data.id, isi);
        tampilkan("Jadwal kegiatan diperbarui.");
      }
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Jadwal gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoJadwalKegiatan.hapus(targetHapus.id);
      tampilkan("Jadwal kegiatan dihapus.");
      setTargetHapus(null);
      revalidate();
    } catch {
      setPesanGagal("Jadwal gagal dihapus.");
      setTargetHapus(null);
    }
  }

  return (
    <>
      <JudulHalaman judul="Jadwal Kegiatan" deskripsi="Kegiatan sekolah di luar jadwal harian kelas." />
      <PesanGagal pesan={pesanGagal} />

      <div className="mb-4 flex justify-end">
        <TombolUtama type="button" onClick={bukaTambah}>
          <Ikon nama="plus" className="mr-1.5" />
          Tambah Jadwal
        </TombolUtama>
      </div>

      {loaderData.daftar.length === 0 ? (
        <Panel judul="Belum ada jadwal kegiatan">
          <p className="text-sm text-fg-muted">Tambahkan kegiatan sekolah pertama Anda.</p>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {loaderData.daftar.map((j) => (
            <li key={j.id} className="rounded-card border border-border bg-surface-raised p-4 shadow-card">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-bold">{j.nama}</p>
                    {j.tanggal < hariIni && (
                      <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold text-fg-subtle">
                        Sudah lewat
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fg-subtle">
                    {tanggalPanjang(j.tanggal)}
                    {j.waktu && ` · ${j.waktu}`}
                    {j.lokasi && ` · ${j.lokasi}`}
                  </p>
                  {j.keterangan && <p className="mt-2 text-sm text-fg-muted">{j.keterangan}</p>}
                </div>
                <div className="ml-auto flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => bukaUbah(j)}
                    className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetHapus(j)}
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
        judul={form?.mode === "ubah" ? "Ubah Jadwal Kegiatan" : "Tambah Jadwal Kegiatan"}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field label="Nama kegiatan" htmlFor="nama" error={galat.nama}>
            <Input
              id="nama"
              value={draf.nama}
              onChange={(e) => setDraf({ ...draf, nama: e.target.value })}
              placeholder="Mis. Senam Pagi Bersama"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal" htmlFor="tanggal" error={galat.tanggal}>
              <Input
                id="tanggal"
                type="date"
                value={draf.tanggal}
                onChange={(e) => setDraf({ ...draf, tanggal: e.target.value })}
              />
            </Field>
            <Field label="Waktu" htmlFor="waktu" petunjuk="Opsional, mis. 08.00–09.30.">
              <Input
                id="waktu"
                value={draf.waktu}
                onChange={(e) => setDraf({ ...draf, waktu: e.target.value })}
                placeholder="08.00–09.30"
              />
            </Field>
          </div>

          <Field label="Lokasi" htmlFor="lokasi" petunjuk="Opsional.">
            <Input
              id="lokasi"
              value={draf.lokasi}
              onChange={(e) => setDraf({ ...draf, lokasi: e.target.value })}
              placeholder="Mis. Halaman sekolah"
            />
          </Field>

          <Field label="Keterangan" htmlFor="keterangan" petunjuk="Opsional.">
            <textarea
              id="keterangan"
              rows={3}
              value={draf.keterangan}
              onChange={(e) => setDraf({ ...draf, keterangan: e.target.value })}
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
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

      <Modal judul="Hapus jadwal kegiatan?" terbuka={targetHapus !== null} onTutup={() => setTargetHapus(null)}>
        <p className="text-sm text-fg-muted">
          Jadwal <span className="font-semibold text-fg">{targetHapus?.nama}</span> akan dihapus.
          Tindakan ini tidak dapat dibatalkan.
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
