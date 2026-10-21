import type { Config } from "@react-router/dev/config";

export default {
  // SPA: seluruh state aplikasi ada di browser (localStorage), tanpa backend.
  ssr: false,
} satisfies Config;
