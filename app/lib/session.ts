import seedUsers from "../data/seed/users.json";
import type { Role, Session, User } from "../data/types";
import { baca, hapus, tulis } from "./storage";

const KUNCI_SESI = "sesi";
const KUNCI_USERS = "users";

/** Daftar user: dari localStorage bila sudah pernah diubah, kalau belum dari seed. */
export function daftarUser(): User[] {
  return baca<User[]>(KUNCI_USERS, seedUsers as User[]);
}

export type HasilLogin = { ok: true; sesi: Session } | { ok: false; pesan: string };

/**
 * NFR-03 belum terpenuhi: password dicocokkan sebagai teks biasa karena tidak
 * ada backend. Di implementasi nyata, bandingkan hash bcrypt di sisi server.
 */
export function login(email: string, password: string): HasilLogin {
  const user = daftarUser().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user || user.password !== password) {
    return { ok: false, pesan: "Email atau password salah." };
  }
  if (!user.aktif) {
    return { ok: false, pesan: "Akun ini tidak aktif. Hubungi admin sekolah." };
  }

  const sesi: Session = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
    masukPada: new Date().toISOString(),
  };
  tulis(KUNCI_SESI, sesi);
  return { ok: true, sesi };
}

export function ambilSesi(): Session | null {
  return baca<Session | null>(KUNCI_SESI, null);
}

export function logout(): void {
  hapus(KUNCI_SESI);
}

/** Halaman awal tiap role setelah login. */
export function berandaRole(role: Role): string {
  return `/${role}`;
}

/** Role yang dibutuhkan untuk sebuah path, dari segmen pertamanya. */
export function roleUntukPath(pathname: string): Role | null {
  const segmen = pathname.split("/").filter(Boolean)[0];
  return segmen === "admin" || segmen === "guru" || segmen === "ortu" ? segmen : null;
}
