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
  if (path.startsWith('http')) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If the path starts with events/ but NOT events/gallery/, it's a cover
  // and according to user it should be under /uploads/events/
  if (cleanPath.startsWith('events/') && !cleanPath.startsWith('events/gallery/')) {
    return `${cleanBaseUrl}/uploads/${cleanPath}`;
  }
  
  // If the path already starts with events/gallery/ or uploads/, just append it to base
  if (cleanPath.startsWith('events/gallery/') || cleanPath.startsWith('uploads/')) {
    return `${cleanBaseUrl}/${cleanPath}`;
  }
  
  // Default fallback for legacy paths
  return `${cleanBaseUrl}/uploads/${cleanPath}`;
}
