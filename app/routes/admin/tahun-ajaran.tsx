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
import { JudulHalaman } from "../../components/ui";
import type { Semester, TahunAjaran } from "../../data/types";
import {
  aktifkanTahun,
  cekHapusTahunAjaran,
  kelasTahun,
  rentangSemester,
  semesterBerjalan,
  siswaDariKelas,
} from "../../lib/relasi";
import { GagalSimpan, repoTahunAjaran } from "../../lib/repo";

export function meta() {
  return [{ title: "Tahun Ajaran — LMS TK/PAUD" }];
}

/** Setiap tahun ajaran selalu terdiri dari Semester 1 dan Semester 2. */
const SEMESTER: Semester[] = [1, 2];

export function clientLoader() {
  const berjalan = semesterBerjalan();
  const tahun = repoTahunAjaran
    .semua()
    .slice()
    .sort((a, b) => b.nama.localeCompare(a.nama));

  return {
    semesterBerjalan: berjalan,
    tahun: tahun.map((t) => {
      const kelas = kelasTahun(t.id);
      return {
        ...t,
        jumlahKelas: kelas.length,
        jumlahSiswa: kelas.reduce((n, k) => n + siswaDariKelas(k.id).length, 0),
        alasanTolakHapus: cekHapusTahunAjaran(t),
      };
    }),
  };
}

type Draf = { nama: string };
type Galat = Partial<Record<keyof Draf, string>>;

const DRAF_KOSONG: Draf = { nama: "" };

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
  const [targetAktif, setTargetAktif] = useState<TahunAjaran | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const aktifSekarang = loaderData.tahun.find((t) => t.aktif) ?? null;
  const ringkasanTarget =
    targetAktif === null
      ? null
      : (loaderData.tahun.find((t) => t.id === targetAktif.id) ?? null);
  const alasanTolak =
    targetHapus === null
      ? null
      : (loaderData.tahun.find((t) => t.id === targetHapus.id)?.alasanTolakHapus ?? null);

  function bersihkanPesan() {
    setPesanGagal(null);
    setPesanSukses(null);
  }

  function bukaTambah() {
    setDraf(DRAF_KOSONG);
    setGalat({});
    bersihkanPesan();
    setForm({ mode: "tambah" });
  }

  function bukaUbah(tahun: TahunAjaran) {
    setDraf({ nama: tahun.nama });
    setGalat({});
    bersihkanPesan();
    setForm({ mode: "ubah", tahun });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const hasil = validasi(draf, form.tahun?.id);
    setGalat(hasil);
    if (Object.keys(hasil).length > 0) return;

    try {
      if (form.mode === "tambah") {
        // Tahun baru tidak langsung aktif; aktivasi adalah tindakan terpisah.
        repoTahunAjaran.tambah({ nama: draf.nama.trim(), aktif: false });
      } else if (form.tahun) {
        repoTahunAjaran.ubah(form.tahun.id, { nama: draf.nama.trim() });
      }
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Data gagal disimpan.");
    }
  }

  function aktifkan() {
    if (!targetAktif) return;
    try {
      aktifkanTahun(targetAktif.id);
      setPesanSukses(
        `Tahun ajaran ${targetAktif.nama} kini aktif, beserta Semester 1 dan Semester 2-nya. ` +
          "Kelas, absensi, daily report, observasi, rapor, dan laporan mengikuti tahun ini.",
      );
      setTargetAktif(null);
      revalidate();
    } catch {
      setPesanGagal("Gagal mengubah periode aktif.");
      setTargetAktif(null);
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
        deskripsi="Setiap tahun ajaran terdiri dari Semester 1 dan Semester 2, dan keduanya berjalan sepanjang tahun tersebut. Tepat satu tahun ajaran berstatus aktif."
      />
      <PesanGagal pesan={pesanGagal} />

      {pesanSukses && (
        <p
          role="status"
          className="mb-4 rounded-field bg-success-soft px-3 py-2 text-sm font-medium text-success"
        >
          {pesanSukses}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface-raised p-4 shadow-card">
        <div className="min-w-0">
          <p className="text-xs text-fg-muted">Tahun ajaran aktif</p>
          <p className="font-display text-lg font-bold">
            {aktifSekarang ? aktifSekarang.nama : "Belum ada"}
          </p>
          <p className="text-xs text-fg-subtle">
            {loaderData.semesterBerjalan
              ? `Semester ${loaderData.semesterBerjalan} sedang berjalan menurut kalender`
              : aktifSekarang
                ? "Bukan tahun kalender berjalan, jadi belum ada semester yang berlangsung"
                : "Aktifkan salah satu tahun ajaran"}
          </p>
        </div>
        <div className="ml-auto">
          <TombolUtama type="button" onClick={bukaTambah}>
            + Tambah Tahun Ajaran
          </TombolUtama>
        </div>
      </div>

      {loaderData.tahun.length === 0 ? (
        <div className="rounded-card border border-border bg-surface-raised p-6 text-center shadow-card">
          <p className="text-sm text-fg-muted">Belum ada tahun ajaran.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {loaderData.tahun.map((t) => (
            <li
              key={t.id}
              className="rounded-card border border-border bg-surface-raised shadow-card"
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold">{t.nama}</p>
                  <p className="text-xs text-fg-muted">
                    {t.jumlahKelas} kelas · {t.jumlahSiswa} siswa
                  </p>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-1.5">
                  {t.aktif ? (
                    <span className="rounded-pill bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                      Aktif
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTargetAktif(t)}
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
              </div>

              <ul className="divide-y divide-border">
                {SEMESTER.map((sem) => {
                  const berjalan = t.aktif && loaderData.semesterBerjalan === sem;
                  return (
                    <li key={sem} className="flex flex-wrap items-center gap-3 px-4 py-2.5 pl-6">
                      <p className="text-sm">Semester {sem}</p>
                      <p className="text-xs text-fg-subtle">{rentangSemester(t.nama, sem)}</p>

                      <div className="ml-auto">
                        {berjalan ? (
                          <span className="rounded-pill bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                            Sedang berjalan
                          </span>
                        ) : t.aktif ? (
                          <span className="text-xs text-fg-subtle">Bagian dari tahun aktif</span>
                        ) : (
                          <span className="text-xs text-fg-subtle">—</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <Modal
        judul="Jadikan tahun ajaran ini aktif?"
        terbuka={targetAktif !== null}
        onTutup={() => setTargetAktif(null)}
      >
        {targetAktif && (
          <>
            <p className="text-sm text-fg-muted">
              Tahun ajaran aktif akan berpindah dari{" "}
              <span className="font-semibold text-fg">{aktifSekarang?.nama ?? "—"}</span> ke{" "}
              <span className="font-semibold text-fg">{targetAktif.nama}</span>, beserta Semester 1
              dan Semester 2-nya. Hanya satu tahun ajaran yang dapat aktif.
            </p>

            <p className="mt-3 text-sm font-medium">Yang akan mengikuti tahun ini:</p>
            <ul className="mt-1 space-y-0.5 text-sm text-fg-muted">
              <li>• Kelas yang tampil sebagai kelas berjalan</li>
              <li>• Kelas yang diampu guru, beserta absensi dan daily report-nya</li>
              <li>• Periode awal observasi STPPA, rapor, dan laporan</li>
            </ul>

            <p className="mt-3 rounded-field bg-info-soft px-3 py-2 text-xs text-info">
              {targetAktif.nama} memiliki {ringkasanTarget?.jumlahKelas ?? 0} kelas dan{" "}
              {ringkasanTarget?.jumlahSiswa ?? 0} siswa. Guru yang tidak mengampu kelas di tahun
              ini akan melihat halamannya kosong.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <TombolSekunder type="button" onClick={() => setTargetAktif(null)}>
                Batal
              </TombolSekunder>
              <TombolUtama type="button" onClick={aktifkan}>
                Ya, jadikan aktif
              </TombolUtama>
            </div>
          </>
        )}
      </Modal>

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
              onChange={(e) => setDraf({ nama: e.target.value })}
              placeholder="2026/2027"
            />
          </Field>

          <p className="rounded-field bg-info-soft px-3 py-2 text-xs text-info">
            Semester 1 (Juli–Desember) dan Semester 2 (Januari–Juni) otomatis menjadi bagian
            dari setiap tahun ajaran. Semester mana yang sedang berjalan ditentukan kalender, bukan
            dipilih di sini.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <TombolSekunder type="button" onClick={() => setForm(null)}>
              Batal
            </TombolSekunder>
            <TombolUtama type="submit">Simpan</TombolUtama>
          </div>
        </form>
      </Modal>

      <Modal
        judul={alasanTolak !== null ? "Tahun ajaran tidak dapat dihapus" : "Hapus tahun ajaran?"}
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
              beserta kedua semesternya akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
