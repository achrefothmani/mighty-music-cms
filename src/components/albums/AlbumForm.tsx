"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Album, Artist } from "@/lib/types";
import { getArtists } from "@/services/artists.service";
import { createAlbum, updateAlbum, deleteAlbum, uploadAlbumCover, uploadTrackCover, AlbumPayload, TrackPayload } from "@/services/albums.service";
import { Trash2, ArrowLeft, Save, Upload, Image as ImageIcon, Plus, X, Disc } from "lucide-react";
import Link from "next/link";
import ImageCropper from "@/components/ImageCropper";
import { PixelCrop } from "react-image-crop";
import { getMediaUrl } from "@/lib/utils";

interface AlbumFormProps {
  initialData?: Album | null;
}

interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GENRES = [
  "ELECTRONIC", "TECHNO", "HOUSE", "TRANCE", "DEEP HOUSE", 
  "INDIE DANCE", "DANCE", "PHONK", "RAP", "HIP HOP", "TRAP", "AMBIENT",
  "MEZOUED", "RAI", "JAZZ", "POP", "R&B", "ROCK"
].sort();

interface TrackFormState extends TrackPayload {
  id?: string;
  file?: File | null;
  preview?: string | null;
  crop?: CropCoordinates | null;
}

export default function AlbumForm({ initialData }: AlbumFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);

  // Album Image States
  const [albumFile, setAlbumFile] = useState<File | null>(null);
  const [albumPreview, setAlbumPreview] = useState<string | null>(
    getMediaUrl(initialData?.original_cover_image || initialData?.cover_image)
  );
  const [albumCrop, setAlbumCrop] = useState<CropCoordinates | null>(null);

  // Tracks State
  const [tracks, setTracks] = useState<TrackFormState[]>(
    initialData?.tracks?.map(t => ({
      id: t.id,
      title: t.title,
      genre: t.genre,
      youtube_link: t.youtube_link || "",
      spotify_link: t.spotify_link || "",
      preview: getMediaUrl(t.original_cover_image || t.cover_image)
    })) || [{ title: "", genre: "", youtube_link: "", spotify_link: "" }]
  );

  // Active Crop State
  const [activeCrop, setActiveCrop] = useState<{ 
    type: 'album' | 'track', 
    src: string, 
    trackIndex?: number 
  } | null>(null);

  const albumInputRef = useRef<HTMLInputElement>(null);
  const trackInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleAlbumFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveCrop({ type: 'album', src: reader.result as string });
        setAlbumFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrackFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveCrop({ type: 'track', src: reader.result as string, trackIndex: index });
        const newTracks = [...tracks];
        newTracks[index].file = file;
        setTracks(newTracks);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (pixelCrop: PixelCrop) => {
    if (!activeCrop) return;

    const coords: CropCoordinates = {
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height
    };

    if (activeCrop.type === 'album') {
      setAlbumCrop(coords);
      setAlbumPreview(activeCrop.src);
    } else if (activeCrop.type === 'track' && activeCrop.trackIndex !== undefined) {
      const newTracks = [...tracks];
      newTracks[activeCrop.trackIndex].crop = coords;
      newTracks[activeCrop.trackIndex].preview = activeCrop.src;
      setTracks(newTracks);
    }

    setActiveCrop(null);
  };

  const handleAddTrack = () => {
    setTracks([...tracks, { title: "", genre: "", youtube_link: "", spotify_link: "" }]);
  };

  const handleRemoveTrack = (index: number) => {
    if (tracks.length === 1) return;
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleTrackChange = (index: number, field: keyof TrackFormState, value: string) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setTracks(newTracks);
  };

  const handleDelete = async () => {
    if (!initialData || !confirm(`ARE YOU SURE YOU WANT TO DELETE THIS ALBUM?`)) return;
    try {
      setIsSubmitting(true);
      await deleteAlbum(initialData.id);
      router.push("/albums");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
      setError("FAILED TO DELETE ALBUM");
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

    const payload: AlbumPayload = {
      title,
      genre: formData.get("genre") as string,
      artist_id: artistId ? parseInt(artistId as string) : null,
      spotify_link: formData.get("spotify_link") as string,
      youtube_link: formData.get("youtube_link") as string,
      tracks: tracks.map(t => ({
        title: t.title,
        genre: t.genre || (formData.get("genre") as string),
        youtube_link: t.youtube_link,
        spotify_link: t.spotify_link,
      }))
    };

    try {
      setIsSubmitting(true);
      let album: Album;
      if (initialData) {
        album = await updateAlbum(initialData.id, payload);
      } else {
        album = await createAlbum({
          ...payload,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
      }

      // Upload Album Cover
      if (albumFile) {
        await uploadAlbumCover(album.id, albumFile, albumCrop || undefined);
      }

      // Upload Track Covers
      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        if (t.file && album.tracks[i]) {
          await uploadTrackCover(album.id, album.tracks[i].id, t.file, t.crop || undefined);
        }
      }

      router.push("/albums");
      router.refresh();
    } catch (err) {
      console.error("Failed to save", err);
      setError(`FAILED TO ${initialData ? "UPDATE" : "CREATE"} ALBUM`);
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
          href="/albums" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Albums
        </Link>
        
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={isSubmitting}
            className="flex items-center gap-2 text-[10px] font-mono text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Delete Album
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card-brutalist stagger-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Basic Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Album Title</label>
                  <input name="title" type="text" className="input-brutalist text-xl font-bold" defaultValue={initialData?.title} placeholder="E.G. MIDNIGHT ODYSSEY" required />
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
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Main Genre</label>
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

            {/* Right Column: Album Visual */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Album Cover (1:1)</label>
                  <button 
                    type="button" 
                    onClick={() => albumInputRef.current?.click()}
                    className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase"
                  >
                    <Upload size={12} />
                    Import
                  </button>
                </div>
                <input type="file" ref={albumInputRef} className="hidden" accept="image/*" onChange={handleAlbumFileChange} />
                <div className="border-2 border-dashed border-border aspect-square overflow-hidden bg-muted-foreground/5 relative group cursor-pointer hover:border-accent transition-colors flex items-center justify-center" onClick={() => albumInputRef.current?.click()}>
                  {albumPreview ? (
                    <img src={albumPreview} alt="Album Cover" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-accent transition-colors">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Select Album Cover</span>
                    </div>
                  )}
                  {(albumFile || albumCrop) && (
                    <div className="absolute bottom-4 right-4 bg-accent text-white text-[8px] font-mono px-2 py-1 uppercase">
                      {albumCrop ? "Cropped" : "Selected"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
              <Disc size={18} className="text-accent" />
              Album Tracks
            </h2>
            <button 
              type="button" 
              onClick={handleAddTrack}
              className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase tracking-widest"
            >
              <Plus size={14} />
              Add Track
            </button>
          </div>

          <div className="space-y-6">
            {tracks.map((track, index) => (
              <div key={index} className="card-brutalist p-6 stagger-in">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Track Image */}
                  <div className="w-full lg:w-32">
                    <input 
                      type="file" 
                      ref={el => { trackInputRefs.current[index] = el; }} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleTrackFileChange(e, index)} 
                    />
                    <div 
                      className="aspect-square bg-muted-foreground/5 border border-border relative group cursor-pointer hover:border-accent transition-colors flex items-center justify-center overflow-hidden"
                      onClick={() => trackInputRefs.current[index]?.click()}
                    >
                      {track.preview ? (
                        <img src={track.preview} alt="" className="w-full h-full object-cover transition-all" />
                      ) : (
                        <ImageIcon size={24} className="text-muted-foreground group-hover:text-accent transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={16} className="text-white" />
                      </div>
                      {track.crop && (
                        <div className="absolute bottom-1 right-1 bg-accent text-white text-[6px] font-mono px-1 uppercase">
                          Cropped
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] font-mono text-center mt-2 text-muted-foreground uppercase tracking-widest">Track Cover</p>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Track {index + 1} Title</label>
                      <input 
                        type="text" 
                        className="input-brutalist py-2 text-sm" 
                        value={track.title}
                        onChange={(e) => handleTrackChange(index, "title", e.target.value)}
                        placeholder="TRACK TITLE" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Genre</label>
                      <select 
                        className="input-brutalist py-2 text-sm bg-background" 
                        value={track.genre}
                        onChange={(e) => handleTrackChange(index, "genre", e.target.value)}
                      >
                        <option value="">SAME AS ALBUM</option>
                        {GENRES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Spotify Link</label>
                      <input 
                        type="text" 
                        className="input-brutalist py-2 text-xs" 
                        value={track.spotify_link}
                        onChange={(e) => handleTrackChange(index, "spotify_link", e.target.value)}
                        placeholder="HTTPS://..." 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">YouTube Link</label>
                      <input 
                        type="text" 
                        className="input-brutalist py-2 text-xs" 
                        value={track.youtube_link}
                        onChange={(e) => handleTrackChange(index, "youtube_link", e.target.value)}
                        placeholder="HTTPS://..." 
                      />
                    </div>
                  </div>

                  {/* Remove Track */}
                  <div className="flex items-start">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTrack(index)}
                      className="p-3 border border-border hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30"
                      disabled={tracks.length === 1}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              {isSubmitting ? "PROCESSING..." : (initialData ? "UPDATE ALBUM" : "PROCLAIM ALBUM (CREATE)")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
