/** Pilihan berbentuk tombol berikon — cepat ditekan, sesuai NFR-06. */
export function PilihIkon<T extends string>({
  label,
  pilihan,
  nilai,
  onPilih,
}: {
  label: string;
  pilihan: { nilai: T; label: string; ikon: string }[];
  nilai: T;
  onPilih: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {pilihan.map((p) => {
          const terpilih = p.nilai === nilai;
          return (
            <button
              key={p.nilai}
              type="button"
              aria-pressed={terpilih}
              onClick={() => onPilih(p.nilai)}
              className={`flex items-center gap-1.5 rounded-field px-3 py-2 text-sm font-medium transition ${
                terpilih
                  ? "bg-primary-soft text-primary ring-2 ring-primary"
                  : "border border-border text-fg-muted hover:bg-surface-hover"
              }`}
            >
              <span aria-hidden="true">{p.ikon}</span>
              {p.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
