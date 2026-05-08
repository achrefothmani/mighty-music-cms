"use client";

import { useEffect, useState, use } from "react";
import { getVideoById } from "@/services/videos.service";
import { Video } from "@/lib/types";
import VideoForm from "@/components/videos/VideoForm";

interface EditVideoPageProps {
  params: Promise<{ id: string }>;
}

export default function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await getVideoById(id);
        setVideo(data);
      } catch (error) {
        console.error("Failed to fetch video:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-20 font-mono uppercase tracking-widest text-muted-foreground">
        Video not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Edit Video / {video.title}</h1>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">Update video details and link.</p>
      </div>
      
      <VideoForm initialData={video} />
    </div>
  );
}
