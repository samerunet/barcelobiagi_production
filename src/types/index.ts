export type Language = 'ru' | 'en';

export interface ProductImage {
  id?: string;
  imageKey: string;
  url?: string;
  isMain?: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  id?: string;
  label: string;
  sku?: string;
  stock?: number;
  price?: number;
}

export interface ProductTag {
  id?: string;
  slug: string;
  labelRu: string;
  labelEn: string;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name_ru: string;
  name_en: string;
  description_ru: string;
  description_en: string;
  price: number;
  old_price?: number | null;
  currency: string;
  images: Array<string | ProductImage>;
  category: string;
  categoryId?: string;
  status?: 'ACTIVE' | 'HIDDEN';
  featured?: boolean;
  tags: Array<string | ProductTag>;
  stock_total: number;
  stock_low_threshold: number;
  sizes?: ProductSize[];
  variants?: ProductVariant[];
  material_ru?: string;
  material_en?: string;
  color_ru?: string;
  color_en?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  items: CartItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  total: number;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  postal_code: string;
  delivery_method: 'courier' | 'pickup';
}

export interface PaymentInfo {
  method: 'card' | 'cash_on_delivery';
}

export interface Translations {
  ru: Record<string, string>;
  en: Record<string, string>;
}
