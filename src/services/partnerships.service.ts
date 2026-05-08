import { apiFetch } from "@/lib/api";
import { Partnership } from "@/lib/types";
import { CropCoordinates } from "./singles.service";

export interface PartnershipPayload {
  title: string;
  description: string;
  slug?: string;
}

export async function getPartnerships(): Promise<Partnership[]> {
  return apiFetch<Partnership[]>("/partnerships/");
}

export async function getPartnershipById(id: string | number): Promise<Partnership> {
  return apiFetch<Partnership>(`/partnerships/${id}`);
}

export async function createPartnership(data: PartnershipPayload): Promise<Partnership> {
  return apiFetch<Partnership>("/partnerships/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePartnership(id: string | number, data: Partial<PartnershipPayload>): Promise<Partnership> {
  return apiFetch<Partnership>(`/partnerships/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePartnership(id: string | number): Promise<void> {
  return apiFetch<void>(`/partnerships/${id}`, {
    method: "DELETE",
  });
}

export async function uploadPartnershipCover(id: string | number, file: File, crop?: CropCoordinates): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  await apiFetch<void>(`/partnerships/${id}/cover-image`, {
    method: "POST",
    body: formData,
  });
}
