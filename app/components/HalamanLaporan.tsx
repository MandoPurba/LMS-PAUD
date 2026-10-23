import { useSearchParams } from "react-router";

import type { Kelas, StatusHadir } from "../data/types";
import { LABEL_STATUS, URUTAN_STATUS, WARNA_STATUS } from "../lib/absensi";
import {
  type BarisCapaian,
  type RekapAbsensi,
  labelBulan,
} from "../lib/laporan";
import { LABEL_CAPAIAN, MASTER, URUTAN_CAPAIAN, WARNA_CAPAIAN } from "../lib/stppa";
import { labelPeriode, tanggalPendek } from "../lib/tanggal";
import { BarTumpuk, type SeriBar } from "./BarTumpuk";
import { Select } from "./form";
import { JudulHalaman, Panel } from "./ui";

const SERI: SeriBar[] = [
  { kunci: "H", label: "Hadir", warna: "bg-chart-hadir" },
  { kunci: "I", label: "Izin", warna: "bg-chart-izin" },
  { kunci: "S", label: "Sakit", warna: "bg-chart-sakit" },
  { kunci: "A", label: "Alpa", warna: "bg-chart-alpa" },
];

export type DataLaporan = {
  /** null = admin boleh memilih; terisi = guru terkunci ke kelasnya. */
  terkunciKelas: boolean;
  daftarKelas: { id: string; label: string }[];
  kelas: Kelas | null;
  bulan: string;
  daftarBulan: string[];
  periode: { tahunAjaran: string; semester: 1 | 2 };
  daftarPeriode: { tahunAjaran: string; semester: 1 | 2 }[];
  absensi: RekapAbsensi;
  capaian: BarisCapaian[];
  hariKosong: string[];
};

function Tile({ label, nilai, catatan }: { label: string; nilai: string; catatan?: string }) {
  return (
    <div className="rounded-field bg-surface-sunken px-3 py-3">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold">{nilai}</p>
      {catatan && <p className="text-xs text-fg-subtle">{catatan}</p>}
    </div>
  );
}

export function HalamanLaporan({ data, judul }: { data: DataLaporan; judul: string }) {
  const [params, setParams] = useSearchParams();
  const { absensi, capaian } = data;

  function ganti(kunci: string, nilai: string) {
    const baru = new URLSearchParams(params);
    baru.set(kunci, nilai);
    if (kunci === "kelas") {
      baru.delete("bulan");
      baru.delete("periode");
    }
    setParams(baru, { preventScrollReset: true });
  }

  if (data.kelas === null) {
    return (
      <>
        <JudulHalaman judul={judul} />
        <Panel judul="Belum ada kelas">
          <p className="text-sm text-fg-muted">
            {data.terkunciKelas
              ? "Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif."
              : "Belum ada kelas terdaftar. Buat kelas terlebih dahulu di menu Kelas."}
          </p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <JudulHalaman
        judul={judul}
        deskripsi="Rekap kehadiran per bulan dan capaian perkembangan per semester."
      />

      {/* Satu baris filter di atas, menyetel seluruh bagian di bawahnya. */}
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-card border border-border bg-surface-raised p-4 shadow-card">
        <div className="min-w-44">
          <label htmlFor="kelas" className="block text-sm font-medium">
            Kelas
          </label>
          {data.terkunciKelas ? (
            <p className="mt-1 rounded-field bg-surface-sunken px-3 py-2 text-sm">
              {data.kelas.nama}
            </p>
          ) : (
            <Select id="kelas" value={data.kelas.id} onChange={(e) => ganti("kelas", e.target.value)}>
              {data.daftarKelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="min-w-40">
          <label htmlFor="bulan" className="block text-sm font-medium">
            Bulan <span className="font-normal text-fg-subtle">(absensi)</span>
          </label>
          <Select id="bulan" value={data.bulan} onChange={(e) => ganti("bulan", e.target.value)}>
            {data.daftarBulan.map((b) => (
              <option key={b} value={b}>
                {labelBulan(b)}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-48">
          <label htmlFor="periode" className="block text-sm font-medium">
            Semester <span className="font-normal text-fg-subtle">(capaian)</span>
          </label>
          <Select
            id="periode"
            value={labelPeriode(data.periode)}
            onChange={(e) => ganti("periode", e.target.value)}
          >
            {data.daftarPeriode.map((p) => (
              <option key={labelPeriode(p)} value={labelPeriode(p)}>
                {labelPeriode(p)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-5">
        <Panel judul={`Ringkasan ${labelBulan(data.bulan)}`}>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile
              label="Hari tercatat"
              nilai={String(absensi.hariTercatat.length)}
              catatan={absensi.hariTercatat.length === 0 ? "belum ada absensi" : undefined}
            />
            <Tile
              label="Kehadiran kelas"
              nilai={absensi.persenHadirKelas === null ? "—" : `${absensi.persenHadirKelas}%`}
            />
            <Tile label="Jumlah siswa" nilai={String(absensi.baris.length)} />
            <Tile
              label="Tidak hadir"
              nilai={String(absensi.total.I + absensi.total.S + absensi.total.A)}
              catatan={`I ${absensi.total.I} · S ${absensi.total.S} · A ${absensi.total.A}`}
            />
          </dl>

          {data.hariKosong.length > 0 && (
            <p className="mt-3 rounded-field bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
              {data.hariKosong.length} tanggal tercatat tanpa satu pun siswa hadir (
              {data.hariKosong.map(tanggalPendek).join(", ")}). Periksa apakah absensinya sudah benar.
            </p>
          )}
        </Panel>

        <Panel judul="Komposisi kehadiran per anak">
          {absensi.hariTercatat.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Belum ada absensi pada {labelBulan(data.bulan)}.
            </p>
          ) : (
            <>
              <BarTumpuk
                seri={SERI}
                satuan="hari"
                baris={absensi.baris.map((b) => ({
                  kunci: b.siswa.id,
                  label: b.siswa.nama,
                  nilai: b.hitung,
                }))}
              />

              {/* Pasangan tabel: setiap nilai tetap terbaca tanpa warna & tanpa hover. */}
              <div className="mt-5 -mx-4 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-lg text-left text-sm">
                  <caption className="sr-only">
                    Rekap kehadiran {labelBulan(data.bulan)} per siswa
                  </caption>
                  <thead>
                    <tr className="border-b border-border text-xs text-fg-muted">
                      <th scope="col" className="px-3 py-2 font-semibold">Nama</th>
                      {URUTAN_STATUS.map((st) => (
                        <th key={st} scope="col" className="px-3 py-2 text-right font-semibold">
                          {st}
                        </th>
                      ))}
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Total</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absensi.baris.map((b) => (
                      <tr key={b.siswa.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">{b.siswa.nama}</td>
                        {URUTAN_STATUS.map((st) => (
                          <td
                            key={st}
                            className="px-3 py-2 text-right tabular-nums text-fg-muted"
                          >
                            {b.hitung[st] === 0 ? "—" : b.hitung[st]}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right tabular-nums">{b.total}</td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">
                          {b.persenHadir === null ? "—" : `${b.persenHadir}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border-strong text-sm font-semibold">
                      <td className="px-3 py-2">Total kelas</td>
                      {URUTAN_STATUS.map((st) => (
                        <td key={st} className="px-3 py-2 text-right tabular-nums">
                          {absensi.total[st]}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right tabular-nums">
                        {URUTAN_STATUS.reduce((n, st) => n + absensi.total[st], 0)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {absensi.persenHadirKelas === null ? "—" : `${absensi.persenHadirKelas}%`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="mt-2 text-xs text-fg-subtle">
                Keterangan: {URUTAN_STATUS.map((st) => `${st} ${LABEL_STATUS[st]}`).join(" · ")}
              </p>
            </>
          )}
        </Panel>

        <Panel judul={`Capaian perkembangan — ${labelPeriode(data.periode)}`}>
          {capaian.every((b) => b.jumlahObservasi === 0) ? (
            <p className="text-sm text-fg-muted">
              Belum ada observasi STPPA pada semester ini.
            </p>
          ) : (
            <>
              <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {URUTAN_CAPAIAN.map((c) => (
                  <li key={c} className="flex items-center gap-1.5 text-xs text-fg-muted">
                    <span
                      className={`rounded-sm px-1 text-[10px] font-bold ${WARNA_CAPAIAN[c]}`}
                      aria-hidden="true"
                    >
                      {c}
                    </span>
                    {LABEL_CAPAIAN[c]}
                  </li>
                ))}
              </ul>

              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-2xl text-left text-sm">
                  <caption className="sr-only">
                    Capaian STPPA per siswa dan aspek, {labelPeriode(data.periode)}
                  </caption>
                  <thead>
                    <tr className="border-b border-border text-xs text-fg-muted">
                      <th scope="col" className="px-3 py-2 font-semibold">Nama</th>
                      {MASTER.map((m) => (
                        <th key={m.aspek} scope="col" className="px-2 py-2 text-center font-semibold">
                          {m.label}
                        </th>
                      ))}
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Observasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capaian.map((b) => (
                      <tr key={b.siswa.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">{b.siswa.nama}</td>
                        {MASTER.map((m) => {
                          const sel = b.perAspek[m.aspek];
                          return (
                            <td key={m.aspek} className="px-2 py-2 text-center">
                              {sel ? (
                                <span
                                  title={`${m.label}: ${LABEL_CAPAIAN[sel.capaian]} (${sel.jumlah} observasi)`}
                                  className={`inline-block w-11 rounded-sm py-1 text-xs font-bold ${WARNA_CAPAIAN[sel.capaian]}`}
                                >
                                  {sel.capaian}
                                </span>
                              ) : (
                                <span className="text-xs text-fg-subtle">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-right tabular-nums text-fg-muted">
                          {b.jumlahObservasi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-xs text-fg-subtle">
                Capaian yang ditampilkan adalah observasi bertanggal paling baru pada tiap aspek.
              </p>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
