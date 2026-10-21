import type { Route } from "./+types/tokens";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Design Token — LMS PAUD" },
    { name: "description", content: "Pratinjau palet warna & token tema LMS PAUD." },
  ];
}

const ramps = [
  { name: "brand", note: "Warna utama — tombol, link, header" },
  { name: "sun", note: "Aksen ceria — highlight, peran Ortu" },
  { name: "leaf", note: "Positif — hadir, berhasil" },
  { name: "blossom", note: "Negatif — alpa, error, hapus" },
  { name: "sky", note: "Informasi — sakit, tautan sekunder" },
  { name: "grape", note: "Peran Admin, modul rapor" },
  { name: "sand", note: "Netral hangat — background, border, teks" },
] as const;

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const semantics = [
  { label: "primary", bg: "bg-primary", fg: "text-fg-on-brand" },
  { label: "accent", bg: "bg-accent", fg: "text-fg-on-accent" },
  { label: "success", bg: "bg-success", fg: "text-fg-on-strong" },
  { label: "warning", bg: "bg-warning", fg: "text-fg-on-accent" },
  { label: "danger", bg: "bg-danger", fg: "text-fg-on-strong" },
  { label: "info", bg: "bg-info", fg: "text-fg-on-strong" },
] as const;

const roles = [
  { label: "Admin", dot: "bg-role-admin", chip: "bg-role-admin-soft text-role-admin" },
  { label: "Guru", dot: "bg-role-guru", chip: "bg-role-guru-soft text-role-guru" },
  { label: "Orang Tua", dot: "bg-role-ortu", chip: "bg-role-ortu-soft text-role-ortu" },
] as const;

const attendance = [
  { code: "H", label: "Hadir", chip: "bg-hadir-soft text-hadir" },
  { code: "I", label: "Izin", chip: "bg-izin-soft text-izin" },
  { code: "S", label: "Sakit", chip: "bg-sakit-soft text-sakit" },
  { code: "A", label: "Alpa", chip: "bg-alpa-soft text-alpa" },
] as const;

const stppa = [
  { code: "BB", label: "Belum Berkembang", chip: "bg-stppa-bb text-stppa-bb-fg" },
  { code: "MB", label: "Mulai Berkembang", chip: "bg-stppa-mb text-stppa-mb-fg" },
  { code: "BSH", label: "Berkembang Sesuai Harapan", chip: "bg-stppa-bsh text-stppa-bsh-fg" },
  { code: "BSB", label: "Berkembang Sangat Baik", chip: "bg-stppa-bsb text-stppa-bsb-fg" },
] as const;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface-raised p-5 shadow-card sm:p-6">
      <h2 className="text-lg">{title}</h2>
      {hint && <p className="mt-1 text-sm text-fg-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Tokens() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <span className="inline-flex items-center rounded-pill bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Design System
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl">Token Tema LMS PAUD</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Semua warna didefinisikan di <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-sm">app/app.css</code>.
          Di komponen, pakai token semantik (<code className="text-sm">bg-primary</code>,{" "}
          <code className="text-sm">text-fg-muted</code>) supaya mode terang & gelap ikut otomatis.
        </p>
      </header>

      <div className="space-y-6">
        <Section title="Palet dasar" hint="Ramp mentah 50–950. Dipakai hanya kalau tidak ada token semantik yang cocok.">
          <div className="space-y-4">
            {ramps.map((ramp) => (
              <div key={ramp.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-sm font-semibold">{ramp.name}</h3>
                  <p className="text-xs text-fg-subtle">{ramp.note}</p>
                </div>
                <div className="mt-1.5 flex overflow-hidden rounded-field border border-border">
                  {steps.map((step) => (
                    <div
                      key={step}
                      className="h-10 flex-1"
                      style={{ backgroundColor: `var(--color-${ramp.name}-${step})` }}
                      title={`${ramp.name}-${step}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Token semantik" hint="Berubah nilainya saat tema gelap aktif.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {semantics.map((s) => (
              <div key={s.label} className={`rounded-field ${s.bg} ${s.fg} px-3 py-4`}>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs opacity-80">bg-{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-field bg-surface px-3 py-3 text-sm ring-1 ring-border">surface</div>
            <div className="rounded-field bg-surface-raised px-3 py-3 text-sm ring-1 ring-border">surface-raised</div>
            <div className="rounded-field bg-surface-sunken px-3 py-3 text-sm ring-1 ring-border">surface-sunken</div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-fg">text-fg — teks utama</p>
            <p className="text-fg-muted">text-fg-muted — keterangan</p>
            <p className="text-fg-subtle">text-fg-subtle — placeholder, label kecil</p>
          </div>
        </Section>

        <Section title="Peran pengguna" hint="FR-01 — menu & badge dibedakan per peran.">
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <span key={r.label} className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-medium ${r.chip}`}>
                <span className={`size-2 rounded-pill ${r.dot}`} />
                {r.label}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Status absensi" hint="FR-05 & FR-06 — huruf kodenya selalu ditampilkan, jadi tidak bergantung warna saja.">
          <div className="flex flex-wrap gap-2">
            {attendance.map((a) => (
              <span key={a.code} className={`inline-flex items-center gap-2 rounded-field px-3 py-1.5 text-sm font-medium ${a.chip}`}>
                <span className="font-bold">{a.code}</span>
                {a.label}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Skala capaian STPPA" hint="FR-10 & FR-11 — satu rona, terang ke gelap, karena nilainya berurutan (BB → BSB).">
          <div className="flex flex-wrap gap-2">
            {stppa.map((s) => (
              <span key={s.code} className={`inline-flex items-center gap-2 rounded-field px-3 py-1.5 text-sm font-medium ${s.chip}`}>
                <span className="font-bold">{s.code}</span>
                <span className="opacity-90">{s.label}</span>
              </span>
            ))}
          </div>
        </Section>

        <Section title="Contoh komponen" hint="Bentuk & radius yang akan dipakai di seluruh aplikasi.">
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-field bg-primary px-4 py-2 text-sm font-semibold text-fg-on-brand transition hover:bg-primary-hover">
              Simpan
            </button>
            <button className="rounded-field border border-border-strong bg-surface-raised px-4 py-2 text-sm font-semibold transition hover:bg-surface-hover">
              Batal
            </button>
            <button className="rounded-field bg-danger-soft px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10">
              Hapus
            </button>
            <input
              className="rounded-field border border-border bg-surface-raised px-3 py-2 text-sm placeholder:text-fg-subtle"
              placeholder="Cari nama siswa…"
            />
          </div>
        </Section>
      </div>
    </main>
  );
}
