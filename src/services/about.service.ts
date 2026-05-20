import { apiFetch } from "@/lib/api";
import { AboutPage } from "@/lib/types";
import { CropCoordinates } from "./singles.service";

export async function getAbout(): Promise<AboutPage> {
  return apiFetch("/about/");
}

export async function updateAbout(data: Partial<AboutPage>): Promise<AboutPage> {
  return apiFetch("/about/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function uploadAboutCover(file: File, crop?: CropCoordinates): Promise<AboutPage> {
  const formData = new FormData();
  formData.append("file", file);
  if (crop) {
    formData.append("crop_x", Math.round(crop.x).toString());
    formData.append("crop_y", Math.round(crop.y).toString());
    formData.append("crop_w", Math.round(crop.width).toString());
    formData.append("crop_h", Math.round(crop.height).toString());
  }
  return apiFetch("/about/cover", {
    method: "POST",
    body: formData,
  });
}

export async function uploadAboutGallery(file: File): Promise<AboutPage> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/about/gallery", {
    method: "POST",
    body: formData,
  });
}
