import { useState } from "react";

export type SeriBar = {
  kunci: string;
  label: string;
  /** Kelas warna Tailwind, mis. "bg-chart-hadir". */
  warna: string;
};

export type BarisBar = {
  kunci: string;
  label: string;
  nilai: Record<string, number>;
};

/** Ambang lebar segmen agar label di dalamnya tidak terpotong. */
const AMBANG_LABEL = 12;
const GRID = [0, 25, 50, 75, 100];

/**
 * Bar tumpuk horizontal. Setiap seri punya warna tetap (identitas, bukan
 * peringkat), antar segmen diberi jarak 2px alih-alih garis tepi, dan nilai
 * hanya dilabeli langsung bila segmennya cukup lebar — sisanya lewat tooltip
 * dan tabel di bawahnya.
 */
export function BarTumpuk({
  seri,
  baris,
  satuan,
}: {
  seri: SeriBar[];
  baris: BarisBar[];
  satuan: string;
}) {
  const [hover, setHover] = useState<{
    teks: string;
    x: number;
    y: number;
  } | null>(null);

  const maksimum = Math.max(1, ...baris.map((b) => seri.reduce((n, s) => n + (b.nilai[s.kunci] ?? 0), 0)));

  return (
    <div className="relative">
      {/* Legenda selalu ada: identitas tidak boleh bergantung warna saja. */}
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {seri.map((s) => (
          <li key={s.kunci} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className={`size-2.5 rounded-sm ${s.warna}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="rounded-field bg-chart-surface p-3">
        <div className="space-y-2">
          {baris.map((b) => {
            const total = seri.reduce((n, s) => n + (b.nilai[s.kunci] ?? 0), 0);
            const terpakai = seri.filter((s) => (b.nilai[s.kunci] ?? 0) > 0);

            return (
              <div key={b.kunci} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="w-full truncate text-xs text-fg-muted sm:w-44">{b.label}</p>

                <div className="relative min-w-0 flex-1">
                  {/* Grid hairline solid, satu nada dari permukaan. */}
                  <div aria-hidden="true" className="absolute inset-0 flex justify-between">
                    {GRID.map((g) => (
                      <span key={g} className="w-px bg-chart-grid" />
                    ))}
                  </div>

                  {total === 0 ? (
                    <p className="relative py-1.5 text-xs text-fg-subtle">belum ada data</p>
                  ) : (
                    <div
                      className="relative flex gap-0.5"
                      style={{ width: `${(total / maksimum) * 100}%` }}
                    >
                      {terpakai.map((s, i) => {
                        const nilai = b.nilai[s.kunci] ?? 0;
                        const persen = (nilai / total) * 100;
                        const pertama = i === 0;
                        const terakhir = i === terpakai.length - 1;
                        const teks = `${b.label} · ${s.label}: ${nilai} ${satuan}`;

                        return (
                          <div
                            key={s.kunci}
                            role="img"
                            aria-label={teks}
                            onMouseEnter={(e) =>
                              setHover({ teks, x: e.clientX, y: e.clientY })
                            }
                            onMouseMove={(e) => setHover({ teks, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHover(null)}
                            className={`flex h-7 items-center justify-center overflow-hidden ${s.warna} ${
                              pertama ? "rounded-l" : ""
                            } ${terakhir ? "rounded-r" : ""}`}
                            style={{ width: `${persen}%` }}
                          >
                            {persen >= AMBANG_LABEL && (
                              <span className="px-1 text-[11px] font-semibold text-fg-on-strong tabular-nums">
                                {nilai}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="w-16 shrink-0 text-right text-xs text-fg-muted tabular-nums">
                  {total === 0 ? "—" : `${total} ${satuan}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {hover && (
        <div
          role="status"
          className="pointer-events-none fixed z-50 rounded-field bg-surface-raised px-2.5 py-1.5 text-xs font-medium shadow-pop ring-1 ring-border"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          {hover.teks}
        </div>
      )}
    </div>
  );
}
