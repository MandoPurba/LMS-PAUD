import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/menu-makan";
import { Field, Input, PesanGagal, TombolBahaya, TombolSekunder, TombolUtama } from "../../components/form";
import { Ikon } from "../../components/Ikon";
import { Modal } from "../../components/Modal";
import { BarisKosong } from "../../components/TabelToolbar";
import { useToast } from "../../components/Toast";
import { JudulHalaman } from "../../components/ui";
import type { MenuMakan } from "../../data/types";
import { simpanMenu, validasiMenu } from "../../lib/pengumuman";
import { GagalSimpan, repoMenuMakan } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { tanggalLokal, tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Menu Makan — LMS TK/PAUD" }];
}

export function clientLoader() {
  return {
    daftar: repoMenuMakan
      .semua()
      .slice()
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
  };
}

type Draf = {
  tanggal: string;
  makananPokok: string;
  laukPauk: string;
  sayur: string;
  buah: string;
  catatanAlergi: string;
};
type Galat = Partial<Record<"makananPokok" | "laukPauk", string>>;

function drafKosong(): Draf {
  return { tanggal: tanggalLokal(), makananPokok: "", laukPauk: "", sayur: "", buah: "", catatanAlergi: "" };
}

export default function AdminMenuMakan({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();
  const { tampilkan } = useToast();
  const sesi = ambilSesi();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; data?: MenuMakan } | null>(null);
  const [draf, setDraf] = useState<Draf>(drafKosong());
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<MenuMakan | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  function bukaTambah() {
    setDraf(drafKosong());
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(m: MenuMakan) {
    setDraf({
      tanggal: m.tanggal,
      makananPokok: m.makananPokok,
      laukPauk: m.laukPauk,
      sayur: m.sayur,
      buah: m.buah,
      catatanAlergi: m.catatanAlergi ?? "",
    });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "ubah", data: m });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !sesi) return;

    const pesanGalat = validasiMenu(draf.makananPokok, draf.laukPauk);
    if (pesanGalat) {
      setGalat({
        makananPokok: !draf.makananPokok.trim() ? pesanGalat : undefined,
        laukPauk: draf.makananPokok.trim() && !draf.laukPauk.trim() ? pesanGalat : undefined,
      });
      return;
    }
    setGalat({});

    const isi = {
      tanggal: draf.tanggal,
      makananPokok: draf.makananPokok.trim(),
      laukPauk: draf.laukPauk.trim(),
      sayur: draf.sayur.trim(),
      buah: draf.buah.trim(),
      catatanAlergi: draf.catatanAlergi.trim() === "" ? null : draf.catatanAlergi.trim(),
      dibuatOleh: sesi.id,
    };

    try {
      if (form.mode === "tambah") {
        // Satu menu per tanggal (lib/pengumuman.ts simpanMenu): entri yang sudah
        // ada untuk tanggal itu ditimpa, bukan menduplikasi.
        simpanMenu(isi);
        tampilkan("Menu makan disimpan.");
      } else if (form.data) {
        repoMenuMakan.ubah(form.data.id, isi);
        tampilkan("Menu makan diperbarui.");
      }
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Menu gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoMenuMakan.hapus(targetHapus.id);
      tampilkan("Menu makan dihapus.");
      setTargetHapus(null);
      revalidate();
    } catch {
      setPesanGagal("Menu gagal dihapus.");
      setTargetHapus(null);
    }
  }

  return (
    <>
      <JudulHalaman
        judul="Menu Makan"
        deskripsi="Satu menu per tanggal. Menyimpan menu baru untuk tanggal yang sudah ada akan menimpanya."
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="mb-4 flex justify-end">
        <TombolUtama type="button" onClick={bukaTambah}>
          <Ikon nama="plus" className="mr-1.5" />
          Tambah Menu
        </TombolUtama>
      </div>

      <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-fg-muted">
                <th scope="col" className="px-3 py-2 font-semibold">Tanggal</th>
                <th scope="col" className="px-3 py-2 font-semibold">Makanan Pokok</th>
                <th scope="col" className="px-3 py-2 font-semibold">Lauk-Pauk</th>
                <th scope="col" className="px-3 py-2 font-semibold">Sayur</th>
                <th scope="col" className="px-3 py-2 font-semibold">Buah</th>
                <th scope="col" className="px-3 py-2 font-semibold">Alergi</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loaderData.daftar.length === 0 ? (
                <BarisKosong kolom={7} pesan="Belum ada menu makan." />
              ) : (
                loaderData.daftar.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium">{tanggalPanjang(m.tanggal)}</td>
                    <td className="px-3 py-2.5">{m.makananPokok}</td>
                    <td className="px-3 py-2.5">{m.laukPauk}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{m.sayur || "—"}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{m.buah || "—"}</td>
                    <td className="px-3 py-2.5">
                      {m.catatanAlergi ? (
                        <span className="rounded-pill bg-warning-soft px-1.5 py-0.5 text-xs font-semibold text-warning">
                          {m.catatanAlergi}
                        </span>
                      ) : (
                        <span className="text-fg-subtle">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => bukaUbah(m)}
                          className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetHapus(m)}
                          className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        judul={form?.mode === "ubah" ? "Ubah Menu Makan" : "Tambah Menu Makan"}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field label="Tanggal" htmlFor="tanggal" petunjuk="Menu yang sudah ada di tanggal ini akan ditimpa.">
            <Input
              id="tanggal"
              type="date"
              value={draf.tanggal}
              disabled={form?.mode === "ubah"}
              onChange={(e) => setDraf({ ...draf, tanggal: e.target.value })}
            />
          </Field>

          <Field label="Makanan pokok" htmlFor="makananPokok" error={galat.makananPokok}>
            <Input
              id="makananPokok"
              value={draf.makananPokok}
              onChange={(e) => setDraf({ ...draf, makananPokok: e.target.value })}
              placeholder="Mis. Nasi putih"
            />
          </Field>

          <Field label="Lauk-pauk" htmlFor="laukPauk" error={galat.laukPauk}>
            <Input
              id="laukPauk"
              value={draf.laukPauk}
              onChange={(e) => setDraf({ ...draf, laukPauk: e.target.value })}
              placeholder="Mis. Ayam suwir"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sayur" htmlFor="sayur" petunjuk="Opsional.">
              <Input
                id="sayur"
                value={draf.sayur}
                onChange={(e) => setDraf({ ...draf, sayur: e.target.value })}
              />
            </Field>
            <Field label="Buah" htmlFor="buah" petunjuk="Opsional.">
              <Input
                id="buah"
                value={draf.buah}
                onChange={(e) => setDraf({ ...draf, buah: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Catatan alergi" htmlFor="catatanAlergi" petunjuk="Opsional, mis. Tanpa kacang.">
            <Input
              id="catatanAlergi"
              value={draf.catatanAlergi}
              onChange={(e) => setDraf({ ...draf, catatanAlergi: e.target.value })}
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

      <Modal judul="Hapus menu makan?" terbuka={targetHapus !== null} onTutup={() => setTargetHapus(null)}>
        <p className="text-sm text-fg-muted">
          Menu tanggal{" "}
          <span className="font-semibold text-fg">
            {targetHapus ? tanggalPanjang(targetHapus.tanggal) : ""}
          </span>{" "}
          akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
