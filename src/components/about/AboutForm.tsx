"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AboutPage } from "@/lib/types";
import { updateAbout, uploadAboutCover, uploadAboutGallery } from "@/services/about.service";
import { CropCoordinates } from "@/services/singles.service";
import { Save, Upload, Image as ImageIcon, X, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import ImageCropper from "@/components/ImageCropper";
import { PixelCrop } from "react-image-crop";
import { getMediaUrl } from "@/lib/utils";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface AboutFormProps {
  initialData: AboutPage;
}

export default function AboutForm({ initialData }: AboutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AboutPage>(initialData);

  const [description, setDescription] = useState(data.description || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    getMediaUrl(data.original_image || data.cover_image)
  );
  const [activeCrop, setActiveCrop] = useState<{ src: string } | null>(null);
  const [coverCropCoords, setCoverCropCoords] = useState<CropCoordinates | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setData(initialData);
    setDescription(initialData.description || "");
    setCoverPreview(getMediaUrl(initialData.original_image || initialData.cover_image));
  }, [initialData]);

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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const updated = await uploadAboutGallery(file);
      setData(updated);
      router.refresh();
    } catch (err) {
      console.error("Failed to upload gallery image", err);
      setError("FAILED TO UPLOAD GALLERY IMAGE");
    } finally {
      setIsSubmitting(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleDeleteGalleryItem = async (url: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO REMOVE THIS IMAGE FROM THE GALLERY?")) return;

    try {
      setIsSubmitting(true);
      const newGallery = data.gallery.filter(item => item !== url);
      const updated = await updateAbout({ gallery: newGallery });
      setData(updated);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete gallery image", err);
      setError("FAILED TO DELETE GALLERY IMAGE");
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
      subtitle: formData.get("subtitle") as string,
      description: description,
    };
    
    try {
      setIsSubmitting(true);
      await updateAbout(payload);

      if (coverFile) {
        await uploadAboutCover(coverFile, coverCropCoords || undefined);
      }

      router.refresh();
      alert("ABOUT PAGE UPDATED SUCCESSFULLY");
    } catch (err) {
      console.error("Failed to save", err);
      setError("FAILED TO UPDATE ABOUT PAGE");
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

      <div className="card-brutalist stagger-in">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Page Title</label>
                <input name="title" type="text" className="input-brutalist text-xl" defaultValue={data.title} placeholder="E.G. ABOUT MIGHTY MUSIC" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Subtitle</label>
                <input name="subtitle" type="text" className="input-brutalist text-lg" defaultValue={data.subtitle} placeholder="E.G. INDEPENDENT RECORD LABEL SINCE 2010" required />
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
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Hero Cover Image</label>
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

          {/* Gallery Section */}
          <div className="space-y-4 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Gallery Images</label>
              <button 
                type="button" 
                onClick={() => galleryInputRef.current?.click()} 
                className="btn-brutalist flex items-center gap-2 px-4 py-2"
                disabled={isSubmitting}
              >
                <Plus size={14} />
                <span className="text-[10px] font-mono uppercase">Add Image</span>
              </button>
              <input 
                type="file" 
                ref={galleryInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleGalleryUpload} 
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.gallery.map((url, index) => (
                <div key={index} className="relative aspect-square border border-border group overflow-hidden">
                  <img src={getMediaUrl(url)} alt={`Gallery ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteGalleryItem(url)}
                    className="absolute top-2 right-2 bg-destructive text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {data.gallery.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon size={32} strokeWidth={1} className="mb-2" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">No images in gallery</span>
                </div>
              )}
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
                {isSubmitting ? "PROCESSING..." : "UPDATE ABOUT PAGE"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
