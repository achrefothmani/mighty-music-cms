import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    year: date.getFullYear(),
  };
}

export function getMediaUrl(path?: string | null) {
  if (!path) return null;
  
  // Handle tuple-like string if it somehow still exists (backward compatibility)
  let actualPath = path;
  if (typeof path === 'string' && path.startsWith("(") && path.endsWith(")")) {
    const parts = path.substring(1, path.length - 1).split(",");
    if (parts.length > 0) {
      actualPath = parts[0].trim().replace(/^['"]|['"]$/g, '');
    }
  }

  if (actualPath.startsWith('http')) return actualPath;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = actualPath.startsWith('/') ? actualPath.slice(1) : actualPath;
  
  // If the path starts with specific folders but NOT gallery/, it's a cover
  const topFolders = ["events", "news", "artists", "partnerships", "singles", "albums", "tracks", "music", "about"];
  const isTopFolder = topFolders.some(folder => cleanPath.startsWith(`${folder}/`) && !cleanPath.startsWith(`${folder}/gallery/`));

  if (isTopFolder) {
    return `${cleanBaseUrl}/uploads/${cleanPath}`;
  }
  
  // If the path already starts with gallery/ (except about/gallery) or uploads/, just append it to base
  if ((cleanPath.includes('/gallery/') && !cleanPath.startsWith('about/')) || cleanPath.startsWith('uploads/')) {
    return `${cleanBaseUrl}/${cleanPath}`;
  }
  
  // Default fallback for legacy paths
  return `${cleanBaseUrl}/uploads/${cleanPath}`;
}
