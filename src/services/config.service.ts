import { apiFetch } from "../lib/api";
import { SiteConfig } from "@/lib/types";

export async function getConfig(): Promise<SiteConfig> {
  return apiFetch<SiteConfig>("/config/");
}

export async function updateConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  return apiFetch<SiteConfig>("/config/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
