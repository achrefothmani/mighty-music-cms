"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Artist } from "@/lib/types";
import { getArtistById } from "@/services/artists.service";
import { ArrowLeft, Edit, ExternalLink, Video, Music, Info, Users } from "lucide-react";
import Link from "next/link";

export default function ArtistViewPage() {
  const { id } = useParams();
  const router = useRouter();
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

  if (!artist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-destructive uppercase tracking-widest">Artist not found</p>
        <Link href="/artists" className="text-[10px] font-mono text-accent hover:underline uppercase">Back to Roster</Link>
      </div>
    );
  }

  const profileImg = artist.profile_image?.startsWith("http") 
    ? artist.profile_image 
    : `/uploads/${artist.profile_image}`;
  
  const coverImg = artist.cover_image?.startsWith("http") 
    ? artist.cover_image 
    : `/uploads/${artist.cover_image}`;

  return (
    <div className="stagger-in space-y-12 pb-20">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/artists" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Roster
        </Link>
        <button 
          onClick={() => router.push(`/artists/${artist.slug || artist.id}/edit`)}
          className="btn-primary flex items-center gap-2 px-6 py-2"
        >
          <Edit size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Edit Profile</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] border border-border overflow-hidden bg-muted-foreground/5 group">
        {artist.cover_image ? (
          <img 
            src={coverImg} 
            alt={artist.full_name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Music size={120} strokeWidth={0.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Profile Overlay */}
        <div className="absolute bottom-0 left-0 p-8 md:p-12 flex flex-col md:flex-row items-end gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-background bg-muted-foreground/10 overflow-hidden shadow-2xl">
            {artist.profile_image ? (
              <img src={profileImg} alt={artist.full_name} className="w-full h-full object-cover grayscale" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <Users size={48} strokeWidth={1} />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2 pb-2">
            <span className="text-[10px] font-mono text-accent border border-accent px-2 py-0.5 uppercase tracking-widest">
              {artist.genre}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">{artist.full_name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Bio & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info size={16} />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Biography</h3>
            </div>
            <div 
              className="prose prose-invert max-w-none text-muted-foreground font-serif leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: artist.bio || "No biography available." }}
            />
          </div>

          {/* YouTube Section */}
          {artist.youtube_video_list && artist.youtube_video_list.length > 0 && (
            <div className="space-y-6 pt-12 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Video size={16} />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Featured Videos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artist.youtube_video_list.map((url, i) => {
                  const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
                  return (
                    <div key={i} className="aspect-video bg-black border border-border group relative overflow-hidden">
                      <iframe 
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                        allowFullScreen
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar / Links */}
        <div className="space-y-8">
          <div className="card-brutalist space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-border pb-4">Digital Presence</h3>
            
            {artist.spotify_playlist_link && (
              <a 
                href={artist.spotify_playlist_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-border hover:border-accent hover:bg-accent/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Music className="text-muted-foreground group-hover:text-accent" size={18} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Spotify Profile</span>
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-accent" />
              </a>
            )}

            <div className="p-4 border border-dashed border-border text-center space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">System ID</p>
              <p className="text-[10px] font-mono font-bold break-all">{artist.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
