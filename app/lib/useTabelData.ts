import { useMemo, useState } from "react";

/**
 * Pencarian + paginasi di sisi klien (FR-02). Tidak ada backend, jadi seluruh
 * data memang sudah ada di memori.
 */
export function useTabelData<T>(
  data: T[],
  cocok: (item: T, kueri: string) => boolean,
  perHalaman = 8,
) {
  const [kueri, setKueri] = useState("");
  const [halaman, setHalaman] = useState(1);

  const terfilter = useMemo(() => {
    const q = kueri.trim().toLowerCase();
    return q === "" ? data : data.filter((d) => cocok(d, q));
  }, [data, kueri, cocok]);

  const totalHalaman = Math.max(1, Math.ceil(terfilter.length / perHalaman));
  // Jika hasil filter menyusut, jangan tertinggal di halaman yang sudah kosong.
  const halamanAman = Math.min(halaman, totalHalaman);
  const baris = terfilter.slice((halamanAman - 1) * perHalaman, halamanAman * perHalaman);

  function cariBaru(nilai: string) {
    setKueri(nilai);
    setHalaman(1);
  }

  return {
    kueri,
    cariBaru,
    baris,
    halaman: halamanAman,
    setHalaman,
    totalHalaman,
    total: terfilter.length,
    totalSemua: data.length,
  };
}
