import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/galeri";
import { Field, PesanGagal, TombolBahaya, TombolSekunder, TombolUtama } from "../../components/form";
import { Ikon } from "../../components/Ikon";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { JudulHalaman, Panel } from "../../components/ui";
import type { Galeri } from "../../data/types";
import { MAKS_FOTO, byteDataUrl, formatByte, kompresFoto } from "../../lib/foto";
import { galeriKelas, validasiGaleri } from "../../lib/galeri";
import { kelasDariGuru } from "../../lib/relasi";
import { GagalSimpan, repoGaleri } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { perkiraanPemakaian } from "../../lib/storage";
import { tanggalLokal, tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Galeri — LMS TK/PAUD" }];
}

export function clientLoader() {
  const sesi = ambilSesi();
  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;

  return {
    kelas,
    pemakaian: perkiraanPemakaian(),
    daftar: kelas ? galeriKelas(kelas.id) : [],
  };
}

type Draf = { tanggal: string; caption: string; foto: string[] };

function drafKosong(): Draf {
  return { tanggal: tanggalLokal(), caption: "", foto: [] };
}

export default function GuruGaleri({ loaderData }: Route.ComponentProps) {
  const { kelas, daftar, pemakaian } = loaderData;
  const { revalidate } = useRevalidator();
  const { tampilkan } = useToast();
  const sesi = ambilSesi();

  const [form, setForm] = useState(false);
  const [draf, setDraf] = useState<Draf>(drafKosong());
  const [galatCaption, setGalatCaption] = useState<string | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [sedangKompres, setSedangKompres] = useState(false);
  const [infoFoto, setInfoFoto] = useState<string | null>(null);
  const [targetHapus, setTargetHapus] = useState<Galeri | null>(null);

  function buka() {
    setDraf(drafKosong());
    setGalatCaption(null);
    setPesanGagal(null);
    setInfoFoto(null);
    setForm(true);
  }

  async function tambahFoto(berkas: FileList | null) {
    if (!berkas || berkas.length === 0) return;

    const sisa = MAKS_FOTO - draf.foto.length;
    if (sisa <= 0) {
      setInfoFoto(`Maksimal ${MAKS_FOTO} foto per unggahan.`);
      return;
    }

    setSedangKompres(true);
    setInfoFoto(null);
    try {
      const terpilih = Array.from(berkas).slice(0, sisa);
      const hasil = await Promise.all(terpilih.map(kompresFoto));
      setDraf((d) => ({ ...d, foto: [...d.foto, ...hasil.map((h) => h.dataUrl)] }));
      setInfoFoto(
        hasil.map((h) => `${formatByte(h.byteAsli)} → ${formatByte(h.byteAkhir)}`).join(" · ") +
          " (dikompres otomatis)",
      );
    } catch (err) {
      setInfoFoto(err instanceof Error ? err.message : "Foto gagal diproses.");
    } finally {
      setSedangKompres(false);
    }
  }

  function simpan() {
    if (!kelas || !sesi) return;

    const galat = validasiGaleri(draf.caption, draf.foto);
    setGalatCaption(galat);
    if (galat) return;

    try {
      repoGaleri.tambah({
        kelasId: kelas.id,
        tanggal: draf.tanggal,
        caption: draf.caption.trim(),
        foto: draf.foto,
        diunggahOleh: sesi.id,
      });
      tampilkan("Foto berhasil diunggah ke galeri kelas.");
      setForm(false);
      revalidate();
    } catch (err) {
      setPesanGagal(
        err instanceof GagalSimpan
          ? "Penyimpanan browser penuh. Hapus sebagian foto lama atau reset data demo."
          : "Foto gagal disimpan.",
      );
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoGaleri.hapus(targetHapus.id);
      tampilkan("Foto dihapus dari galeri.");
      setTargetHapus(null);
      revalidate();
    } catch {
      setPesanGagal("Foto gagal dihapus.");
      setTargetHapus(null);
    }
  }

  return (
    <>
      <JudulHalaman
        judul="Galeri"
        deskripsi={kelas ? `${kelas.nama} · terlihat oleh orang tua di kelas ini` : "Belum ada kelas yang Anda ampu."}
      />
      <PesanGagal pesan={pesanGagal} />

      {kelas === null ? (
        <Panel judul="Kelas belum ditetapkan">
          <p className="text-sm text-fg-muted">
            Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif. Admin menetapkannya
            di menu Kelas.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface-raised p-4 shadow-card">
            <p className="text-xs text-fg-subtle">Penyimpanan demo: {pemakaian.persen}% terpakai</p>
            <div className="ml-auto">
              <TombolUtama type="button" onClick={buka}>
                <Ikon nama="camera" className="mr-1.5" />
                Unggah Foto
              </TombolUtama>
            </div>
          </div>

          {daftar.length === 0 ? (
            <Panel judul="Belum ada foto">
              <p className="text-sm text-fg-muted">
                Unggah foto kegiatan kelas pertama Anda. Orang tua di kelas ini akan dapat melihatnya.
              </p>
            </Panel>
          ) : (
            <ul className="space-y-4">
              {daftar.map((g) => (
                <li key={g.id} className="rounded-card border border-border bg-surface-raised p-4 shadow-card">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-fg-subtle">{tanggalPanjang(g.tanggal)}</p>
                      <p className="mt-0.5 text-sm">{g.caption}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTargetHapus(g)}
                      className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                    >
                      Hapus
                    </button>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {g.foto.map((f, i) => (
                      <li key={f.slice(-24)}>
                        <img
                          src={f}
                          alt={`${g.caption} — foto ${i + 1}`}
                          className="size-24 rounded-field border border-border object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal judul="Unggah Foto Kegiatan" terbuka={form} onTutup={() => setForm(false)}>
        <div className="space-y-4">
          <Field label="Tanggal" htmlFor="tanggal">
            <input
              id="tanggal"
              type="date"
              max={tanggalLokal()}
              value={draf.tanggal}
              onChange={(e) => setDraf({ ...draf, tanggal: e.target.value })}
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Keterangan kegiatan" htmlFor="caption" error={galatCaption ?? undefined}>
            <textarea
              id="caption"
              rows={2}
              value={draf.caption}
              onChange={(e) => setDraf({ ...draf, caption: e.target.value })}
              placeholder="Mis. Bermain balok bersama di halaman kelas"
              className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
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
                      onClick={() => setDraf({ ...draf, foto: draf.foto.filter((_, j) => j !== i) })}
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

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(false)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="button" onClick={simpan}>
              Unggah
            </TombolUtama>
          </div>
        </div>
      </Modal>

      <Modal judul="Hapus foto?" terbuka={targetHapus !== null} onTutup={() => setTargetHapus(null)}>
        <p className="text-sm text-fg-muted">
          Unggahan <span className="font-semibold text-fg">{targetHapus?.caption}</span> beserta
          seluruh fotonya akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
