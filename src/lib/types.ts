export interface CoverItem {
  url: string;
  original_url?: string;
  label: string;
  is_principal: boolean;
}

export interface GalleryItem {
  url: string;
  original_url?: string;
  type: "image" | "video";
}

export interface Artist {
  covers?: CoverItem[];
  id: string;
  full_name: string;
  genre: string;
  profile_image?: string;
  original_profile_image?: string;
  cover_image?: string;
  original_cover_image?: string;
  slug?: string;
  bio?: string;
  spotify_playlist_link?: string;
  youtube_video_list?: string[];
}

export interface Event {
  covers?: CoverItem[];
  id: string;
  title: string;
  slug?: string;
  location: string;
  date_time: string;
  cover_image?: string;
  original_image?: string;
  description: string;
  lien_booking?: string;
  contact?: string[];
  gallery?: GalleryItem[];
}

export interface Music {
  covers?: CoverItem[];
  id: string;
  title: string;
  genre?: string;
  slug?: string;
  cover_image?: string;
  original_cover_image?: string;
  youtube_link?: string;
  spotify_link?: string;
  artist_id?: number;
}

export interface Track {
  covers?: CoverItem[];
  id: string;
  album_id: number;
  title: string;
  genre: string;
  slug?: string;
  cover_image?: string;
  original_cover_image?: string;
  youtube_link?: string;
  spotify_link?: string;
  track_number: number;
}

export interface Album {
  covers?: CoverItem[];
  id: string;
  title: string;
  genre: string;
  slug?: string;
  cover_image?: string;
  original_cover_image?: string;
  youtube_link?: string;
  spotify_link?: string;
  artist_id?: number;
  artist_name?: string;
  tracks: Track[];
}

export interface News {
  covers?: CoverItem[];
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  original_image?: string;
}

export interface Partnership {
  covers?: CoverItem[];
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  original_image?: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_link: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  avg_duration: string;
  bounce_rate: string;
  total_albums: number;
  total_singles: number;
}

export interface GenreDistribution {
  genre: string;
  count: number;
}

export interface ViewOverTime {
  date: string;
  views: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  genre_distribution: GenreDistribution[];
  views_over_time: ViewOverTime[];
  top_pages: TopPage[];
}

export interface TypographyItem {
  font: string;
  weight: string;
  size: string;
}

export interface SiteConfig {
  id: number;
  typography: {
    [key: string]: TypographyItem;
  };
  branding: {
    primary_color: string;
    accent_color: string;
    logo_url?: string | null;
  };
  socials: {
    [key: string]: string;
  };
  features: {
    [key: string]: boolean;
  };
}

export interface AboutPage {
  id: number;
  title: string;
  subtitle: string;
  description: string | null;
  cover_image: string | null;
  original_image: string | null;
  gallery: string[];
}
