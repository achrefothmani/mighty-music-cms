"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Partnership } from "@/lib/types";
import { createPartnership, updatePartnership, deletePartnership, uploadPartnershipCover } from "@/services/partnerships.service";
import { CropCoordinates } from "@/services/singles.service";
import { Trash2, ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import ImageCropper from "@/components/ImageCropper";
import { PixelCrop } from "react-image-crop";
import { getMediaUrl } from "@/lib/utils";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface PartnershipFormProps {
  initialData?: Partnership | null;
}

export default function PartnershipForm({ initialData }: PartnershipFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState(initialData?.description || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    getMediaUrl(initialData?.original_image || initialData?.cover_image)
  );
  const [activeCrop, setActiveCrop] = useState<{ src: string } | null>(null);
  const [coverCropCoords, setCoverCropCoords] = useState<CropCoordinates | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

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
    if (!initialData || !confirm(`ARE YOU SURE YOU WANT TO DELETE THIS PARTNERSHIP?`)) return;
    try {
      setIsSubmitting(true);
      await deletePartnership(initialData.id);
      router.push("/partnerships");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
      setError("FAILED TO DELETE PARTNERSHIP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title") as string,
      description: description,
    };
    
    try {
      setIsSubmitting(true);
      let p: Partnership;
      if (initialData) {
        p = await updatePartnership(initialData.id, payload);
      } else {
        p = await createPartnership(payload);
      }

      if (coverFile) {
        await uploadPartnershipCover(p.id, coverFile, coverCropCoords || undefined);
      }

      router.push("/partnerships");
      router.refresh();
    } catch (err) {
      console.error("Failed to save", err);
      setError(`FAILED TO ${initialData ? "UPDATE" : "CREATE"} PARTNERSHIP`);
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
          href="/partnerships" 
          className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Partnerships
        </Link>
        {initialData && (
          <button type="button" onClick={handleDelete} disabled={isSubmitting} className="flex items-center gap-2 text-[10px] font-mono text-destructive hover:text-destructive/80 transition-colors uppercase tracking-widest">
            <Trash2 size={14} />
            Delete Partnership
          </button>
        )}
      </div>

      <div className="card-brutalist stagger-in">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Partnership Title</label>
                <input name="title" type="text" className="input-brutalist text-xl" defaultValue={initialData?.title} placeholder="E.G. BRAND COLLABORATION" required />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Description (Rich Text)</label>
                <div className="bg-background border border-border">
                  <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} className="h-64 mb-12" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cover Image (Free Crop)</label>
                  <button type="button" onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase">
                    <Upload size={12} /> Import
                  </button>
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="border-2 border-dashed border-border overflow-hidden bg-muted-foreground/5 relative group cursor-pointer hover:border-accent transition-colors flex items-center justify-center min-h-[300px]" onClick={() => coverInputRef.current?.click()}>
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
                {isSubmitting ? "PROCESSING..." : (initialData ? "UPDATE PARTNERSHIP" : "SAVE PARTNERSHIP")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
