import type { ItemMenu } from "../lib/menu";

export function JudulHalaman({ judul, deskripsi }: { judul: string; deskripsi?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl">{judul}</h1>
      {deskripsi && <p className="mt-1 text-fg-muted">{deskripsi}</p>}
    </div>
  );
}

export function Panel({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface-raised p-5 shadow-card">
      <h2 className="text-base">{judul}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Kartu untuk fitur yang halamannya belum dibuat, menyebut FR penanggungnya. */
export function KartuFitur({ item }: { item: ItemMenu }) {
  return (
    <div className="flex items-center gap-3 rounded-field border border-border border-dashed px-3 py-2.5">
      <span aria-hidden="true" className="text-lg opacity-50">
        {item.ikon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-fg-muted">{item.label}</span>
      <span className="shrink-0 rounded-pill bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold">
        {item.fr}
      </span>
    </div>
  );
}
