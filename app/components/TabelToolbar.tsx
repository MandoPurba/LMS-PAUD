import { Ikon } from "./Ikon";

export function Pencarian({
  nilai,
  onUbah,
  placeholder,
}: {
  nilai: string;
  onUbah: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={nilai}
      onChange={(e) => onUbah(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle sm:w-64"
    />
  );
}

export function Paginasi({
  halaman,
  totalHalaman,
  total,
  totalSemua,
  onPindah,
}: {
  halaman: number;
  totalHalaman: number;
  total: number;
  totalSemua: number;
  onPindah: (h: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <p className="text-xs text-fg-muted">
        {total === totalSemua
          ? `${total} data`
          : `${total} dari ${totalSemua} data cocok dengan pencarian`}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPindah(halaman - 1)}
          disabled={halaman <= 1}
          className="rounded-field border border-border px-2.5 py-1.5 text-sm transition enabled:hover:bg-surface-hover disabled:opacity-40"
        >
          <Ikon nama="chevron-left" className="mr-1 text-xs" />
          Sebelumnya
        </button>
        <span className="text-xs text-fg-muted">
          {halaman} / {totalHalaman}
        </span>
        <button
          type="button"
          onClick={() => onPindah(halaman + 1)}
          disabled={halaman >= totalHalaman}
          className="rounded-field border border-border px-2.5 py-1.5 text-sm transition enabled:hover:bg-surface-hover disabled:opacity-40"
        >
          Berikutnya
          <Ikon nama="chevron-right" className="ml-1 text-xs" />
        </button>
      </div>
    </div>
  );
}

export function BarisKosong({ pesan, kolom }: { pesan: string; kolom: number }) {
  return (
    <tr>
      <td colSpan={kolom} className="px-3 py-8 text-center text-sm text-fg-subtle">
        {pesan}
      </td>
    </tr>
  );
}
