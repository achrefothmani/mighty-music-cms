import { apiFetch } from "@/lib/api";
import { Music } from "@/lib/types";

export interface SinglePayload {
  title: string;
  genre: string;
  artist_id?: number | null;
  youtube_link?: string;
  spotify_link?: string;
  slug?: string;
}

export async function getSingles(): Promise<Music[]> {
  return apiFetch<Music[]>("/singles/");
}

export async function getSingleById(id: string | number): Promise<Music> {
  return apiFetch<Music>(`/singles/${id}`);
}

export async function createSingle(data: SinglePayload): Promise<Music> {
  return apiFetch<Music>("/singles/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSingle(id: string | number, data: Partial<SinglePayload>): Promise<Music> {
  return apiFetch<Music>(`/singles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSingle(id: string | number): Promise<void> {
  return apiFetch<void>(`/singles/${id}`, {
    method: "DELETE",
  });
}

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function uploadSingleCover(id: string | number, file: File, crop?: CropCoordinates): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_principal", "true");
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  await apiFetch<void>(`/singles/${id}/cover-image`, {
    method: "POST",
    body: formData,
  });
}
