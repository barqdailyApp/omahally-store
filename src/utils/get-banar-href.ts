import { paths } from "@/routes/paths";

import { Banar } from "@/types/banars";

export function getBanarHref(banar: Banar): string | null {
  if (!banar.ref_type || !banar.ref_id) return null;
  if (banar.ref_type === "PRODUCT") return `${paths.products}/${banar.ref_id}`;
  if (banar.ref_type === "COLLECTION")
    return `${paths.collections}/${banar.ref_id}`;
  if (banar.ref_type === "SUBCATEGORY") return `/subcategory/${banar.ref_id}`;
  return null;
}
