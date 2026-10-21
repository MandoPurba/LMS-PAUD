import { useState } from "react";
import { useRevalidator } from "react-router";

import type { Route } from "./+types/siswa";
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
import { BarisKosong, Paginasi, Pencarian } from "../../components/TabelToolbar";
import { JudulHalaman } from "../../components/ui";
import type { JenisKelamin, Siswa } from "../../data/types";
import { namaKelas, namaTahun, namaUser } from "../../lib/relasi";
import { GagalSimpan, repoKelas, repoSiswa, repoUser } from "../../lib/repo";
import { useTabelData } from "../../lib/useTabelData";

export function meta() {
  return [{ title: "Data Siswa — LMS TK/PAUD" }];
}

export function clientLoader() {
  return {
    siswa: repoSiswa.semua().map((s) => ({
      ...s,
      labelKelas: namaKelas(s.kelasId),
      labelOrtu: namaUser(s.ortuId),
    })),
    daftarKelas: repoKelas
      .semua()
      .map((k) => ({ id: k.id, label: `${k.nama} — ${namaTahun(k.tahunAjaranId)}` }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    daftarOrtu: repoUser
      .semua()
      .filter((u) => u.role === "ortu")
      .map((u) => ({ id: u.id, label: u.nama })),
  };
}

type Draf = {
  nama: string;
  nisn: string;
  tglLahir: string;
  jenisKelamin: JenisKelamin | "";
  kelasId: string;
  ortuId: string;
};
type Galat = Partial<Record<keyof Draf, string>>;

const DRAF_KOSONG: Draf = {
  nama: "",
  nisn: "",
  tglLahir: "",
  jenisKelamin: "",
  kelasId: "",
  ortuId: "",
};

function validasi(draf: Draf, idSaatIni?: string): Galat {
  const galat: Galat = {};

  const nama = draf.nama.trim();
  if (!nama) galat.nama = "Nama wajib diisi.";
  else if (nama.length < 3) galat.nama = "Nama minimal 3 karakter.";

  const nisn = draf.nisn.trim();
  if (!nisn) {
    galat.nisn = "NISN wajib diisi.";
  } else if (!/^\d+$/.test(nisn)) {
    galat.nisn = "NISN hanya boleh berisi angka.";
  } else if (nisn.length !== 10) {
    galat.nisn = "NISN terdiri dari 10 angka.";
  } else if (repoSiswa.semua().some((s) => s.nisn === nisn && s.id !== idSaatIni)) {
    galat.nisn = "NISN sudah dipakai siswa lain.";
  }

  if (!draf.tglLahir) {
    galat.tglLahir = "Tanggal lahir wajib diisi.";
  } else {
    const tgl = new Date(draf.tglLahir);
    if (Number.isNaN(tgl.getTime())) galat.tglLahir = "Tanggal tidak valid.";
    else if (tgl > new Date()) galat.tglLahir = "Tanggal lahir tidak boleh di masa depan.";
  }

  if (!draf.jenisKelamin) galat.jenisKelamin = "Jenis kelamin wajib dipilih.";

  return galat;
}

function tanggalIndo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function usia(iso: string): string {
  const lahir = new Date(iso);
  if (Number.isNaN(lahir.getTime())) return "—";
  const kini = new Date();
  let bulan = (kini.getFullYear() - lahir.getFullYear()) * 12 + (kini.getMonth() - lahir.getMonth());
  if (kini.getDate() < lahir.getDate()) bulan -= 1;
  if (bulan < 0) return "—";
  return `${Math.floor(bulan / 12)} th ${bulan % 12} bln`;
}

export default function AdminSiswa({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; siswa?: Siswa } | null>(null);
  const [draf, setDraf] = useState<Draf>(DRAF_KOSONG);
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<Siswa | null>(null);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  const tabel = useTabelData(
    loaderData.siswa,
    (s, q) =>
      s.nama.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.labelKelas.toLowerCase().includes(q) ||
      s.labelOrtu.toLowerCase().includes(q),
  );

  function bukaTambah() {
    setDraf(DRAF_KOSONG);
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(siswa: Siswa) {
    setDraf({
      nama: siswa.nama,
      nisn: siswa.nisn,
      tglLahir: siswa.tglLahir,
      jenisKelamin: siswa.jenisKelamin,
      kelasId: siswa.kelasId ?? "",
      ortuId: siswa.ortuId ?? "",
    });
    setGalat({});
    setPesanGagal(null);
    setForm({ mode: "ubah", siswa });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const hasil = validasi(draf, form.siswa?.id);
    setGalat(hasil);
    if (Object.keys(hasil).length > 0) return;

    const isi = {
      nama: draf.nama.trim(),
      nisn: draf.nisn.trim(),
      tglLahir: draf.tglLahir,
      jenisKelamin: draf.jenisKelamin as JenisKelamin,
      kelasId: draf.kelasId === "" ? null : draf.kelasId,
      ortuId: draf.ortuId === "" ? null : draf.ortuId,
    };

    try {
      if (form.mode === "tambah") repoSiswa.tambah(isi);
      else if (form.siswa) repoSiswa.ubah(form.siswa.id, isi);
      setForm(null);
      revalidate();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Data gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoSiswa.hapus(targetHapus.id);
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
        judul="Data Siswa"
        deskripsi="Data pokok anak, penempatan kelas, dan penghubungan dengan akun orang tua."
      />
      <PesanGagal pesan={pesanGagal} />

      <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Pencarian
            nilai={tabel.kueri}
            onUbah={tabel.cariBaru}
            placeholder="Cari nama, NISN, kelas, ortu…"
          />
          <TombolUtama type="button" onClick={bukaTambah}>
            + Tambah Siswa
          </TombolUtama>
        </div>

        <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-fg-muted">
                <th scope="col" className="px-3 py-2 font-semibold">Nama</th>
                <th scope="col" className="px-3 py-2 font-semibold">NISN</th>
                <th scope="col" className="px-3 py-2 font-semibold">L/P</th>
                <th scope="col" className="px-3 py-2 font-semibold">Usia</th>
                <th scope="col" className="px-3 py-2 font-semibold">Kelas</th>
                <th scope="col" className="px-3 py-2 font-semibold">Orang tua</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tabel.baris.length === 0 ? (
                <BarisKosong
                  kolom={7}
                  pesan={
                    tabel.totalSemua === 0
                      ? "Belum ada data siswa."
                      : "Tidak ada data yang cocok dengan pencarian."
                  }
                />
              ) : (
                tabel.baris.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 font-medium">{s.nama}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{s.nisn}</td>
                    <td className="px-3 py-2.5">{s.jenisKelamin}</td>
                    <td className="px-3 py-2.5 text-fg-muted" title={tanggalIndo(s.tglLahir)}>
                      {usia(s.tglLahir)}
                    </td>
                    <td className="px-3 py-2.5">
                      {s.kelasId === null ? (
                        <span className="text-xs text-warning">belum ditempatkan</span>
                      ) : (
                        s.labelKelas
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {s.ortuId === null ? (
                        <span className="text-xs text-warning">belum dihubungkan</span>
                      ) : (
                        s.labelOrtu
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => bukaUbah(s)}
                          className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetHapus(s)}
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

        <Paginasi
          halaman={tabel.halaman}
          totalHalaman={tabel.totalHalaman}
          total={tabel.total}
          totalSemua={tabel.totalSemua}
          onPindah={tabel.setHalaman}
        />
      </div>

      <Modal
        judul={form?.mode === "ubah" ? "Ubah Siswa" : "Tambah Siswa"}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field label="Nama lengkap" htmlFor="nama" error={galat.nama}>
            <Input
              id="nama"
              value={draf.nama}
              onChange={(e) => setDraf({ ...draf, nama: e.target.value })}
              placeholder="Nama sesuai akta"
            />
          </Field>

          <Field label="NISN" htmlFor="nisn" error={galat.nisn} petunjuk="10 angka.">
            <Input
              id="nisn"
              inputMode="numeric"
              value={draf.nisn}
              onChange={(e) => setDraf({ ...draf, nisn: e.target.value })}
              placeholder="0098765011"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal lahir" htmlFor="tglLahir" error={galat.tglLahir}>
              <Input
                id="tglLahir"
                type="date"
                value={draf.tglLahir}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDraf({ ...draf, tglLahir: e.target.value })}
              />
            </Field>

            <Field label="Jenis kelamin" htmlFor="jenisKelamin" error={galat.jenisKelamin}>
              <Select
                id="jenisKelamin"
                value={draf.jenisKelamin}
                onChange={(e) =>
                  setDraf({ ...draf, jenisKelamin: e.target.value as JenisKelamin | "" })
                }
              >
                <option value="">— Pilih —</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </Select>
            </Field>
          </div>

          <Field label="Kelas" htmlFor="kelasId" petunjuk="Boleh dikosongkan bila belum ditempatkan.">
            <Select
              id="kelasId"
              value={draf.kelasId}
              onChange={(e) => setDraf({ ...draf, kelasId: e.target.value })}
            >
              <option value="">— Belum ditempatkan —</option>
              {loaderData.daftarKelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Orang tua"
            htmlFor="ortuId"
            petunjuk="Satu siswa punya satu orang tua. Satu orang tua boleh punya beberapa siswa."
          >
            <Select
              id="ortuId"
              value={draf.ortuId}
              onChange={(e) => setDraf({ ...draf, ortuId: e.target.value })}
            >
              <option value="">— Belum dihubungkan —</option>
              {loaderData.daftarOrtu.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
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

      <Modal judul="Hapus siswa?" terbuka={targetHapus !== null} onTutup={() => setTargetHapus(null)}>
        <p className="text-sm text-fg-muted">
          Data <span className="font-semibold text-fg">{targetHapus?.nama}</span> (NISN{" "}
          {targetHapus?.nisn}) akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
