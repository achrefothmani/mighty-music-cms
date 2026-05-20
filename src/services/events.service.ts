import { apiFetch } from "@/lib/api";
import { Event, CoverItem } from "@/lib/types";
import { CropCoordinates } from "./singles.service";

export interface EventPayload {
  title: string;
  location: string;
  date_time: string;
  description: string;
  lien_booking?: string;
  contact?: string[];
  slug?: string;
  covers?: CoverItem[];
}

export async function getEvents(): Promise<Event[]> {
  return apiFetch<Event[]>("/events/");
}

export async function getEventById(id: string | number): Promise<Event> {
  return apiFetch<Event>(`/events/${id}`);
}

export async function createEvent(data: EventPayload): Promise<Event> {
  return apiFetch<Event>("/events/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string | number, data: Partial<EventPayload>): Promise<Event> {
  return apiFetch<Event>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string | number): Promise<void> {
  return apiFetch<void>(`/events/${id}`, {
    method: "DELETE",
  });
}

export async function uploadEventCover(id: string | number, file: File, label: string = "Hero cover", isPrincipal: boolean = true, crop?: CropCoordinates): Promise<Event> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  formData.append("is_principal", isPrincipal.toString());
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  return apiFetch<Event>(`/events/${id}/cover-image`, {
    method: "POST",
    body: formData,
  });
}

export async function uploadEventGallery(id: string | number, files: File[]): Promise<Event> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  return apiFetch<Event>(`/events/${id}/gallery`, {
    method: "POST",
    body: formData,
  });
}

export async function removeEventGalleryFile(id: string | number, fileName: string): Promise<Event> {
  return apiFetch<Event>(`/events/${id}/gallery?file_name=${encodeURIComponent(fileName)}`, {
    method: "DELETE",
  });
}
