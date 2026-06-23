export type Category =
  | 'siyaset'
  | 'ekonomi'
  | 'spor'
  | 'teknoloji'
  | 'dünya'
  | 'sağlık'
  | 'kültür'
  | 'gündem';

export interface Article {
  id: number;
  title: string;
  summary: string;
  original_url: string;
  source_name: string;
  category: Category;
  keywords: string[];
  published_at: string;
  image_url: string | null;
  is_read: boolean;
  is_saved: boolean;
  read_at: string | null;
}

export interface Source {
  id: number;
  name: string;
  rss_url: string;
  category: Category;
}

export interface SummaryResult {
  summary: string;
  category: Category;
  keywords: string[];
}
