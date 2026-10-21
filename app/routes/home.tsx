import { redirect } from "react-router";

import { ambilSesi, berandaRole } from "../lib/session";

export function clientLoader() {
  const sesi = ambilSesi();
  throw redirect(sesi ? berandaRole(sesi.role) : "/login");
}

export default function Home() {
  return null;
}
