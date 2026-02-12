export interface Product {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  sku?: string;
  barcode?: string;
  slug?: string;
  price: number;
  sales_price?: number;
  status: string;
  rating?: number;
  images?: string[];
  categories?: string[];
  stock?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductGetParams {
  id?: string;
  sku?: string;
  slug?: string;
  search_term?: string;
  status?: string;
  barcode?: string;
  skip?: number;
  category_id?: string;
}

export interface CategoryGetParams {
  slug?: string;
  is_active?: string;
}

export interface DiscountedProductsParams {
  min_discount?: number;
  max_discount?: number;
  skip?: number;
}
