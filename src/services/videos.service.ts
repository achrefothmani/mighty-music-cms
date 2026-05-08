import { apiFetch } from "@/lib/api";
import { Video } from "@/lib/types";

export interface VideoPayload {
  title: string;
  youtube_link: string;
  slug?: string;
}

export async function getVideos(): Promise<Video[]> {
  return apiFetch<Video[]>("/videos/");
}

export async function getVideoById(id: string | number): Promise<Video> {
  return apiFetch<Video>(`/videos/${id}`);
}

export async function createVideo(data: VideoPayload): Promise<Video> {
  return apiFetch<Video>("/videos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVideo(id: string | number, data: Partial<VideoPayload>): Promise<Video> {
  return apiFetch<Video>(`/videos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteVideo(id: string | number): Promise<void> {
  return apiFetch<void>(`/videos/${id}`, {
    method: "DELETE",
  });
}
