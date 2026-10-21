import type { Role } from "../data/types";
import { LABEL_ROLE, WARNA_ROLE } from "../lib/menu";

export function RoleBadge({ role }: { role: Role }) {
  const warna = WARNA_ROLE[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold ${warna.chip}`}
    >
      <span className={`size-1.5 rounded-pill ${warna.titik}`} />
      {LABEL_ROLE[role]}
    </span>
  );
}
