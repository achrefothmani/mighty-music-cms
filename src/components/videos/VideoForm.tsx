"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "@/lib/types";
import { createVideo, updateVideo, deleteVideo } from "@/services/videos.service";
import { Trash2, ArrowLeft, Save, Video as VideoIcon } from "lucide-react";
import Link from "next/link";

interface VideoFormProps {
  initialData?: Video | null;
}

export default function VideoForm({ initialData }: VideoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!initialData || !confirm(`ARE YOU SURE YOU WANT TO DELETE THIS VIDEO?`)) return;
    
    try {
      setIsSubmitting(true);
      await deleteVideo(initialData.id);
      router.push("/videos");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
      setError("FAILED TO DELETE VIDEO");
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
    const youtube_link = formData.get("youtube_link") as string;
    
    const payload = {
      title,
      youtube_link,
    };
    
    try {
      setIsSubmitting(true);
      if (initialData) {
        await updateVideo(initialData.id, payload);
      } else {
        await createVideo({
          ...payload,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
      }

      router.push("/videos");
      router.refresh();
    } catch (err) {
      console.error("Failed to save", err);
      setError(`FAILED TO ${initialData ? "UPDATE" : "CREATE"} VIDEO`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href="/videos" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Videos
        </Link>
        
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={isSubmitting}
            className="flex items-center gap-2 text-[10px] font-mono text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Delete Video
          </button>
        )}
      </div>

      <div className="card-brutalist stagger-in max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Video Title</label>
              <input 
                name="title" 
                type="text" 
                className="input-brutalist text-xl" 
                defaultValue={initialData?.title} 
                placeholder="E.G. LIVE AT THE BASEMENT" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">YouTube Link</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <VideoIcon size={18} />
                </div>
                <input 
                  name="youtube_link" 
                  type="text" 
                  className="input-brutalist pl-12" 
                  defaultValue={initialData?.youtube_link} 
                  placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=..." 
                  required
                />
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
                {isSubmitting ? "PROCESSING..." : (initialData ? "UPDATE VIDEO" : "ADD VIDEO")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
