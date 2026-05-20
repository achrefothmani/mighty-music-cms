"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Artist } from "@/lib/types";
import { createArtist, updateArtist, deleteArtist, uploadArtistProfileImage, uploadArtistCoverImage, CropCoordinates } from "@/services/artists.service";
import { Trash2, ArrowLeft, Save, Upload, Image as ImageIcon, Plus, X, Video } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import ImageCropper from "@/components/ImageCropper";
import { PixelCrop } from "react-image-crop";
import { getMediaUrl } from "@/lib/utils";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface ArtistFormProps {
  initialData?: Artist | null;
}

const GENRES = [
  "ELECTRONIC", "TECHNO", "HOUSE", "TRANCE", "DEEP HOUSE", 
  "INDIE DANCE", "DANCE", "PHONK", "RAP", "HIP HOP", "TRAP", "AMBIENT",
  "MEZOUED", "RAI", "JAZZ", "POP", "R&B", "ROCK"
].sort();

export default function ArtistForm({ initialData }: ArtistFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [bio, setBio] = useState(initialData?.bio || "");
  const [youtubeVideos, setYoutubeVideos] = useState<string[]>(initialData?.youtube_video_list || [""]);

  // Image States
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    getMediaUrl(initialData?.original_profile_image || initialData?.profile_image)
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    getMediaUrl(initialData?.original_cover_image || initialData?.cover_image)
  );

  // Crop States
  const [activeCrop, setActiveCrop] = useState<{ type: 'profile' | 'cover', src: string } | null>(null);
  const [profileCropCoords, setProfileCropCoords] = useState<CropCoordinates | null>(null);
  const [coverCropCoords, setCoverCropCoords] = useState<CropCoordinates | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveCrop({ type, src: reader.result as string });
        if (type === 'profile') setProfileFile(file);
        else setCoverFile(file);
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

    if (activeCrop.type === 'profile') {
      setProfileCropCoords(coords);
      setProfilePreview(activeCrop.src);
    } else {
      setCoverCropCoords(coords);
      setCoverPreview(activeCrop.src);
    }
    
    setActiveCrop(null);
  };

  const handleYoutubeChange = (index: number, value: string) => {
    const newVideos = [...youtubeVideos];
    newVideos[index] = value;
    setYoutubeVideos(newVideos);
  };

  const addYoutubeField = () => {
    setYoutubeVideos([...youtubeVideos, ""]);
  };

  const removeYoutubeField = (index: number) => {
    setYoutubeVideos(youtubeVideos.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!initialData || !confirm(`ARE YOU SURE YOU WANT TO DELETE ${initialData.full_name}?`)) return;
    
    try {
      setIsSubmitting(true);
      await deleteArtist(initialData.id);
      router.push("/artists");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
      setError("FAILED TO DELETE ARTIST");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const payload = {
      full_name: fullName,
      genre: formData.get("genre") as string,
      bio: bio,
      spotify_playlist_link: formData.get("spotifyLink") as string,
      youtube_video_list: youtubeVideos.filter(v => v.trim() !== ""),
    };
    
    try {
      setIsSubmitting(true);
      let artist: Artist;
      if (initialData) {
        artist = await updateArtist(initialData.id, payload);
      } else {
        artist = await createArtist({
          ...payload,
          slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
      }

      if (profileFile) {
        await uploadArtistProfileImage(artist.id, profileFile, profileCropCoords || undefined);
      }
      if (coverFile) {
        await uploadArtistCoverImage(artist.id, coverFile, coverCropCoords || undefined);
      }

      router.push("/artists");
      router.refresh();
    } catch (err) {
      console.error("Failed to save", err);
      setError(`FAILED TO ${initialData ? "UPDATE" : "CREATE"} ARTIST`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

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
          href="/artists" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Roster
        </Link>
        
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={isSubmitting}
            className="flex items-center gap-2 text-[10px] font-mono text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Delete Artist
          </button>
        )}
      </div>

      <div className="card-brutalist stagger-in">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Basic Info & Bio */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input name="fullName" type="text" className="input-brutalist text-xl" defaultValue={initialData?.full_name} placeholder="E.G. CYBERPUNK ZERO" required />
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
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Spotify Playlist Link</label>
                    <input name="spotifyLink" type="text" className="input-brutalist" defaultValue={initialData?.spotify_playlist_link} placeholder="HTTPS://OPEN.SPOTIFY.COM/..." />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Bio (Rich Text)</label>
                <div className="bg-background border border-border">
                  <ReactQuill 
                    theme="snow" 
                    value={bio} 
                    onChange={setBio} 
                    modules={quillModules}
                    placeholder="ARTIST STORY..."
                    className="h-64 mb-12"
                  />
                </div>
              </div>

              {/* YouTube Video List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">YouTube Videos</label>
                  <button 
                    type="button" 
                    onClick={addYoutubeField}
                    className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase"
                  >
                    <Plus size={12} />
                    Add Video
                  </button>
                </div>
                <div className="space-y-4">
                  {youtubeVideos.map((video, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex-1">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                          type="text" 
                          className="input-brutalist pl-12" 
                          value={video} 
                          onChange={(e) => handleYoutubeChange(index, e.target.value)}
                          placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=..." 
                        />
                      </div>
                      {youtubeVideos.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeYoutubeField(index)}
                          className="p-4 border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="space-y-8">
              {/* Profile Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Profile Image (1:1)</label>
                  <button 
                    type="button" 
                    onClick={() => profileInputRef.current?.click()}
                    className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase"
                  >
                    <Upload size={12} />
                    Import
                  </button>
                </div>
                <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                <div className="border-2 border-dashed border-border aspect-square overflow-hidden bg-muted-foreground/5 relative group cursor-pointer hover:border-accent transition-colors flex items-center justify-center" onClick={() => profileInputRef.current?.click()}>
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-accent transition-colors">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Select Profile Image</span>
                    </div>
                  )}
                  {(profileFile || profileCropCoords) && (
                    <div className="absolute bottom-4 right-4 bg-accent text-white text-[8px] font-mono px-2 py-1 uppercase">
                      {profileCropCoords ? "Cropped" : "Selected"}
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cover Image (3:2)</label>
                  <button 
                    type="button" 
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase"
                  >
                    <Upload size={12} />
                    Import
                  </button>
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                <div className="border-2 border-dashed border-border aspect-video overflow-hidden bg-muted-foreground/5 relative group cursor-pointer hover:border-accent transition-colors flex items-center justify-center" onClick={() => coverInputRef.current?.click()}>
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
                {isSubmitting ? "PROCESSING..." : (initialData ? "UPDATE" : "PROCLAIM ARTIST (CREATE)")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
