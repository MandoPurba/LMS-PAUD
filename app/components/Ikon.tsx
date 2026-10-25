/**
 * Ikon Font Awesome. Dibungkus satu komponen agar nama kelasnya tidak
 * tersebar di seluruh berkas dan gaya ikon dapat diganti dari satu tempat.
 *
 * Ikon selalu aria-hidden karena di aplikasi ini setiap ikon selalu didampingi
 * label teks atau aria-label pada elemen pembungkusnya.
 */
export function Ikon({
  nama,
  gaya = "solid",
  className,
}: {
  /** Nama ikon tanpa awalan, mis. "house". */
  nama: string;
  gaya?: "solid" | "regular";
  className?: string;
}) {
  return <i aria-hidden="true" className={`fa-${gaya} fa-${nama} ${className ?? ""}`} />;
}
