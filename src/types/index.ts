export type Language = "ar" | "en";

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ProductSpec {
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  attribute_type: string; // e.g. "weight", "grind", "size"
  attribute_value_ar: string;
  attribute_value_en: string;
  price_override: number | null;
  is_default: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  short_description_ar: string | null;
  short_description_en: string | null;
  specs: ProductSpec[];
  base_price: number;
  image_url_1: string;
  image_url_2: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  variants?: ProductVariant[];
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string | null;
  variant_id: string | null;
  name_snapshot: string;
  variant_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  governorate: string;
  address_details: string;
  subtotal: number;
  deposit_percentage: number;
  deposit_amount: number;
  status: OrderStatus;
  coupon_code: string | null;
  discount_amount: number;
  customer_user_id?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
}

export interface SiteSettings {
  id: number;
  deposit_percentage: number;
  whatsapp_number: string;
  payment_instructions_ar: string;
  payment_instructions_en: string;
  store_name_ar: string;
  store_name_en: string;
  logo_url: string | null;
  updated_at: string;
}

export interface CartItem {
  id: string; // composite key: productId + variantId
  productId: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantLabelAr?: string;
  variantLabelEn?: string;
}

export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  zone: "cairo_giza" | "delta" | "canal" | "alexandria" | "upper_egypt" | "frontier";
}
