export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  content_images: string[];
  youtube_urls: string[];
  album_id: string | null;
  status: 'published' | 'draft';
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  what_you_learn: string;
  career_prospects: string;
  school_type: 'technikum' | 'branzowa';
  icon_url: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_url: string;
  category: string;
  description: string | null;
  file_size: number | null;
  created_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  position: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  display_order: number;
  is_management: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string | null;
  link_label: string | null;
  display_order: number;
  is_active: boolean;
}

export interface SchoolPageLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface SchoolPageSection {
  heading: string;
  body?: string[];
  links?: SchoolPageLink[];
}

export interface SchoolPageRecord {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  sections: SchoolPageSection[];
  updated_at?: string;
}

export interface SchoolMenuGroup {
  heading: string;
  items: SchoolPageLink[];
}

export interface SchoolMenu {
  id: string;
  groups: SchoolMenuGroup[];
}
