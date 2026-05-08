"use client";

import { useState, useEffect } from "react";
import { Artist } from "@/lib/types";
import { getArtists, deleteArtist } from "@/services/artists.service";
import EmptyState from "@/components/EmptyState";
import { Search, Plus, Edit, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ArtistsPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const data = await getArtists();
      setArtists(data);
    } catch (e) {
      console.error("Failed to fetch artists", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleDelete = async (e: React.MouseEvent, artist: Artist) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`ARE YOU SURE YOU WANT TO DELETE ${artist.full_name}?`)) return;
    try {
      await deleteArtist(artist.id);
      fetchArtists();
    } catch (err) {
      console.error("Failed to delete artist", err);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/artists/${id}/edit`);
  };

  const filteredArtists = artists.filter(a => 
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH ARTISTS BY NAME OR GENRE..." 
            className="w-full bg-transparent pl-8 py-4 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Link href="/artists/new" className="btn-primary flex items-center gap-2 text-[10px] font-bold h-fit py-4">
          <Plus size={16} />
          ADD NEW ARTIST
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center font-mono py-20 animate-pulse-brutalist text-muted-foreground">
          INITIALIZING ROSTER...
        </div>
      ) : filteredArtists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredArtists.map((artist) => (
            <Link 
              key={artist.id} 
              href={`/artists/${artist.slug || artist.id}`}
              className="card-brutalist group p-0 overflow-hidden hover:border-accent transition-all duration-300 flex flex-col h-full"
            >
              <div className="aspect-square bg-muted-foreground/10 overflow-hidden relative">
                {artist.profile_image ? (
                  <img 
                    src={artist.profile_image.startsWith('http') ? artist.profile_image : `/uploads/${artist.profile_image}`} 
                    alt={artist.full_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                    <User size={24} strokeWidth={1} />
                  </div>
                )}

                {/* Action Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => handleEdit(e, artist.slug || artist.id)}
                    className="p-2 bg-background/80 backdrop-blur-sm border border-border hover:border-accent hover:text-accent transition-all"
                    title="Edit Artist"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, artist)}
                    className="p-2 bg-background/80 backdrop-blur-sm border border-border hover:border-destructive hover:text-destructive transition-all"
                    title="Delete Artist"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 pointer-events-none transition-colors duration-300" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-mono border border-accent text-accent px-1.5 py-0.5 tracking-tighter uppercase">
                      {artist.genre}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold tracking-tight uppercase group-hover:text-accent transition-colors line-clamp-1">
                    {artist.full_name}
                  </h3>
                </div>
                <p className="text-[8px] text-muted-foreground mt-2 flex items-center gap-1 group-hover:text-foreground transition-colors uppercase font-mono tracking-widest">
                  View ➔
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState 
          message="NO ARTISTS FOUND" 
          ctaText="＋ ADD NEW ARTIST" 
          onCtaClick={() => router.push("/artists/new")}
        />
      )}
    </div>
  );
}
