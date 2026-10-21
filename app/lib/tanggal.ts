/**
 * Helper tanggal. Semua memakai zona waktu lokal, bukan UTC.
 *
 * `new Date().toISOString().slice(0, 10)` salah untuk keperluan ini: di WIB
 * (UTC+7), sebelum pukul 07.00 ISO masih menunjukkan tanggal kemarin. Absensi
 * "hari ini" karena itu bisa tercatat di tanggal yang keliru.
 */

/** Tanggal lokal dalam format yyyy-mm-dd. */
export function tanggalLokal(d = new Date()): string {
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

/** Mis. "Rabu, 21 Oktober 2026". */
export function tanggalPanjang(d: Date | string = new Date()): string {
  const tgl = typeof d === "string" ? new Date(`${d}T00:00:00`) : d;
  if (Number.isNaN(tgl.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(tgl);
}

/** Mis. "21 Okt 2026". */
export function tanggalPendek(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Mis. "4 th 7 bln". */
export function usia(iso: string): string {
  const lahir = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(lahir.getTime())) return "—";

  const kini = new Date();
  let bulan =
    (kini.getFullYear() - lahir.getFullYear()) * 12 + (kini.getMonth() - lahir.getMonth());
  if (kini.getDate() < lahir.getDate()) bulan -= 1;
  if (bulan < 0) return "—";

  return `${Math.floor(bulan / 12)} th ${bulan % 12} bln`;
}
