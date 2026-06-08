export interface Banar {
  id: string;
  banar: string;
  started_at: string;
  ended_at: string;
  is_active: boolean;
  is_popup: boolean;
  ref_type?: "PRODUCT" | "COLLECTION" | "SUBCATEGORY";
  ref_id?: string;
}
