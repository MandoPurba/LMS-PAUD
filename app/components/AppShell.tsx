import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

import type { Session } from "../data/types";
import type { Peristiwa } from "../lib/notifikasi";
import { logout } from "../lib/session";
import { MENU } from "../lib/menu";
import { Ikon } from "./Ikon";
import { Lonceng } from "./Lonceng";
import { RoleBadge } from "./RoleBadge";

export function AppShell({
  sesi,
  notifikasi,
  children,
}: {
  sesi: Session;
  notifikasi: Peristiwa[];
  children: React.ReactNode;
}) {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const navigate = useNavigate();
  const item = MENU[sesi.role];

  function keluar() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="tanpa-cetak sticky top-0 z-20 border-b border-border bg-surface-raised">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setMenuTerbuka((v) => !v)}
            aria-expanded={menuTerbuka}
            aria-label="Buka menu"
            className="rounded-field border border-border px-2.5 py-1.5 text-sm md:hidden"
          >
            <Ikon nama="bars" />
          </button>

          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold">LMS TK/PAUD</p>
            <p className="truncate text-xs text-fg-subtle">Tunas Harapan</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-medium">{sesi.nama}</p>
              <p className="truncate text-xs text-fg-subtle">{sesi.email}</p>
            </div>
            <Lonceng sesi={sesi} notifikasi={notifikasi} />
            <RoleBadge role={sesi.role} />
            <button
              type="button"
              onClick={keluar}
              className="rounded-field border border-border-strong px-3 py-1.5 text-sm font-semibold transition hover:bg-surface-hover"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="md:flex">
        <nav
          className={`tanpa-cetak ${menuTerbuka ? "block" : "hidden"} border-b border-border bg-surface-raised p-3 md:block md:w-64 md:shrink-0 md:border-b-0 md:border-r`}
          aria-label="Menu utama"
        >
          <ul className="space-y-1">
            {item.map((m) =>
              m.siap ? (
                <li key={m.to}>
                  <NavLink
                    to={m.to}
                    end
                    onClick={() => setMenuTerbuka(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-field px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-primary-soft text-primary"
                          : "text-fg-muted hover:bg-surface-hover hover:text-fg"
                      }`
                    }
                  >
                    <Ikon nama={m.ikon} className="w-4 text-center" />
                    {m.label}
                  </NavLink>
                </li>
              ) : (
                <li key={m.to}>
                  <span
                    title={`Dikerjakan di ${m.fr}`}
                    className="flex items-center gap-2.5 rounded-field px-3 py-2 text-sm text-fg-subtle"
                  >
                    <Ikon nama={m.ikon} className="w-4 text-center opacity-50" />
                    <span className="truncate">{m.label}</span>
                    <span className="ml-auto shrink-0 rounded-pill bg-surface-sunken px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
                      {m.fr}
                    </span>
                  </span>
                </li>
              ),
            )}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
