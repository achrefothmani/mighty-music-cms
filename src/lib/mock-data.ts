import { Artist, Event, Music, News, Partnership, Video, User } from "./types";

export const MOCK_ARTISTS: Artist[] = [
  {
    id: "1",
    full_name: "CYBERPUNK ZERO",
    genre: "PHONK",
    profile_image: "https://images.unsplash.com/photo-1574169208507-84376144848b",
    slug: "cyberpunk-zero",
    bio: "Underground phonk pioneer from the neon streets.",
    spotify_playlist_link: "https://open.spotify.com/playlist/37i9dQZF1EIeZ8uGj9yB2x",
    youtube_video_list: ["https://youtube.com/watch?v=123", "https://youtube.com/watch?v=456"],
  },
  {
    id: "2",
    full_name: "LUNA VORTEX",
    genre: "DREAMPACK",
    profile_image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9",
    slug: "luna-vortex",
    bio: "Ethereal soundscapes and heavy bass lines.",
  },
  {
    id: "3",
    full_name: "IRON CLAD",
    genre: "HARDCORE",
    profile_image: "https://images.unsplash.com/photo-1514525253344-a8130a4eaec6",
    slug: "iron-clad",
    bio: "The weight of industrial sound.",
  },
];

export const MOCK_MUSIC: Music[] = [
  {
    id: "1",
    title: "NEON DRIFT",
    genre: "PHONK",
    cover_image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17",
    spotify_link: "https://spotify.com",
    youtube_link: "https://youtube.com",
  },
  {
    id: "2",
    title: "VORTEX SOUL",
    genre: "DREAMPACK",
    cover_image: "https://images.unsplash.com/photo-1619983081563-430f63602796",
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "UNDERGROUND SUMMIT 2026",
    location: "BERLIN / WAREHOUSE 4",
    date_time: "2026-06-15T22:00",
    description: "The ultimate gathering of underground artists.",
    cover_image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
  },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: "1",
    title: "NEON DRIFT OFFICIAL VIDEO",
    youtube_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

export const MOCK_NEWS: News[] = [
  {
    id: "1",
    title: "LABEL EXPANSION",
    description: "Mighty Music is opening new offices in Tokyo.",
    cover_image: "https://images.unsplash.com/photo-1449156059431-789955427505",
  },
];

export const MOCK_PARTNERSHIPS: Partnership[] = [
  {
    id: "1",
    title: "TECH WEAR CO",
    description: "Official apparel partner for all tours.",
    cover_image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@mightymusic.com",
    full_name: "DIRECTOR",
    is_active: true,
    is_admin: true,
  },
  {
    id: "2",
    email: "manager@mightymusic.com",
    full_name: "A&R MANAGER",
    is_active: true,
    is_admin: false,
  },
];
