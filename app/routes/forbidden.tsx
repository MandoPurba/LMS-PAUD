import { Link } from "react-router";

import type { Route } from "./+types/forbidden";
import { Ikon } from "../components/Ikon";
import { LABEL_ROLE } from "../lib/menu";
import { ambilSesi, berandaRole } from "../lib/session";

export function meta() {
  return [{ title: "Akses ditolak — LMS TK/PAUD" }];
}

export function clientLoader() {
  return { sesi: ambilSesi() };
}

export default function Forbidden({ loaderData }: Route.ComponentProps) {
  const { sesi } = loaderData;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-card border border-border bg-surface-raised p-6 text-center shadow-card">
        <Ikon nama="lock" className="text-4xl text-danger" />
        <p className="mt-2 font-display text-5xl font-bold text-danger">403</p>
        <h1 className="mt-2 text-xl">Akses ditolak</h1>
        <p className="mt-2 text-sm text-fg-muted">
          {sesi
            ? `Halaman ini bukan untuk ${LABEL_ROLE[sesi.role]}. Setiap role hanya dapat membuka halamannya sendiri.`
            : "Anda belum masuk. Silakan masuk terlebih dahulu."}
        </p>

        <Link
          to={sesi ? berandaRole(sesi.role) : "/login"}
          className="mt-5 inline-block rounded-field bg-primary px-4 py-2 text-sm font-semibold text-fg-on-brand transition hover:bg-primary-hover"
        >
          {sesi ? "Kembali ke dashboard" : "Ke halaman masuk"}
        </Link>
      </div>
    </main>
  );
}
