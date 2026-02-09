export interface Banner {
  id: string;
  title?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  type?: string;
  status?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface BannerGetParams {
  status?: string;
  type?: string;
  skip?: number;
}
