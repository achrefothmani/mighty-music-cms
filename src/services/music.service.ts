import { apiFetch } from "@/lib/api";
import { Music } from "@/lib/types";

export interface MusicPayload {
  title: string;
  genre: string;
  artist_id?: number | null;
  youtube_link?: string;
  spotify_link?: string;
  slug?: string;
}

export async function getMusic(): Promise<Music[]> {
  return apiFetch<Music[]>("/music/");
}

export async function getMusicById(id: string | number): Promise<Music> {
  return apiFetch<Music>(`/music/${id}`);
}

export async function createMusic(data: MusicPayload): Promise<Music> {
  return apiFetch<Music>("/music/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMusic(id: string | number, data: Partial<MusicPayload>): Promise<Music> {
  return apiFetch<Music>(`/music/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMusic(id: string | number): Promise<void> {
  return apiFetch<void>(`/music/${id}`, {
    method: "DELETE",
  });
}

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function uploadMusicCover(id: string | number, file: File, crop?: CropCoordinates): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  await apiFetch<void>(`/music/${id}/cover`, {
    method: "POST",
    body: formData,
  });
}
