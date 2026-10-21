import { useEffect } from "react";

export function Modal({
  judul,
  terbuka,
  onTutup,
  children,
}: {
  judul: string;
  terbuka: boolean;
  onTutup: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!terbuka) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onTutup();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [terbuka, onTutup]);

  if (!terbuka) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onTutup}
        className="absolute inset-0 bg-overlay"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-card bg-surface-raised p-5 shadow-pop sm:rounded-card"
      >
        <div className="mb-4 flex items-start gap-3">
          <h2 className="flex-1 text-lg">{judul}</h2>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="rounded-field px-2 py-1 text-fg-muted transition hover:bg-surface-hover"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
