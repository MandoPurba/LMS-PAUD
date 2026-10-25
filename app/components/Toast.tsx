import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { Ikon } from "./Ikon";

/**
 * Toast: umpan balik singkat untuk pelaku aksi (FR-13).
 *
 * Berbeda dari lonceng, yang ditujukan kepada penerima dan bertahan sampai
 * dibaca. Toast dipakai untuk aksi yang berdampak ke orang lain — menerbitkan
 * report, menyetujui izin — sedangkan pesan sukses di tempat tetap dipakai
 * untuk konfirmasi yang tidak keluar dari halaman.
 */

type KonteksToast = { tampilkan: (pesan: string) => void };

const Konteks = createContext<KonteksToast>({ tampilkan: () => {} });

export function useToast(): KonteksToast {
  return useContext(Konteks);
}

const DURASI = 4000;

export function PenyediaToast({ children }: { children: React.ReactNode }) {
  const [pesan, setPesan] = useState<string | null>(null);

  const tampilkan = useCallback((teks: string) => setPesan(teks), []);

  useEffect(() => {
    if (pesan === null) return;
    const jeda = setTimeout(() => setPesan(null), DURASI);
    return () => clearTimeout(jeda);
  }, [pesan]);

  return (
    <Konteks.Provider value={{ tampilkan }}>
      {children}

      {/* aria-live agar pembaca layar ikut mengumumkan */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="tanpa-cetak pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {pesan && (
          <div className="pointer-events-auto flex max-w-md items-start gap-2.5 rounded-card bg-surface-raised px-4 py-3 text-sm shadow-pop ring-1 ring-border">
            <Ikon nama="circle-check" className="mt-0.5 text-success" />
            <p className="min-w-0 flex-1">{pesan}</p>
            <button
              type="button"
              onClick={() => setPesan(null)}
              aria-label="Tutup pemberitahuan"
              className="shrink-0 rounded-field px-1 text-fg-subtle transition hover:bg-surface-hover"
            >
              <Ikon nama="xmark" />
            </button>
          </div>
        )}
      </div>
    </Konteks.Provider>
  );
}
