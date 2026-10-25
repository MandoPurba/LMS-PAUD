import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { Session } from "../data/types";
import { type Peristiwa, tandaiDibaca } from "../lib/notifikasi";
import { tanggalPendek } from "../lib/tanggal";
import { Ikon } from "./Ikon";

const TAMPIL_DI_PANEL = 5;

export function Lonceng({ sesi, notifikasi }: { sesi: Session; notifikasi: Peristiwa[] }) {
  const [terbuka, setTerbuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const belumDibaca = notifikasi.filter((n) => n.belumDibaca).length;

  // Tutup saat menekan Escape atau mengeklik di luar panel.
  useEffect(() => {
    if (!terbuka) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTerbuka(false);
    }
    function onKlik(e: MouseEvent) {
      if (wadah.current && !wadah.current.contains(e.target as Node)) setTerbuka(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onKlik);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onKlik);
    };
  }, [terbuka]);

  function buka(n: Peristiwa) {
    tandaiDibaca(sesi.id, n.kunci);
    setTerbuka(false);
    navigate(n.tautan);
  }

  return (
    <div ref={wadah} className="relative">
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-expanded={terbuka}
        aria-label={
          belumDibaca === 0 ? "Notifikasi" : `Notifikasi, ${belumDibaca} belum dibaca`
        }
        className="relative rounded-field border border-border px-2.5 py-1.5 text-sm transition hover:bg-surface-hover"
      >
        <Ikon nama="bell" />
        {belumDibaca > 0 && (
          <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-pill bg-danger px-1 text-[10px] font-bold text-fg-on-strong tabular-nums">
            {belumDibaca > 9 ? "9+" : belumDibaca}
          </span>
        )}
      </button>

      {terbuka && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-border bg-surface-raised shadow-pop"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-semibold">Notifikasi</p>
            <p className="text-xs text-fg-subtle">
              {belumDibaca === 0 ? "Semua sudah dibaca" : `${belumDibaca} belum dibaca`}
            </p>
          </div>

          {notifikasi.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-fg-subtle">Belum ada notifikasi.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifikasi.slice(0, TAMPIL_DI_PANEL).map((n) => (
                <li key={n.kunci}>
                  <button
                    type="button"
                    onClick={() => buka(n)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition hover:bg-surface-hover ${
                      n.belumDibaca ? "bg-primary-soft/40" : ""
                    }`}
                  >
                    <Ikon nama={n.ikon} className="mt-0.5 w-4 text-center" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {n.judul}
                        {n.belumDibaca && (
                          <span
                            aria-hidden="true"
                            className="ml-1.5 inline-block size-1.5 rounded-pill bg-primary align-middle"
                          />
                        )}
                      </span>
                      <span className="block truncate text-xs text-fg-muted">{n.pesan}</span>
                      <span className="block text-xs text-fg-subtle">
                        {tanggalPendek(n.tanggal)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border px-3 py-2">
            <Link
              to={`/${sesi.role}/notifikasi`}
              onClick={() => setTerbuka(false)}
              className="text-xs font-semibold text-primary underline"
            >
              Lihat semua notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
