const KELAS_INPUT =
  "mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle";

export function Field({
  label,
  htmlFor,
  error,
  petunjuk,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  petunjuk?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {petunjuk && !error && <p className="mt-1 text-xs text-fg-subtle">{petunjuk}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={KELAS_INPUT} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={KELAS_INPUT} />;
}

export function TombolUtama(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-field bg-primary px-4 py-2 text-sm font-semibold text-fg-on-brand transition hover:bg-primary-hover"
    />
  );
}

export function TombolSekunder(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-field border border-border-strong px-4 py-2 text-sm font-semibold transition hover:bg-surface-hover"
    />
  );
}

export function TombolBahaya(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-field bg-danger px-4 py-2 text-sm font-semibold text-fg-on-strong transition hover:opacity-90"
    />
  );
}

export function PesanGagal({ pesan }: { pesan: string | null }) {
  if (!pesan) return null;
  return (
    <p
      role="alert"
      className="mb-4 rounded-field bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
    >
      {pesan}
    </p>
  );
}
