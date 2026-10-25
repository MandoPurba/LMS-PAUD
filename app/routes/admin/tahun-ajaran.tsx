import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/tahun-ajaran";
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
import type { Semester, TahunAjaran } from "../../data/types";
import { aktifkanTahun, cekHapusTahunAjaran, kelasTahun } from "../../lib/relasi";
import { GagalSimpan, repoTahunAjaran } from "../../lib/repo";

export function meta() {
  return [{ title: "Tahun Ajaran — LMS TK/PAUD" }];
}

export function clientLoader() {
  const tahun = repoTahunAjaran
    .semua()
    .slice()
    .sort((a, b) => b.nama.localeCompare(a.nama));

  return {
    tahun: tahun.map((t) => ({
      ...t,
      jumlahKelas: kelasTahun(t.id).length,
      alasanTolakHapus: cekHapusTahunAjaran(t),
    })),
  };
}

type Draf = { nama: string; semesterAktif: Semester };
type Galat = Partial<Record<keyof Draf, string>>;

const DRAF_KOSONG: Draf = { nama: "", semesterAktif: 1 };

function validasi(draf: Draf, idSaatIni?: string): Galat {
  const galat: Galat = {};
  const nama = draf.nama.trim();

  if (!nama) {
    galat.nama = "Tahun ajaran wajib diisi.";
  } else if (!/^\d{4}\/\d{4}$/.test(nama)) {
    galat.nama = "Format harus YYYY/YYYY, mis. 2026/2027.";
  } else {
    const [awal, akhir] = nama.split("/").map(Number);
    if (akhir !== awal + 1) {
      galat.nama = "Tahun kedua harus satu tahun setelah tahun pertama.";
    } else if (repoTahunAjaran.semua().some((t) => t.nama === nama && t.id !== idSaatIni)) {
      galat.nama = "Tahun ajaran ini sudah terdaftar.";
    }
  }

  return galat;
}

export default function AdminTahunAjaran({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; tahun?: TahunAjaran } | null>(null);
  const [draf, setDraf] = useState<Draf>(DRAF_KOSONG);
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<TahunAjaran | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  const alasanTolak =
    targetHapus === null
      ? null
      : (loaderData.tahun.find((t) => t.id === targetHapus.id)?.alasanTolakHapus ?? null);

  function bukaTambah() {
    setDraf(DRAF_KOSONG);
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(tahun: TahunAjaran) {
    setDraf({ nama: tahun.nama, semesterAktif: tahun.semesterAktif });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "ubah", tahun });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const hasil = validasi(draf, form.tahun?.id);
    setGalat(hasil);
    if (Object.keys(hasil).length > 0) return;

    const isi = { nama: draf.nama.trim(), semesterAktif: draf.semesterAktif };
    try {
      if (form.mode === "tambah") {
        // Tahun baru tidak langsung aktif; aktivasi adalah tindakan terpisah.
        repoTahunAjaran.tambah({ ...isi, aktif: false });
      } else if (form.tahun) {
        repoTahunAjaran.ubah(form.tahun.id, isi);
      }
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Data gagal disimpan.");
    }
  }

  function aktifkan(id: string) {
    try {
      aktifkanTahun(id);
      revalidate();
    } catch {
      setPesanGagal("Gagal mengubah tahun aktif.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoTahunAjaran.hapus(targetHapus.id);
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
        judul="Tahun Ajaran"
        deskripsi="Tepat satu tahun ajaran berstatus aktif. Kelas, absensi, dan rapor mengikuti tahun yang aktif."
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-fg-muted">{loaderData.tahun.length} tahun ajaran terdaftar</p>
          <div className="ml-auto">
            <TombolUtama type="button" onClick={bukaTambah}>
              + Tambah Tahun Ajaran
            </TombolUtama>
          </div>
        </div>

        <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-lg text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-fg-muted">
                <th scope="col" className="px-3 py-2 font-semibold">Tahun ajaran</th>
                <th scope="col" className="px-3 py-2 font-semibold">Semester aktif</th>
                <th scope="col" className="px-3 py-2 font-semibold">Kelas</th>
                <th scope="col" className="px-3 py-2 font-semibold">Status</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loaderData.tahun.length === 0 ? (
                <BarisKosong kolom={5} pesan="Belum ada tahun ajaran." />
              ) : (
                loaderData.tahun.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 font-medium">{t.nama}</td>
                    <td className="px-3 py-2.5 text-fg-muted">Semester {t.semesterAktif}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{t.jumlahKelas}</td>
                    <td className="px-3 py-2.5">
                      {t.aktif ? (
                        <span className="rounded-pill bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-fg-subtle">Tidak aktif</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {!t.aktif && (
                          <button
                            type="button"
                            onClick={() => aktifkan(t.id)}
                            className="rounded-field px-2 py-1 text-xs font-semibold text-success transition hover:bg-success-soft"
                          >
                            Jadikan aktif
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => bukaUbah(t)}
                          className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetHapus(t)}
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
        judul={form?.mode === "ubah" ? "Ubah Tahun Ajaran" : "Tambah Tahun Ajaran"}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field
            label="Tahun ajaran"
            htmlFor="nama"
            error={galat.nama}
            petunjuk="Format YYYY/YYYY, mis. 2026/2027."
          >
            <Input
              id="nama"
              value={draf.nama}
              onChange={(e) => setDraf({ ...draf, nama: e.target.value })}
              placeholder="2026/2027"
            />
          </Field>

          <Field label="Semester aktif" htmlFor="semesterAktif">
            <Select
              id="semesterAktif"
              value={String(draf.semesterAktif)}
              onChange={(e) =>
                setDraf({ ...draf, semesterAktif: Number(e.target.value) as Semester })
              }
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </Select>
          </Field>

          {form?.mode === "tambah" && (
            <p className="rounded-field bg-info-soft px-3 py-2 text-xs text-info">
              Tahun ajaran baru dibuat dalam status tidak aktif. Aktifkan lewat tombol
              “Jadikan aktif” di tabel.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(null)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="submit">Simpan</TombolUtama>
          </div>
        </form>
      </Modal>

      <Modal
        judul={
          alasanTolak !== null ? "Tahun ajaran tidak dapat dihapus" : "Hapus tahun ajaran?"
        }
        terbuka={targetHapus !== null}
        onTutup={() => setTargetHapus(null)}
      >
        {alasanTolak !== null ? (
          <>
            <p className="text-sm text-fg-muted">
              Tahun ajaran <span className="font-semibold text-fg">{targetHapus?.nama}</span>{" "}
              belum dapat dihapus.
            </p>
            <p className="mt-3 rounded-field bg-warning-soft px-3 py-2 text-sm font-medium text-warning">
              {alasanTolak}
            </p>
            <div className="mt-5 flex justify-end">
              <TombolSekunder type="button" onClick={() => setTargetHapus(null)}>
                Mengerti
              </TombolSekunder>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-fg-muted">
              Tahun ajaran <span className="font-semibold text-fg">{targetHapus?.nama}</span>{" "}
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
          </>
        )}
      </Modal>
    </>
  );
}
