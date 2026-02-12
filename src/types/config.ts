export interface StoreConfig {
  id: string;
  vat_enabled: boolean;
  vat_rate: number;
  prices_include_tax: boolean;
  currency_code: string;
  created_at: string;
}

export interface StoreInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  created_at: string;
  updated_at: string;
}
