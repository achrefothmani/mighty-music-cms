"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Music, Artist } from "@/lib/types";
import { getArtists } from "@/services/artists.service";
import { createSingle, updateSingle, deleteSingle, uploadSingleCover, CropCoordinates } from "@/services/singles.service";
import { Trash2, ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import ImageCropper from "@/components/ImageCropper";
import { PixelCrop } from "react-image-crop";
import { getMediaUrl } from "@/lib/utils";

interface MusicFormProps {
  initialData?: Music | null;
}

const GENRES = [
  "ELECTRONIC", "TECHNO", "HOUSE", "TRANCE", "DEEP HOUSE", 
  "INDIE DANCE", "DANCE", "PHONK", "RAP", "HIP HOP", "TRAP", "AMBIENT",
  "MEZOUED", "RAI", "JAZZ", "POP", "R&B", "ROCK"
].sort();

export default function MusicForm({ initialData }: MusicFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);

  // Image States
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    getMediaUrl(initialData?.original_cover_image || initialData?.cover_image)
  );

  // Crop States
  const [activeCrop, setActiveCrop] = useState<{ src: string } | null>(null);
  const [coverCropCoords, setCoverCropCoords] = useState<CropCoordinates | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await getArtists();
        setArtists(data);
      } catch (err) {
        console.error("Failed to fetch artists", err);
      }
    };
    fetchArtists();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveCrop({ src: reader.result as string });
        setCoverFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (pixelCrop: PixelCrop) => {
    const coords: CropCoordinates = {
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height
    };

    setCoverCropCoords(coords);
    if (activeCrop) setCoverPreview(activeCrop.src);
    setActiveCrop(null);
  };

  const handleDelete = async () => {
    if (!initialData || !confirm(`ARE YOU SURE YOU WANT TO DELETE THIS TRACK?`)) return;
    
    try {
      setIsSubmitting(true);
      await deleteSingle(initialData.id);
      router.push("/music");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
      setError("FAILED TO DELETE TRACK");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const artistId = formData.get("artist_id");
    
    const payload = {
      title,
      genre: formData.get("genre") as string,
      artist_id: artistId ? parseInt(artistId as string) : null,
      spotify_link: formData.get("spotify_link") as string,
      youtube_link: formData.get("youtube_link") as string,
    };
    
    try {
      setIsSubmitting(true);
      let music: Music;
      if (initialData) {
        music = await updateSingle(initialData.id, payload);
      } else {
        music = await createSingle({
          ...payload,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
      }

      if (coverFile) {
        await uploadSingleCover(music.id, coverFile, coverCropCoords || undefined);
      }

      router.push("/music");
      router.refresh();
    } catch (err) {
      console.error("Failed to save", err);
      setError(`FAILED TO ${initialData ? "UPDATE" : "CREATE"} TRACK`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {activeCrop && (
        <ImageCropper 
          imageSrc={activeCrop.src} 
          onCropComplete={onCropComplete}
          onCancel={() => setActiveCrop(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <Link 
          href="/music" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Tracks
        </Link>
        
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={isSubmitting}
            className="flex items-center gap-2 text-[10px] font-mono text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Delete Track
          </button>
        )}
      </div>

      <div className="card-brutalist stagger-in">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Basic Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Track Title</label>
                  <input name="title" type="text" className="input-brutalist text-xl" defaultValue={initialData?.title} placeholder="E.G. NEON DRIFT" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Artist</label>
                  <select name="artist_id" className="input-brutalist bg-background" defaultValue={initialData?.artist_id || ""}>
                    <option value="">SELECT ARTIST (OPTIONAL)...</option>
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Genre</label>
                    <select name="genre" className="input-brutalist bg-background" defaultValue={initialData?.genre} required>
                      <option value="" disabled>SELECT GENRE...</option>
                      {GENRES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Spotify Link</label>
                    <input name="spotify_link" type="text" className="input-brutalist" defaultValue={initialData?.spotify_link} placeholder="HTTPS://OPEN.SPOTIFY.COM/..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">YouTube Link</label>
                  <input name="youtube_link" type="text" className="input-brutalist" defaultValue={initialData?.youtube_link} placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=..." />
                </div>
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cover Image (1:1)</label>
                  <button 
                    type="button" 
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase"
                  >
                    <Upload size={12} />
                    Import
                  </button>
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="border-2 border-dashed border-border aspect-square overflow-hidden bg-muted-foreground/5 relative group cursor-pointer hover:border-accent transition-colors flex items-center justify-center" onClick={() => coverInputRef.current?.click()}>
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover transition-all duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-accent transition-colors">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Select Cover Image</span>
                    </div>
                  )}
                  {(coverFile || coverCropCoords) && (
                    <div className="absolute bottom-4 right-4 bg-accent text-white text-[8px] font-mono px-2 py-1 uppercase">
                      {coverCropCoords ? "Cropped" : "Selected"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-mono uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="pt-8 border-t border-border flex justify-end">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-3 px-12 py-4">
              <Save size={18} />
              <span className="text-sm font-bold tracking-[0.1em]">
                {isSubmitting ? "PROCESSING..." : (initialData ? "UPDATE TRACK" : "RELEASE TRACK")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
