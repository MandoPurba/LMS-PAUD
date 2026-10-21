import { useState } from "react";
import { useOutletContext, useRevalidator } from "react-router";

import type { Role, User } from "../data/types";
import { GagalSimpan, repoUser } from "../lib/repo";
import { useTabelData } from "../lib/useTabelData";
import type { KontekAplikasi } from "../routes/app-layout";
import {
  Field,
  Input,
  PesanGagal,
  Select,
  TombolBahaya,
  TombolSekunder,
  TombolUtama,
} from "./form";
import { Modal } from "./Modal";
import { JudulHalaman } from "./ui";
import { BarisKosong, Paginasi, Pencarian } from "./TabelToolbar";

type Draf = { nama: string; email: string; password: string; aktif: boolean };
type Galat = Partial<Record<keyof Draf, string>>;

const DRAF_KOSONG: Draf = { nama: "", email: "", password: "", aktif: true };

function validasi(draf: Draf, mode: "tambah" | "ubah", idSaatIni?: string): Galat {
  const galat: Galat = {};

  const nama = draf.nama.trim();
  if (!nama) galat.nama = "Nama wajib diisi.";
  else if (nama.length < 3) galat.nama = "Nama minimal 3 karakter.";

  const email = draf.email.trim().toLowerCase();
  if (!email) {
    galat.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    galat.email = "Format email tidak valid.";
  } else if (
    repoUser.semua().some((u) => u.email.toLowerCase() === email && u.id !== idSaatIni)
  ) {
    galat.email = "Email sudah dipakai akun lain.";
  }

  if (mode === "tambah") {
    if (!draf.password) galat.password = "Password wajib diisi.";
    else if (draf.password.length < 6) galat.password = "Password minimal 6 karakter.";
  } else if (draf.password && draf.password.length < 6) {
    galat.password = "Password minimal 6 karakter.";
  }

  return galat;
}

export function HalamanUser({
  role,
  judul,
  deskripsi,
  labelSatuan,
  data,
  kolomTambahan,
  cekHapus,
}: {
  role: Extract<Role, "guru" | "ortu">;
  judul: string;
  deskripsi: string;
  labelSatuan: string;
  data: User[];
  /** Kolom khusus per role, mis. kelas yang diampu atau jumlah anak. */
  kolomTambahan?: { judul: string; render: (user: User) => React.ReactNode };
  /** Mengembalikan alasan bila user tidak boleh dihapus, atau null bila boleh. */
  cekHapus?: (user: User) => string | null;
}) {
  const { sesi } = useOutletContext<KontekAplikasi>();
  const { revalidate } = useRevalidator();

  const [form, setForm] = useState<{ mode: "tambah" | "ubah"; user?: User } | null>(null);
  const [draf, setDraf] = useState<Draf>(DRAF_KOSONG);
  const [galat, setGalat] = useState<Galat>({});
  const [targetHapus, setTargetHapus] = useState<User | null>(null);
  const [gagalSimpan, setGagalSimpan] = useState<string | null>(null);

  const tabel = useTabelData<User>(
    data,
    (u, q) => u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );

  function bukaTambah() {
    setDraf(DRAF_KOSONG);
    setGalat({});
    setGagalSimpan(null);
    setForm({ mode: "tambah" });
  }

  function bukaUbah(user: User) {
    setDraf({ nama: user.nama, email: user.email, password: "", aktif: user.aktif });
    setGalat({});
    setGagalSimpan(null);
    setForm({ mode: "ubah", user });
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const hasilValidasi = validasi(draf, form.mode, form.user?.id);
    setGalat(hasilValidasi);
    if (Object.keys(hasilValidasi).length > 0) return;

    try {
      if (form.mode === "tambah") {
        repoUser.tambah({
          nama: draf.nama.trim(),
          email: draf.email.trim().toLowerCase(),
          password: draf.password,
          role,
          aktif: draf.aktif,
        });
      } else if (form.user) {
        repoUser.ubah(form.user.id, {
          nama: draf.nama.trim(),
          email: draf.email.trim().toLowerCase(),
          aktif: draf.aktif,
          // Password kosong berarti tidak diubah.
          ...(draf.password ? { password: draf.password } : {}),
        });
      }
      setForm(null);
      revalidate();
    } catch (err) {
      setGagalSimpan(err instanceof GagalSimpan ? err.message : "Data gagal disimpan.");
    }
  }

  function hapus() {
    if (!targetHapus) return;
    try {
      repoUser.hapus(targetHapus.id);
      setTargetHapus(null);
      revalidate();
    } catch {
      setGagalSimpan("Data gagal dihapus.");
      setTargetHapus(null);
    }
  }

  return (
    <>
      <JudulHalaman judul={judul} deskripsi={deskripsi} />
      <PesanGagal pesan={gagalSimpan} />

      <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Pencarian
            nilai={tabel.kueri}
            onUbah={tabel.cariBaru}
            placeholder="Cari nama atau email…"
          />
          <TombolUtama type="button" onClick={bukaTambah}>
            + Tambah {labelSatuan}
          </TombolUtama>
        </div>

        <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-lg text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-fg-muted">
                <th scope="col" className="px-3 py-2 font-semibold">Nama</th>
                <th scope="col" className="px-3 py-2 font-semibold">Email</th>
                <th scope="col" className="px-3 py-2 font-semibold">Status</th>
                {kolomTambahan && (
                  <th scope="col" className="px-3 py-2 font-semibold">{kolomTambahan.judul}</th>
                )}
                <th scope="col" className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tabel.baris.length === 0 ? (
                <BarisKosong
                  kolom={kolomTambahan ? 5 : 4}
                  pesan={
                    tabel.totalSemua === 0
                      ? `Belum ada data ${labelSatuan.toLowerCase()}.`
                      : "Tidak ada data yang cocok dengan pencarian."
                  }
                />
              ) : (
                tabel.baris.map((u) => {
                  const alasanTolak =
                    u.id === sesi.id
                      ? "Tidak dapat menghapus akun sendiri."
                      : (cekHapus?.(u) ?? null);
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 font-medium">{u.nama}</td>
                      <td className="px-3 py-2.5 text-fg-muted">{u.email}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${
                            u.aktif ? "bg-success-soft text-success" : "bg-surface-sunken text-fg-subtle"
                          }`}
                        >
                          {u.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      {kolomTambahan && (
                        <td className="px-3 py-2.5 text-fg-muted">{kolomTambahan.render(u)}</td>
                      )}
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => bukaUbah(u)}
                            className="rounded-field px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => setTargetHapus(u)}
                            disabled={alasanTolak !== null}
                            title={alasanTolak ?? undefined}
                            className="rounded-field px-2 py-1 text-xs font-semibold text-danger transition enabled:hover:bg-danger-soft disabled:opacity-40"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        judul={form?.mode === "ubah" ? `Ubah ${labelSatuan}` : `Tambah ${labelSatuan}`}
        terbuka={form !== null}
        onTutup={() => setForm(null)}
      >
        <form onSubmit={simpan} className="space-y-4" noValidate>
          <Field label="Nama lengkap" htmlFor="nama" error={galat.nama}>
            <Input
              id="nama"
              value={draf.nama}
              onChange={(e) => setDraf({ ...draf, nama: e.target.value })}
              placeholder="Nama sesuai dokumen"
            />
          </Field>

          <Field label="Email" htmlFor="email" error={galat.email}>
            <Input
              id="email"
              type="email"
              value={draf.email}
              onChange={(e) => setDraf({ ...draf, email: e.target.value })}
              placeholder="nama@paud.sch.id"
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            error={galat.password}
            petunjuk={
              form?.mode === "ubah"
                ? "Biarkan kosong bila tidak ingin mengubah password."
                : "Minimal 6 karakter."
            }
          >
            <Input
              id="password"
              type="password"
              value={draf.password}
              onChange={(e) => setDraf({ ...draf, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>

          <Field label="Status akun" htmlFor="aktif">
            <Select
              id="aktif"
              value={draf.aktif ? "aktif" : "nonaktif"}
              onChange={(e) => setDraf({ ...draf, aktif: e.target.value === "aktif" })}
            >
              <option value="aktif">Aktif — dapat masuk ke aplikasi</option>
              <option value="nonaktif">Nonaktif — tidak dapat masuk</option>
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

      <Modal
        judul={`Hapus ${labelSatuan}?`}
        terbuka={targetHapus !== null}
        onTutup={() => setTargetHapus(null)}
      >
        <p className="text-sm text-fg-muted">
          Akun <span className="font-semibold text-fg">{targetHapus?.nama}</span> (
          {targetHapus?.email}) akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
