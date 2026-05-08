"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ArtistForm from "@/components/artists/ArtistForm";
import { Artist } from "@/lib/types";
import { getArtistById } from "@/services/artists.service";

export default function EditArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArtist();
    }
  }, [id]);

  const fetchArtist = async () => {
    try {
      setIsLoading(true);
      const data = await getArtistById(id as string);
      setArtist(data);
    } catch (err) {
      console.error("Failed to fetch artist", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-muted-foreground animate-pulse">
        LOADING ARTIST DATA...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">
        Update Artist / {artist?.full_name}
      </h1>
      <ArtistForm initialData={artist} />
    </div>
  );
}
