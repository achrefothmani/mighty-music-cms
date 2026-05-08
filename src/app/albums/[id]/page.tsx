"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Album } from "@/lib/types";
import { getAlbumById } from "@/services/albums.service";
import { ArrowLeft, Edit, ExternalLink, Disc, Youtube } from "lucide-react";
import Link from "next/link";

export default function AlbumDetailPage() {
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

  if (!album) return <div className="p-20 text-center font-mono uppercase tracking-widest">ALBUM NOT FOUND</div>;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="space-y-12 stagger-in">
      <div className="flex items-center justify-between">
        <Link 
          href="/albums" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Albums
        </Link>
        
        <Link 
          href={`/albums/${album.id}/edit`}
          className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase tracking-widest"
        >
          <Edit size={14} />
          Edit Album
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Album Cover */}
        <div className="w-full md:w-80 lg:w-96">
          <div className="card-brutalist p-0 aspect-square overflow-hidden">
            {album.cover_image ? (
              <img 
                src={album.cover_image.startsWith('http') ? album.cover_image : `${API_URL}${album.cover_image}`} 
                alt={album.title} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
              />
            ) : (
              <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                <Disc size={64} className="text-muted-foreground/20" />
              </div>
            )}
          </div>
        </div>

        {/* Album Info */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">{album.title}</h1>
            <p className="text-accent font-mono tracking-[0.3em] uppercase">{album.artist_name || "UNKNOWN ARTIST"}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-border px-4 py-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Genre</span>
              <span className="font-bold uppercase">{album.genre}</span>
            </div>
            <div className="bg-white/5 border border-border px-4 py-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Tracks</span>
              <span className="font-bold uppercase">{album.tracks?.length || 0} TRACKS</span>
            </div>
          </div>

          <div className="flex gap-4">
            {album.spotify_link && (
              <a href={album.spotify_link} target="_blank" rel="noopener noreferrer" className="btn-brutalist px-6 py-3 flex items-center gap-2 bg-green-600/10 text-green-500 border-green-600/50 hover:bg-green-600/20">
                <ExternalLink size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Spotify</span>
              </a>
            )}
            {album.youtube_link && (
              <a href={album.youtube_link} target="_blank" rel="noopener noreferrer" className="btn-brutalist px-6 py-3 flex items-center gap-2 bg-red-600/10 text-red-500 border-red-600/50 hover:bg-red-600/20">
                <Youtube size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">YouTube</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-[0.2em] uppercase border-b border-border pb-4 flex items-center gap-4">
          <Disc className="text-accent" />
          Tracklist
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {album.tracks?.sort((a, b) => a.track_number - b.track_number).map((track, i) => (
            <div key={track.id} className="group flex items-center gap-6 p-4 border border-border hover:bg-white/5 transition-all relative">
              <div className="text-2xl font-mono text-muted-foreground/30 font-black italic w-8 text-right">
                {(i + 1).toString().padStart(2, '0')}
              </div>
              
              <div className="w-12 h-12 bg-muted-foreground/5 overflow-hidden border border-border flex-shrink-0">
                {track.cover_image ? (
                  <img src={track.cover_image.startsWith('http') ? track.cover_image : `${API_URL}${track.cover_image}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Disc size={24} className="m-auto text-muted-foreground/20 h-full" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold uppercase tracking-tight group-hover:text-accent transition-colors">{track.title}</h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">{track.genre}</p>
              </div>

              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {track.spotify_link && (
                  <a href={track.spotify_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                    <ExternalLink size={16} />
                  </a>
                )}
                {track.youtube_link && (
                  <a href={track.youtube_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                    <Youtube size={16} />
                  </a>
                )}
              </div>
              
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
