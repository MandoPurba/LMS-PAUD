import { useOutletContext } from "react-router";

import { HalamanNotifikasi } from "../../components/HalamanNotifikasi";
import type { KontekAplikasi } from "../app-layout";

export function meta() {
  return [{ title: "Notifikasi — LMS TK/PAUD" }];
}

export default function NotifikasiAdmin() {
  const { sesi, notifikasi } = useOutletContext<KontekAplikasi>();
  return <HalamanNotifikasi sesi={sesi} notifikasi={notifikasi} />;
}
