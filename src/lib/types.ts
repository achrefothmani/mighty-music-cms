export interface Artist {
  id: string;
  full_name: string;
  genre: string;
  profile_image?: string;
  cover_image?: string;
  slug?: string;
  bio?: string;
  spotify_playlist_link?: string;
  youtube_video_list?: string[];
}

export interface Event {
  id: string;
  title: string;
  slug?: string;
  location: string;
  date_time: string;
  cover_image?: string;
  description: string;
}

export interface Music {
  id: string;
  title: string;
  genre?: string;
  slug?: string;
  cover_image?: string;
  youtube_link?: string;
  spotify_link?: string;
  artist_id?: number;
}

export interface Track {
  id: string;
  album_id: number;
  title: string;
  genre: string;
  slug?: string;
  cover_image?: string;
  youtube_link?: string;
  spotify_link?: string;
  track_number: number;
}

export interface Album {
  id: string;
  title: string;
  genre: string;
  slug?: string;
  cover_image?: string;
  youtube_link?: string;
  spotify_link?: string;
  artist_id?: number;
  artist_name?: string;
  tracks: Track[];
}

export interface News {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
}

export interface Partnership {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
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
