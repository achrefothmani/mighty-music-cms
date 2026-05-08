"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Music } from "@/lib/types";
import { getSingleById } from "@/services/singles.service";
import MusicForm from "@/components/music/MusicForm";

export default function EditMusicPage() {
  const { id } = useParams();
  const [music, setMusic] = useState<Music | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await getSingleById(id as string);
        setMusic(data);
      } catch (error) {
        console.error("Failed to fetch music:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchMusic();
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
        Edit Track / {music?.title}
      </h1>
      <MusicForm initialData={music} />
    </div>
  );
}
