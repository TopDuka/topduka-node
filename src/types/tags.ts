export interface Tag {
  id: string;
  name: string;
  slug: string;
  store_id: string;
  created_at: string;
  updated_at: string;
}

export interface TagGetParams {
  search_term?: string;
}
