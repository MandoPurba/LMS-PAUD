import { useState } from "react";
import { Form, redirect, useSearchParams } from "react-router";

import type { Route } from "./+types/login";
import { Ikon } from "../components/Ikon";
import { LABEL_ROLE } from "../lib/menu";
import { ambilSesi, berandaRole, login } from "../lib/session";

export function meta() {
  return [
    { title: "Masuk — LMS TK/PAUD" },
    { name: "description", content: "Masuk ke LMS TK/PAUD Tunas Harapan." },
  ];
}

const AKUN_DEMO = [
  { role: "admin" as const, email: "admin@paud.sch.id", password: "admin123" },
  { role: "guru" as const, email: "sari@paud.sch.id", password: "guru123" },
  { role: "ortu" as const, email: "rina@gmail.com", password: "ortu123" },
];

export function clientLoader() {
  const sesi = ambilSesi();
  if (sesi) throw redirect(berandaRole(sesi.role));
  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const data = await request.formData();
  const email = String(data.get("email") ?? "");
  const password = String(data.get("password") ?? "");
  const next = String(data.get("next") ?? "");

  if (!email.trim() || !password) {
    return { pesan: "Email dan password wajib diisi." };
  }

  const hasil = login(email, password);
  if (!hasil.ok) return { pesan: hasil.pesan };

  throw redirect(next || berandaRole(hasil.sesi.role));
}

export default function Login({ actionData }: Route.ComponentProps) {
  const [params] = useSearchParams();
  const next = params.get("next") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Ikon nama="school" className="text-4xl text-primary" />
          <h1 className="mt-2 text-2xl">LMS TK/PAUD</h1>
          <p className="text-sm text-fg-muted">Tunas Harapan</p>
        </div>

        <Form
          method="post"
          className="mt-6 rounded-card border border-border bg-surface-raised p-5 shadow-card"
        >
          <input type="hidden" name="next" value={next} />

          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
            placeholder="nama@paud.sch.id"
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-field border border-border bg-surface px-3 py-2 text-sm placeholder:text-fg-subtle"
            placeholder="••••••••"
          />

          {actionData?.pesan && (
            <p
              role="alert"
              className="mt-4 rounded-field bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
            >
              {actionData.pesan}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-field bg-primary px-4 py-2.5 text-sm font-semibold text-fg-on-brand transition hover:bg-primary-hover"
          >
            Masuk
          </button>
        </Form>

        <div className="mt-5 rounded-card border border-border border-dashed p-4">
          <p className="text-xs font-semibold text-fg-muted">Akun demo — klik untuk mengisi</p>
          <div className="mt-2 space-y-1.5">
            {AKUN_DEMO.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                }}
                className="flex w-full items-center gap-2 rounded-field px-2 py-1.5 text-left text-xs transition hover:bg-surface-hover"
              >
                <span className="w-24 shrink-0 font-semibold">{LABEL_ROLE[a.role]}</span>
                <span className="truncate text-fg-muted">{a.email}</span>
                <span className="ml-auto shrink-0 text-fg-subtle">{a.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
