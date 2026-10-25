import { useNavigate, useRevalidator } from "react-router";

import type { Session } from "../data/types";
import { type Peristiwa, tandaiDibaca, tandaiSemuaDibaca } from "../lib/notifikasi";
import { tanggalPendek } from "../lib/tanggal";
import { TombolSekunder } from "./form";
import { JudulHalaman, Panel } from "./ui";

export function HalamanNotifikasi({
  sesi,
  notifikasi,
}: {
  sesi: Session;
  notifikasi: Peristiwa[];
}) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const belumDibaca = notifikasi.filter((n) => n.belumDibaca);

  function buka(n: Peristiwa) {
    tandaiDibaca(sesi.id, n.kunci);
    navigate(n.tautan);
  }

  function tandaiSemua() {
    tandaiSemuaDibaca(
      sesi.id,
      notifikasi.map((n) => n.kunci),
    );
    revalidate();
  }

  return (
    <>
      <JudulHalaman
        judul="Notifikasi"
        deskripsi={
          belumDibaca.length === 0
            ? "Semua notifikasi sudah dibaca."
            : `${belumDibaca.length} notifikasi belum dibaca.`
        }
      />

      {notifikasi.length === 0 ? (
        <Panel judul="Belum ada notifikasi">
          <p className="text-sm text-fg-muted">
            Notifikasi muncul saat ada daily report baru, perubahan status izin, atau rapor
            terbit.
          </p>
        </Panel>
      ) : (
        <div className="rounded-card border border-border bg-surface-raised p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-3">
            <p className="text-sm text-fg-muted">{notifikasi.length} notifikasi</p>
            {belumDibaca.length > 0 && (
              <div className="ml-auto">
                <TombolSekunder type="button" onClick={tandaiSemua}>
                  Tandai semua sudah dibaca
                </TombolSekunder>
              </div>
            )}
          </div>

          <ul className="divide-y divide-border">
            {notifikasi.map((n) => (
              <li key={n.kunci}>
                <button
                  type="button"
                  onClick={() => buka(n)}
                  className="flex w-full items-start gap-3 py-3 text-left transition hover:bg-surface-hover"
                >
                  <span aria-hidden="true" className="mt-0.5 text-lg">
                    {n.ikon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{n.judul}</span>
                      {n.belumDibaca && (
                        <span className="rounded-pill bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Baru
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-fg-muted">{n.pesan}</span>
                    <span className="block text-xs text-fg-subtle">
                      {tanggalPendek(n.tanggal)}
                    </span>
                  </span>

                  <span aria-hidden="true" className="mt-1 text-fg-subtle">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
