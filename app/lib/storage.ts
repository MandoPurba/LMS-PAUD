/**
 * Pengganti basis data: seed JSON sebagai kondisi awal, perubahan disimpan ke
 * localStorage. Setiap akses dibungkus try/catch karena localStorage bisa tidak
 * tersedia (mode privat, kuota penuh).
 */

const PREFIX = "lms-paud:";

export function baca<T>(kunci: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const mentah = window.localStorage.getItem(PREFIX + kunci);
    return mentah === null ? seed : (JSON.parse(mentah) as T);
  } catch {
    return seed;
  }
}

export function tulis<T>(kunci: string, nilai: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PREFIX + kunci, JSON.stringify(nilai));
    return true;
  } catch {
    // Paling sering: kuota localStorage penuh karena foto base64.
    return false;
  }
}

export function hapus(kunci: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + kunci);
  } catch {
    // diabaikan
  }
}

/**
 * Perkiraan pemakaian localStorage dalam byte. Kuota browser sekitar 5 MB, dan
 * foto base64 cepat menghabiskannya, jadi angka ini ditampilkan ke pengguna.
 * Dihitung dari panjang string karena localStorage menyimpan UTF-16.
 */
export function perkiraanPemakaian(): { byte: number; kuota: number; persen: number } {
  const kuota = 5 * 1024 * 1024;
  if (typeof window === "undefined") return { byte: 0, kuota, persen: 0 };

  try {
    let byte = 0;
    for (const kunci of Object.keys(window.localStorage)) {
      if (!kunci.startsWith(PREFIX)) continue;
      byte += (kunci.length + (window.localStorage.getItem(kunci)?.length ?? 0)) * 2;
    }
    return { byte, kuota, persen: Math.min(100, Math.round((byte / kuota) * 100)) };
  } catch {
    return { byte: 0, kuota, persen: 0 };
  }
}

/** Kembalikan seluruh data ke kondisi seed. Dipakai saat demo. */
export function resetSemua(): void {
  if (typeof window === "undefined") return;
  try {
    const kunci = Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX));
    kunci.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // diabaikan
  }
}
