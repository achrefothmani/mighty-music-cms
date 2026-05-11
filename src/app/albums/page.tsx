"use client";

import { useState, useEffect } from "react";
import { getAlbums, deleteAlbum } from "@/services/albums.service";
import { Album } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { Search, Trash2, Edit, Plus, Disc } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const data = await getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS ALBUM?")) return;
    try {
      await deleteAlbum(id);
      setAlbums(albums.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete album:", error);
    }
  };

  const filteredAlbums = albums.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.genre?.toLowerCase().includes(search.toLowerCase()) ||
    a.artist_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH ALBUMS BY TITLE, GENRE OR ARTIST..." 
            className="w-full bg-transparent pl-8 py-2 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/albums/new"
          className="btn-brutalist flex items-center justify-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus size={16} />
          ADD NEW ALBUM
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : filteredAlbums.length > 0 ? (
        <DataTable
          columns={[
            { label: "Album" },
            { label: "Artist" },
            { label: "Tracks" },
            { label: "Actions", align: "right" }
          ]}
        >
          {filteredAlbums.map((a) => (
            <tr 
              key={a.id} 
              className="group border-b border-border hover:bg-white/5 transition-colors relative"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted-foreground/10 overflow-hidden border border-border">
                    {a.cover_image && (
                      <img 
                        src={getMediaUrl(a.cover_image) || ""} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Link href={`/albums/${a.id}`} className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">
                      {a.title}
                    </Link>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{a.genre}</span>
                  </div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-mono uppercase text-muted-foreground">{a.artist_name || "UNKNOWN"}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Disc size={14} />
                  {a.tracks?.length || 0} TRACKS
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link 
                    href={`/albums/${a.id}/edit`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    <Edit size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState 
          message="NO ALBUMS FOUND" 
          ctaText="＋ ADD NEW ALBUM" 
          onCtaClick={() => window.location.href = "/albums/new"}
        />
      )}
    </div>
  );
}
