export interface Section {
  id: string;
  name: string;
  logo: string;
  order_by: number;
  min_order_price: string;
  allowed_roles: string[];
  is_active: boolean;
  delivery_price: string;
  delivery_type: string;
  delivery_type_list: string[];
}

export interface Category {
  id: string;
  category_id: string;
  name: string;
  logo: string;
  order_by: boolean;
  is_active: boolean;
}

export interface CategoryGroup {
  id: string;
  name: string;
  categories: Category[];
}

export interface SubCategoryTab {
  id: string;
  name: string;
}

export interface ProductTag {
  id: string;
  name: string;
}

export interface Product {
  direct_add: boolean;
  section_id: string;
  product_category_price_id: string;
  offer_id: string | null;
  offer_price: string | null;
  offer_quantity: number | null;
  offer_description_ar: string | null;
  offer_description_en: string | null;
  is_quantity_available: boolean;
  warehouse_quantity: number;
  product_id: string;
  product_name: string;
  product_name_en: string;
  product_logo: string;
  product_price_id: string;
  product_price: string;
  barcode?: string | null;
  tags?: ProductTag[];
  min_order_quantity: number;
  max_order_quantity: number;
  product_measurement_id: string;
  measurement_unit_id: string;
  measurement_unit: string;
  measurement_unit_en: string;
  cart_products: any | null;
}

export interface SubCategoryProduct {
  direct_add: boolean;
  product_category_price_id: string;
  offer_id: string | null;
  offer_price: number | null;
  offer_quantity: number | null;
  offer_description: string | null;
  is_quantity_available: boolean;
  warehouse_quantity: number;
  product_id: string;
  barcode?: string | null;
  tags?: ProductTag[];
  product_name: string;
  product_logo: string | null;
  product_class: string;
  product_price_id: string;
  product_price: number;
  min_order_quantity: number;
  max_order_quantity: number;
  product_measurement_id: string;
  measurement_unit_id: string;
  measurement_unit: string;
  product_is_fav: boolean;
  cart_products: any | null;
}

export interface SubCategoryWithProducts {
  subcategory: SubCategoryTab;
  products: SubCategoryProduct[];
}

export interface FullProduct {
  product: {
    section_id: string;
    product_id: string;
    product_name: string;
    product_description: string;
    product_is_fav: boolean;
    is_quantity_available: boolean;
    product_logo: string;
    barcode?: string | null;
    tags?: ProductTag[];
    product_images: string[];
    product_option_groups: ProductOptionGroup[];
    type: "SIMPLE" | "BUNDLE";
    components?: {
      component_id: string;
      component_name: string;
      quantity: number;
    }[];
  };
  product_measurements: ProductMeasurement[];
}
export interface ProductOptionGroup {
  id: string;
  option_group_id: string;
  name: string;
  name_en: string;
  min_selection: number;
  max_selection: number;
  order_by: number;
  options: ProductOption[];
  show_price: boolean;
}
export interface ProductOption {
  id: string;
  option_id: string;
  name: string;
  name_en: string;
  price: string;
  is_default: boolean;
  child_groups?: ProductOptionGroup[];
}
export interface ProductMeasurement {
  product_measurement_id: string;
  conversion_factor: string;
  is_main_unit: boolean;
  measurement_unit: string;
  warehouse_quantity: number;
  min_order_quantity: number;
  max_order_quantity: number;
  offer: null | ProductMeasurementOffer;
  product_category_price: ProductCategoryPrice;
  product_additional_services: ProductAdditionalService[];
  cart_products: any;
}

export interface ProductMeasurementOffer {
  product_category_price_id: string;
  quantity: number;
  description_ar: string;
  description_en: string;
  offer_id: string;
  offer_price: string;
}

export interface ProductCategoryPrice {
  product_category_price_id: string;
  product_price: string;
}

export interface ProductAdditionalService {
  product_additional_service_id: string;
  price: string;
  additional_service: AdditionalService;
}

export interface AdditionalService {
  additional_service_id: string;
  name: string;
}

export interface Brand {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  name: string;
  name_ar: string;
  logo: string;
  order: number;
  is_active: boolean;
}

export interface Offer {
  direct_add: boolean;
  section_id: string;
  product_category_price_id: string;
  category_sub_category_id: string;
  offer_id: string;
  offer_description_ar: string;
  offer_description_en: string;
  offer_price: string;
  is_quantity_available: boolean;
  warehouse_quantity: number;
  product_id: string;
  offer_quantity: number;
  product_name: string;
  product_logo: string;
  product_price_id: string;
  product_price: string;
  barcode?: string | null;
  tags?: ProductTag[];
  min_order_quantity: number;
  max_order_quantity: number;
  product_measurement_id: string;
  measurement_unit_id: string;
  measurement_unit: string;
  cart_products: any;
}

export interface Collection {
  id: string;
  name: string;
  name_ar: string;
  in_header: boolean;
  black_color_view: boolean;
  image: string | null | undefined;
  description: string;
  is_active: boolean;
  order_by: number;
  is_grid: boolean;
  is_banner: boolean;
  is_clickable: boolean;
  size: "SMALL" | "MEDIUM" | "BIG";
}

export interface CollectionWithProducts {
  collection: Collection;
  products: Product[];
  productCount: number;
}
export interface PaginatedCollectionWithProducts {
  collection: Collection;
  products: { data: Product[]; meta: { itemCount: number } };
}
