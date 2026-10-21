/**
 * Kompresi foto di sisi klien (NFR-09).
 *
 * NFR-09 meminta foto maksimal 1 MB. Target di sini jauh di bawah itu karena
 * foto disimpan sebagai base64 di localStorage yang kuotanya hanya sekitar 5 MB
 * dan base64 membengkakkan ukuran ~33%. Dengan sisi terpanjang 1280 px dan mutu
 * JPEG menurun bertahap, foto kamera ponsel biasanya jadi 150–400 KB.
 */

export const SISI_MAKS = 1280;
export const TARGET_BYTE = 400 * 1024;
export const BATAS_NFR = 1024 * 1024;
export const MAKS_FOTO = 2;

export const JENIS_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"];

/** Perkiraan ukuran byte dari panjang data URL base64. */
export function byteDataUrl(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function formatByte(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}

function muatGambar(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((selesai, gagal) => {
    const img = new Image();
    img.onload = () => selesai(img);
    img.onerror = () => gagal(new Error("Berkas tidak dapat dibaca sebagai gambar."));
    img.src = dataUrl;
  });
}

function bacaBerkas(file: File): Promise<string> {
  return new Promise((selesai, gagal) => {
    const pembaca = new FileReader();
    pembaca.onload = () => selesai(String(pembaca.result));
    pembaca.onerror = () => gagal(new Error("Berkas gagal dibaca."));
    pembaca.readAsDataURL(file);
  });
}

export type HasilKompresi = {
  dataUrl: string;
  byteAsli: number;
  byteAkhir: number;
};

export async function kompresFoto(file: File): Promise<HasilKompresi> {
  if (!JENIS_DIIZINKAN.includes(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WebP.");
  }

  const asli = await bacaBerkas(file);
  const img = await muatGambar(asli);

  const skala = Math.min(1, SISI_MAKS / Math.max(img.width, img.height));
  const lebar = Math.max(1, Math.round(img.width * skala));
  const tinggi = Math.max(1, Math.round(img.height * skala));

  const kanvas = document.createElement("canvas");
  kanvas.width = lebar;
  kanvas.height = tinggi;

  const ctx = kanvas.getContext("2d");
  if (!ctx) throw new Error("Peramban tidak mendukung kompresi foto.");
  ctx.drawImage(img, 0, 0, lebar, tinggi);

  // Turunkan mutu bertahap sampai di bawah target.
  let dataUrl = kanvas.toDataURL("image/jpeg", 0.82);
  for (const mutu of [0.7, 0.6, 0.5, 0.4]) {
    if (byteDataUrl(dataUrl) <= TARGET_BYTE) break;
    dataUrl = kanvas.toDataURL("image/jpeg", mutu);
  }

  const byteAkhir = byteDataUrl(dataUrl);
  if (byteAkhir > BATAS_NFR) {
    throw new Error("Foto masih terlalu besar setelah dikompres. Coba foto lain.");
  }

  return { dataUrl, byteAsli: file.size, byteAkhir };
}
