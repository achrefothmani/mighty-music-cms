import { apiFetch } from "@/lib/api";
import { Artist } from "@/lib/types";

export interface ArtistCreate {
  full_name: string;
  genre: string;
  bio?: string;
  profile_image?: string;
  spotify_playlist_link?: string;
  slug: string;
}

export async function getArtists(): Promise<Artist[]> {
  return apiFetch<Artist[]>("/artists/");
}

export async function getArtistById(id: string | number): Promise<Artist> {
  return apiFetch<Artist>(`/artists/${id}`);
}

export async function createArtist(data: ArtistCreate): Promise<Artist> {
  return apiFetch<Artist>("/artists/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArtist(id: string | number, data: Partial<ArtistCreate>): Promise<Artist> {
  return apiFetch<Artist>(`/artists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteArtist(id: string | number): Promise<void> {
  return apiFetch<void>(`/artists/${id}`, {
    method: "DELETE",
  });
}

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function uploadArtistProfileImage(id: string | number, file: File, crop?: CropCoordinates): Promise<Artist> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  return apiFetch<Artist>(`/artists/${id}/profile-image`, {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
}

export async function uploadArtistCoverImage(id: string | number, file: File, crop?: CropCoordinates): Promise<Artist> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_principal", "true");
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  return apiFetch<Artist>(`/artists/${id}/cover-image`, {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
}
