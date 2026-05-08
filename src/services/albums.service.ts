import { apiFetch } from "@/lib/api";
import { Album } from "@/lib/types";

export interface TrackPayload {
  title: string;
  genre: string;
  youtube_link?: string;
  spotify_link?: string;
}

export interface AlbumPayload {
  title: string;
  genre: string;
  artist_id?: number | null;
  youtube_link?: string;
  spotify_link?: string;
  slug?: string;
  tracks?: TrackPayload[];
}

export async function getAlbums(): Promise<Album[]> {
  return apiFetch<Album[]>("/albums/");
}

export async function getAlbumById(id: string | number): Promise<Album> {
  return apiFetch<Album>(`/albums/${id}`);
}

export async function createAlbum(data: AlbumPayload): Promise<Album> {
  return apiFetch<Album>("/albums/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAlbum(id: string | number, data: Partial<AlbumPayload>): Promise<Album> {
  return apiFetch<Album>(`/albums/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAlbum(id: string | number): Promise<void> {
  return apiFetch<void>(`/albums/${id}`, {
    method: "DELETE",
  });
}

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function uploadAlbumCover(id: string | number, file: File, crop?: CropCoordinates): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  await apiFetch<void>(`/albums/${id}/cover`, {
    method: "POST",
    body: formData,
  });
}

export async function uploadTrackCover(albumId: string | number, trackId: string | number, file: File, crop?: CropCoordinates): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  await apiFetch<void>(`/albums/${albumId}/tracks/${trackId}/cover`, {
    method: "POST",
    body: formData,
  });
}
