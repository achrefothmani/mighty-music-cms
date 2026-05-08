"use client";

import { useState, useEffect } from "react";
import { getSingles, deleteSingle } from "@/services/singles.service";
import { Music } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { Search, ExternalLink, Trash2, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

export default function MusicPage() {
  const [music, setMusic] = useState<Music[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const data = await getSingles();
      setMusic(data);
    } catch (error) {
      console.error("Failed to fetch music:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS TRACK?")) return;
    try {
      await deleteSingle(id);
      setMusic(music.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to delete music:", error);
    }
  };

  const filteredMusic = music.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.genre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH TRACKS BY TITLE OR GENRE..." 
            className="w-full bg-transparent pl-8 py-2 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/music/new"
          className="btn-brutalist flex items-center justify-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus size={16} />
          ADD NEW TRACK
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : filteredMusic.length > 0 ? (
        <div className="card-brutalist p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Title</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Genre</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Links</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMusic.map((m) => (
                <tr 
                  key={m.id} 
                  className="group border-b border-border hover:bg-white/5 transition-colors relative"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted-foreground/10 overflow-hidden border border-border">
                        {m.cover_image && (
                          <img 
                            src={getMediaUrl(m.cover_image) || ""} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <span className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{m.title}</span>
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase">{m.genre}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      {m.spotify_link && (
                        <a href={m.spotify_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {m.youtube_link && (
                        <a href={m.youtube_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                          <YoutubeIcon size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/music/${m.id}/edit`}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(m.id)}
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
          message="NO TRACKS FOUND" 
          ctaText="＋ ADD NEW TRACK" 
          onCtaClick={() => window.location.href = "/music/new"}
        />
      )}
    </div>
  );
}

function YoutubeIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}
