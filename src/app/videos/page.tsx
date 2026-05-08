"use client";

import { useState } from "react";
import { MOCK_VIDEOS } from "@/lib/mock-data";
import { Video } from "@/lib/types";
import DrawerForm from "@/components/DrawerForm";
import EmptyState from "@/components/EmptyState";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="stagger-in space-y-8">
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {videos.map((video) => {
            const videoId = extractVideoId(video.youtube_link);
            return (
              <div 
                key={video.id} 
                className="card-brutalist p-0 group cursor-pointer hover:border-accent hover:shadow-[0_0_30px_-10px_rgba(225,29,72,0.3)] transition-all"
                onClick={() => {
                  setSelectedVideo(video);
                  setIsDrawerOpen(true);
                }}
              >
                <div className="aspect-video bg-black relative">
                  {videoId ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="absolute inset-0 w-full h-full pointer-events-none grayscale group-hover:grayscale-0 transition-all"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted-foreground uppercase">
                      Invalid Video Link
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-border">
                  <h3 className="text-sm font-mono tracking-[0.2em] font-bold uppercase group-hover:text-accent transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          message="NO VIDEOS FOUND" 
          ctaText="＋ ADD NEW VIDEO" 
          onCtaClick={() => setIsDrawerOpen(true)}
        />
      )}

      <DrawerForm 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedVideo ? `EDIT VIDEO / ${selectedVideo.title}` : "ADD NEW VIDEO"}
      >
        <form id="drawer-form" className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Title</label>
            <input type="text" className="input-brutalist" defaultValue={selectedVideo?.title} placeholder="VIDEO TITLE" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">YouTube Link</label>
            <input type="text" className="input-brutalist" defaultValue={selectedVideo?.youtube_link} placeholder="HTTPS://YOUTUBE.COM/WATCH?V=..." />
          </div>
        </form>
      </DrawerForm>
    </div>
  );
}
