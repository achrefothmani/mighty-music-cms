"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Album } from "@/lib/types";
import { getAlbumById } from "@/services/albums.service";
import AlbumForm from "@/components/albums/AlbumForm";

export default function EditAlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await getAlbumById(id as string);
        setAlbum(data);
      } catch (error) {
        console.error("Failed to fetch album:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchAlbum();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">
        Edit Album / {album?.title}
      </h1>
      <AlbumForm initialData={album} />
    </div>
  );
}
