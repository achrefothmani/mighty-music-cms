import { apiFetch } from "@/lib/api";
import { News } from "@/lib/types";
import { CropCoordinates } from "./singles.service";

export interface NewsPayload {
  title: string;
  description: string;
  slug?: string;
}

export async function getNews(): Promise<News[]> {
  return apiFetch<News[]>("/news/");
}

export async function getNewsById(id: string | number): Promise<News> {
  return apiFetch<News>(`/news/${id}`);
}

export async function createNews(data: NewsPayload): Promise<News> {
  return apiFetch<News>("/news/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateNews(id: string | number, data: Partial<NewsPayload>): Promise<News> {
  return apiFetch<News>(`/news/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteNews(id: string | number): Promise<void> {
  return apiFetch<void>(`/news/${id}`, {
    method: "DELETE",
  });
}

export async function uploadNewsCover(id: string | number, file: File, crop?: CropCoordinates): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  await apiFetch<void>(`/news/${id}/cover-image`, {
    method: "POST",
    body: formData,
  });
}
