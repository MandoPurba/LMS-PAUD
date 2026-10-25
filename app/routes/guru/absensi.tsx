import { useState } from "react";
import { useRevalidator, useSearchParams } from "react-router";

import type { Route } from "./+types/absensi";
import { PesanGagal, TombolSekunder, TombolUtama } from "../../components/form";
import { JudulHalaman, Panel } from "../../components/ui";
import type { Siswa, StatusHadir } from "../../data/types";
import {
  LABEL_STATUS,
  URUTAN_STATUS,
  WARNA_STATUS,
  absensiTanggal,
  rekapStatus,
  simpanAbsensi,
} from "../../lib/absensi";
import { kelasDariGuru, semesterBerjalan, siswaDariKelas, tahunAktif } from "../../lib/relasi";
import { GagalSimpan } from "../../lib/repo";
import { ambilSesi } from "../../lib/session";
import { tanggalLokal, tanggalPanjang } from "../../lib/tanggal";

export function meta() {
  return [{ title: "Absensi Harian — LMS TK/PAUD" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sesi = ambilSesi();
  const maksTanggal = tanggalLokal();
  const diminta = new URL(request.url).searchParams.get("tanggal");
  // Absensi dicatat pada hari berjalan; tanggal di masa depan tidak diizinkan.
  const tanggal = diminta && diminta <= maksTanggal ? diminta : maksTanggal;

  const kelas = sesi ? (kelasDariGuru(sesi.id) ?? null) : null;
  const siswa = kelas ? siswaDariKelas(kelas.id) : [];
  const idSiswa = new Set(siswa.map((s) => s.id));

  const tersimpan = absensiTanggal(tanggal).filter((a) => idSiswa.has(a.siswaId));

  return {
    tanggal,
    maksTanggal,
    kelas,
    tahun: tahunAktif() ?? null,
    semester: semesterBerjalan(),
    siswa,
    tersimpan: Object.fromEntries(tersimpan.map((a) => [a.siswaId, a.status])) as Record<
      string,
      StatusHadir
    >,
    sudahAda: tersimpan.length > 0,
  };
}

function BadgeRekap({ rekap }: { rekap: Record<StatusHadir, number> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {URUTAN_STATUS.map((st) => (
        <span
          key={st}
          className={`rounded-field px-2 py-1 text-xs font-semibold ${WARNA_STATUS[st].lembut}`}
        >
          {st} {rekap[st]}
          <span className="ml-1 font-normal opacity-80">{LABEL_STATUS[st]}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Dipasang ulang (lewat prop key) setiap tanggal berubah, sehingga pilihan
 * selalu dimulai dari data tanggal tersebut tanpa perlu menyinkronkan state.
 */
function FormAbsensi({
  siswa,
  tersimpan,
  tanggal,
  dicatatOleh,
  onSelesai,
}: {
  siswa: Siswa[];
  tersimpan: Record<string, StatusHadir>;
  tanggal: string;
  dicatatOleh: string;
  onSelesai: () => void;
}) {
  // Default "Hadir" untuk siswa yang belum punya record pada tanggal ini.
  const [pilihan, setPilihan] = useState<Record<string, StatusHadir>>(() =>
    Object.fromEntries(siswa.map((s) => [s.id, tersimpan[s.id] ?? "H"])),
  );
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [tersimpanBaru, setTersimpanBaru] = useState(false);

  const rekap = rekapStatus(
    siswa.map((s) => ({
      id: "",
      siswaId: s.id,
      tanggal,
      status: pilihan[s.id],
      catatan: null,
      dicatatOleh,
    })),
  );

  function ubah(siswaId: string, status: StatusHadir) {
    setPilihan((p) => ({ ...p, [siswaId]: status }));
    setTersimpanBaru(false);
  }

  function semuaHadir() {
    setPilihan(Object.fromEntries(siswa.map((s) => [s.id, "H" as StatusHadir])));
    setTersimpanBaru(false);
  }

  function simpan() {
    try {
      for (const s of siswa) {
        simpanAbsensi({
          siswaId: s.id,
          tanggal,
          status: pilihan[s.id],
          catatan: null,
          dicatatOleh,
        });
      }
      setPesanGagal(null);
      setTersimpanBaru(true);
      onSelesai();
    } catch (err) {
      setPesanGagal(err instanceof GagalSimpan ? err.message : "Absensi gagal disimpan.");
    }
  }

  return (
    <>
      <PesanGagal pesan={pesanGagal} />

      <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <BadgeRekap rekap={rekap} />
          <div className="ml-auto">
            <TombolSekunder type="button" onClick={semuaHadir}>
              Tandai semua Hadir
            </TombolSekunder>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {siswa.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.nama}</p>
                <p className="text-xs text-fg-subtle">
                  {s.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                  {tersimpan[s.id] ? " · sudah tercatat" : ""}
                </p>
              </div>

              <fieldset className="flex gap-1" aria-label={`Status kehadiran ${s.nama}`}>
                {URUTAN_STATUS.map((st) => {
                  const terpilih = pilihan[s.id] === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      aria-pressed={terpilih}
                      title={LABEL_STATUS[st]}
                      onClick={() => ubah(s.id, st)}
                      className={`w-9 rounded-field py-1.5 text-sm font-bold transition ${
                        terpilih
                          ? WARNA_STATUS[st].penuh
                          : "border border-border text-fg-subtle hover:bg-surface-hover"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </fieldset>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {tersimpanBaru && (
            <p role="status" className="text-sm font-medium text-success">
              ✓ Absensi tersimpan.
            </p>
          )}
          <div className="ml-auto">
            <TombolUtama type="button" onClick={simpan}>
              Simpan Absensi
            </TombolUtama>
          </div>
        </div>
      </div>
    </>
  );
}

export default function GuruAbsensi({ loaderData }: Route.ComponentProps) {
  const { tanggal, maksTanggal, kelas, tahun, semester, siswa, tersimpan, sudahAda } = loaderData;
  const [, setParams] = useSearchParams();
  const { revalidate } = useRevalidator();
  const sesi = ambilSesi();

  return (
    <>
      <JudulHalaman
        judul="Absensi Harian"
        deskripsi={
          kelas
            ? `${kelas.nama}${tahun ? ` · ${tahun.nama}${semester ? ` Semester ${semester}` : ""}` : ""}`
            : "Belum ada kelas yang Anda ampu."
        }
      />

      {kelas === null ? (
        <Panel judul="Kelas belum ditetapkan">
          <p className="text-sm text-fg-muted">
            Anda belum ditetapkan sebagai wali kelas pada tahun ajaran aktif, jadi belum ada siswa
            yang bisa diabsen. Admin menetapkannya di menu Kelas.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface-raised p-4 shadow-card">
            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium">
                Tanggal
              </label>
              <input
                id="tanggal"
                type="date"
                value={tanggal}
                max={maksTanggal}
                onChange={(e) =>
                  setParams(e.target.value ? { tanggal: e.target.value } : {}, {
                    preventScrollReset: true,
                  })
                }
                className="mt-1 rounded-field border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg-muted">{tanggalPanjang(tanggal)}</p>
              <p className="text-xs text-fg-subtle">
                {sudahAda
                  ? "Sudah ada absensi tersimpan pada tanggal ini. Menyimpan lagi akan menimpanya."
                  : "Belum ada absensi pada tanggal ini."}
              </p>
            </div>
          </div>

          {siswa.length === 0 ? (
            <Panel judul="Kelas masih kosong">
              <p className="text-sm text-fg-muted">
                Belum ada siswa di {kelas.nama}. Admin menempatkan siswa di menu Data Siswa.
              </p>
            </Panel>
          ) : (
            <FormAbsensi
              key={tanggal}
              siswa={siswa}
              tersimpan={tersimpan}
              tanggal={tanggal}
              dicatatOleh={sesi?.id ?? ""}
              onSelesai={revalidate}
            />
          )}
        </div>
      )}
    </>
  );
}
