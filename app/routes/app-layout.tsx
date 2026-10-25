import { Outlet, redirect } from "react-router";

import type { Route } from "./+types/app-layout";
import { AppShell } from "../components/AppShell";
import { PenyediaToast } from "../components/Toast";
import type { Session } from "../data/types";
import { type Peristiwa, notifikasiSaya } from "../lib/notifikasi";
import { ambilSesi, roleUntukPath } from "../lib/session";

export type KontekAplikasi = { sesi: Session; notifikasi: Peristiwa[] };

/**
 * Route guard (FR-01). Berjalan di browser karena aplikasi memakai mode SPA.
 * Belum login  → /login dengan parameter ?next= agar bisa kembali setelah masuk.
 * Role tak cocok → /403.
 */
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { pathname } = new URL(request.url);
  const sesi = ambilSesi();

  if (!sesi) {
    throw redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  const perlu = roleUntukPath(pathname);
  if (perlu !== null && perlu !== sesi.role) {
    throw redirect("/403");
  }

  return { sesi, notifikasi: notifikasiSaya(sesi) };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { sesi, notifikasi } = loaderData;
  return (
    <PenyediaToast>
      <AppShell sesi={sesi} notifikasi={notifikasi}>
        <Outlet context={{ sesi, notifikasi } satisfies KontekAplikasi} />
      </AppShell>
    </PenyediaToast>
  );
}
