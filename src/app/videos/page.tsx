"use client";

import { useState, useEffect } from "react";
import { getVideos, deleteVideo } from "@/services/videos.service";
import { Video } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { Search, ExternalLink, Trash2, Edit, Plus, Video as VideoIcon } from "lucide-react";
import Link from "next/link";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS VIDEO?")) return;
    try {
      await deleteVideo(id);
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH VIDEOS BY TITLE..." 
            className="w-full bg-transparent pl-8 py-2 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/videos/new"
          className="btn-brutalist flex items-center justify-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus size={16} />
          ADD NEW VIDEO
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="card-brutalist p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Title</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">YouTube Link</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map((v) => (
                <tr 
                  key={v.id} 
                  className="group border-b border-border hover:bg-white/5 transition-colors relative"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted-foreground/10 flex items-center justify-center border border-border">
                        <VideoIcon size={20} className="text-muted-foreground" />
                      </div>
                      <span className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{v.title}</span>
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground truncate max-w-xs">
                    <a href={v.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                      {v.youtube_link}
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/videos/${v.id}/edit`}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(v.id)}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState 
          message="NO VIDEOS FOUND" 
          ctaText="＋ ADD NEW VIDEO" 
          onCtaClick={() => window.location.href = "/videos/new"}
        />
      )}
    </div>
  );
}
