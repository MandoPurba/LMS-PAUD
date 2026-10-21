import { useState } from "react";
import { Link, useRevalidator } from "react-router";

import type { Route } from "./+types/kelas";
import {
  Field,
  Input,
  PesanGagal,
  Select,
  TombolBahaya,
  TombolSekunder,
  TombolUtama,
} from "../../components/form";
import { Modal } from "../../components/Modal";
import { BarisKosong } from "../../components/TabelToolbar";
import { JudulHalaman } from "../../components/ui";
import type { Kelas } from "../../data/types";
import {
  cekHapusKelas,
  guruTersedia,
  namaTahun,
  namaUser,
  siswaDariKelas,
  tahunAktif,
} from "../../lib/relasi";
import { GagalSimpan, repoKelas, repoTahunAjaran } from "../../lib/repo";

export function meta() {
  return [{ title: "Kelas — LMS TK/PAUD" }];
}

export function clientLoader() {
  const aktif = tahunAktif();
  const kelas = repoKelas
    .semua()
    .slice()
    .sort((a, b) => namaTahun(b.tahunAjaranId).localeCompare(namaTahun(a.tahunAjaranId)) || a.nama.localeCompare(b.nama));

  return {
    tahunAktifId: aktif?.id ?? null,
    daftarTahun: repoTahunAjaran.semua(),
    kelas: kelas.map((k) => ({
      ...k,
      namaTahunAjaran: namaTahun(k.tahunAjaranId),
      namaWali: namaUser(k.guruId),
      siswa: siswaDariKelas(k.id),
      alasanTolakHapus: cekHapusKelas(k.id),
    })),
  };
}

type Draf = { nama: string; tahunAjaranId: string; guruId: string };
type Galat = Partial<Record<keyof Draf, string>>;

function validasi(draf: Draf, idSaatIni?: string): Galat {
  const galat: Galat = {};
  const nama = draf.nama.trim();

  if (!draf.tahunAjaranId) galat.tahunAjaranId = "Tahun ajaran wajib dipilih.";

  if (!nama) {
    galat.nama = "Nama kelas wajib diisi.";
  } else if (
    repoKelas
      .semua()
      .some(
        (k) =>
          k.nama.toLowerCase() === nama.toLowerCase() &&
          k.tahunAjaranId === draf.tahunAjaranId &&
          k.id !== idSaatIni,
      )
  ) {
    galat.nama = "Nama kelas ini sudah ada di tahun ajaran yang dipilih.";
  }

  return galat;
}

export default function AdminKelas({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; kelas?: Kelas } | null>(null);
  const [draf, setDraf] = useState<Draf>({ nama: "", tahunAjaranId: "", guruId: "" });
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<Kelas | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  // Daftar guru dihitung ulang sesuai tahun ajaran yang sedang dipilih di form.
  const guruPilihan =
    draf.tahunAjaranId === "" ? [] : guruTersedia(draf.tahunAjaranId, form?.kelas?.id);

  function bukaTambah() {
    setDraf({ nama: "", tahunAjaranId: loaderData.tahunAktifId ?? "", guruId: "" });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(kelas: Kelas) {
    setDraf({
      nama: kelas.nama,
      tahunAjaranId: kelas.tahunAjaranId,
      guruId: kelas.guruId ?? "",
    });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "ubah", kelas });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const hasil = validasi(draf, form.kelas?.id);
    setGalat(hasil);
    if (Object.keys(hasil).length > 0) return;

    const isi = {
      nama: draf.nama.trim(),
      tahunAjaranId: draf.tahunAjaranId,
      guruId: draf.guruId === "" ? null : draf.guruId,
    };

    try {
      if (form.mode === "tambah") repoKelas.tambah(isi);
      else if (form.kelas) repoKelas.ubah(form.kelas.id, isi);
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Data gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoKelas.hapus(targetHapus.id);
      setTargetHapus(null);
      revalidate();
    } catch {
      setPesanGagal("Data gagal dihapus.");
      setTargetHapus(null);
    }
  }

  return (
    <>
      <JudulHalaman
        judul="Kelas"
        deskripsi="Satu guru menjadi wali paling banyak satu kelas per tahun ajaran. Penempatan siswa dilakukan di Data Siswa."
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-fg-muted">{loaderData.kelas.length} kelas terdaftar</p>
          <div className="ml-auto">
            <TombolUtama type="button" onClick={bukaTambah}>
              + Tambah Kelas
            </TombolUtama>
          </div>
        </div>

        <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-fg-muted">
                <th scope="col" className="px-3 py-2 font-semibold">Kelas</th>
                <th scope="col" className="px-3 py-2 font-semibold">Tahun ajaran</th>
                <th scope="col" className="px-3 py-2 font-semibold">Wali kelas</th>
                <th scope="col" className="px-3 py-2 font-semibold">Siswa</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loaderData.kelas.length === 0 ? (
                <BarisKosong kolom={5} pesan="Belum ada kelas." />
              ) : (
                loaderData.kelas.map((k) => (
                  <tr key={k.id} className="border-b border-border align-top last:border-0">
                    <td className="px-3 py-2.5 font-medium">
                      {k.nama}
                      {k.tahunAjaranId === loaderData.tahunAktifId && (
                        <span className="ml-2 rounded-pill bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          tahun aktif
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-fg-muted">{k.namaTahunAjaran}</td>
                    <td className="px-3 py-2.5">
                      {k.guruId === null ? (
                        <span className="text-xs text-warning">belum ditetapkan</span>
                      ) : (
                        k.namaWali
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {k.siswa.length === 0 ? (
                        <span className="text-xs text-fg-subtle">kosong</span>
                      ) : (
                        <details>
                          <summary className="cursor-pointer text-fg-muted">
                            {k.siswa.length} siswa
                          </summary>
                          <ul className="mt-1.5 space-y-0.5 text-xs text-fg-muted">
                            {k.siswa.map((s) => (
                              <li key={s.id}>{s.nama}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => bukaUbah(k)}
                          className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetHapus(k)}
                          disabled={k.alasanTolakHapus !== null}
                          title={k.alasanTolakHapus ?? undefined}
                          className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition enabled:hover:bg-danger-soft disabled:opacity-40"
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

        {loaderData.daftarTahun.length === 0 && (
          <p className="mt-4 rounded-field bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
            Belum ada tahun ajaran. Buat dulu di{" "}
            <Link to="/admin/tahun-ajaran" className="underline">
              Tahun Ajaran
            </Link>
            .
          </p>
        )}
      </div>

      <Modal
        judul={form?.mode === "ubah" ? "Ubah Kelas" : "Tambah Kelas"}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field label="Tahun ajaran" htmlFor="tahunAjaranId" error={galat.tahunAjaranId}>
            <Select
              id="tahunAjaranId"
              value={draf.tahunAjaranId}
              onChange={(e) => setDraf({ ...draf, tahunAjaranId: e.target.value, guruId: "" })}
            >
              <option value="">— Pilih —</option>
              {loaderData.daftarTahun.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}
                  {t.aktif ? " (aktif)" : ""}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Nama kelas" htmlFor="nama" error={galat.nama}>
            <Input
              id="nama"
              value={draf.nama}
              onChange={(e) => setDraf({ ...draf, nama: e.target.value })}
              placeholder="Kelompok A"
            />
          </Field>

          <Field
            label="Wali kelas"
            htmlFor="guruId"
            petunjuk="Hanya guru aktif yang belum menjadi wali kelas lain di tahun ajaran ini."
          >
            <Select
              id="guruId"
              value={draf.guruId}
              disabled={draf.tahunAjaranId === ""}
              onChange={(e) => setDraf({ ...draf, guruId: e.target.value })}
            >
              <option value="">— Belum ditetapkan —</option>
              {guruPilihan.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(null)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="submit">Simpan</TombolUtama>
          </div>
        </form>
      </Modal>

      <Modal judul="Hapus kelas?" terbuka={targetHapus !== null} onTutup={() => setTargetHapus(null)}>
        <p className="text-sm text-fg-muted">
          Kelas <span className="font-semibold text-fg">{targetHapus?.nama}</span> akan dihapus.
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
