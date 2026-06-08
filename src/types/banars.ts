export interface Banar {
  id: string;
  banar: string;
  started_at: string;
  ended_at: string;
  is_active: boolean;
  is_popup: boolean;
  ref_type?: "product" | "collection" | "subcategory";
  ref_id?: string;
}
