"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Event, CoverItem, GalleryItem } from "@/lib/types";
import { createEvent, updateEvent, deleteEvent, uploadEventCover, uploadEventGallery, removeEventGalleryFile } from "@/services/events.service";
import { CropCoordinates } from "@/services/singles.service";
import { Trash2, ArrowLeft, Save, Upload, Image as ImageIcon, Plus, X, Phone, MapPin, Calendar, Link as LinkIcon, Star, Film, Check } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import ImageCropper from "@/components/ImageCropper";
import { PixelCrop } from "react-image-crop";
import { getMediaUrl } from "@/lib/utils";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface EventFormProps {
  initialData?: Event | null;
}

interface PendingCover {
  file: File;
  preview: string;
  label: string;
  is_principal: boolean;
  crop?: CropCoordinates;
}

interface PendingGalleryItem {
  file: File;
  preview: string;
  type: "image" | "video";
}

const PREDEFINED_LABELS = ["Hero cover", "Content Cover", "Side Cover"];

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState(initialData?.description || "");
  const [contacts, setContacts] = useState<string[]>(initialData?.contact || [""]);
  
  const [covers, setCovers] = useState<CoverItem[]>(initialData?.covers || []);
  const [pendingCovers, setPendingCovers] = useState<PendingCover[]>([]);
  
  const [activeCrop, setActiveCrop] = useState<{ src: string, pendingIndex: number } | null>(null);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialData?.gallery || []);
  const [pendingGallery, setPendingGallery] = useState<PendingGalleryItem[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPending: PendingCover = {
          file,
          preview: reader.result as string,
          label: "Hero cover",
          is_principal: pendingCovers.length === 0 && covers.length === 0,
        };
        setPendingCovers(prev => {
          const updated = [...prev, newPending];
          setActiveCrop({ src: reader.result as string, pendingIndex: updated.length - 1 });
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const type = file.type.startsWith('video/') ? "video" : "image";
          setPendingGallery(prev => [...prev, { file, preview: reader.result as string, type }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryItem = async (index: number, isPending: boolean) => {
    if (isPending) {
      setPendingGallery(prev => prev.filter((_, i) => i !== index));
    } else if (initialData) {
      const item = galleryItems[index];
      if (confirm("REMOVE THIS FILE FROM GALLERY PERMANENTLY?")) {
        try {
          const updated = await removeEventGalleryFile(initialData.id, item.url);
          setGalleryItems(updated.gallery || []);
        } catch (err) {
          console.error("Failed to remove gallery item", err);
        }
      }
    }
  };

  const removeCoverItem = (index: number, isPending: boolean) => {
    if (isPending) {
      setPendingCovers(prev => prev.filter((_, i) => i !== index));
    } else {
      setCovers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onCropComplete = (pixelCrop: PixelCrop) => {
    if (activeCrop !== null) {
      const coords: CropCoordinates = {
        x: pixelCrop.x,
        y: pixelCrop.y,
        width: pixelCrop.width,
        height: pixelCrop.height
      };
      setPendingCovers(prev => prev.map((item, i) => 
        i === activeCrop.pendingIndex ? { ...item, crop: coords } : item
      ));
      setActiveCrop(null);
    }
  };

  const setPrincipalCover = (index: number, isPending: boolean) => {
    setCovers(prev => prev.map((c, i) => ({ ...c, is_principal: !isPending && i === index })));
    setPendingCovers(prev => prev.map((c, i) => ({ ...c, is_principal: isPending && i === index })));
  };

  const updateCoverLabel = (index: number, label: string, isPending: boolean) => {
    if (isPending) {
      setPendingCovers(prev => prev.map((c, i) => i === index ? { ...c, label } : c));
    } else {
      setCovers(prev => prev.map((c, i) => i === index ? { ...c, label } : c));
    }
  };

  const handleContactChange = (index: number, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = value;
    setContacts(newContacts);
  };

  const addContactField = () => setContacts([...contacts, ""]);
  const removeContactField = (index: number) => setContacts(contacts.filter((_, i) => i !== index));

  const handleDelete = async () => {
    if (!initialData || !confirm(`ARE YOU SURE YOU WANT TO DELETE THIS EVENT?`)) return;
    try {
      setIsSubmitting(true);
      await deleteEvent(initialData.id);
      router.push("/events");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
      setError("FAILED TO DELETE EVENT");
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
      location: formData.get("location") as string,
      date_time: formData.get("date_time") as string,
      description: description,
      lien_booking: formData.get("lien_booking") as string,
      contact: contacts.filter(c => c.trim() !== ""),
      covers: covers // Send existing covers (with updated labels/principal)
    };
    
    try {
      setIsSubmitting(true);
      let event: Event;
      if (initialData) {
        event = await updateEvent(initialData.id, payload);
      } else {
        event = await createEvent({
          ...payload,
          slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
      }

      // Upload new covers
      for (const pending of pendingCovers) {
        await uploadEventCover(event.id, pending.file, pending.label, pending.is_principal, pending.crop);
      }
      
      // Upload new gallery items
      if (pendingGallery.length > 0) {
        await uploadEventGallery(event.id, pendingGallery.map(p => p.file));
      }

      router.push("/events");
      router.refresh();
    } catch (err) {
      console.error("Failed to save", err);
      setError(`FAILED TO ${initialData ? "UPDATE" : "CREATE"} EVENT`);
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

  const allCovers = useMemo(() => [
    ...covers.map((c, i) => ({ ...c, isPending: false as const, index: i })),
    ...pendingCovers.map((c, i) => ({ ...c, isPending: true as const, index: i }))
  ], [covers, pendingCovers]);

  const allGallery = useMemo(() => [
    ...galleryItems.map((item, i) => ({ ...item, isPending: false as const, index: i })),
    ...pendingGallery.map((item, i) => ({ ...item, isPending: true as const, index: i }))
  ], [galleryItems, pendingGallery]);

  return (
    <div className="space-y-8">
      {activeCrop && (
        <ImageCropper imageSrc={activeCrop.src} onCropComplete={onCropComplete} onCancel={() => setActiveCrop(null)} />
      )}

      <div className="flex items-center justify-between">
        <Link href="/events" className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to Events
        </Link>
        {initialData && (
          <button type="button" onClick={handleDelete} disabled={isSubmitting} className="flex items-center gap-2 text-[10px] font-mono text-destructive hover:text-destructive/80 transition-colors uppercase tracking-widest">
            <Trash2 size={14} /> Delete Event
          </button>
        )}
      </div>

      <div className="card-brutalist stagger-in">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Event Title</label>
                <input name="title" type="text" className="input-brutalist text-xl" defaultValue={initialData?.title} placeholder="E.G. MIGHTY SUMMER FEST" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input name="location" type="text" className="input-brutalist pl-12" defaultValue={initialData?.location} placeholder="E.G. PARIS, FRANCE" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input name="date_time" type="datetime-local" className="input-brutalist pl-12" defaultValue={initialData?.date_time ? new Date(initialData.date_time).toISOString().slice(0, 16) : ""} required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Booking Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input name="lien_booking" type="text" className="input-brutalist pl-12" defaultValue={initialData?.lien_booking} placeholder="HTTPS://TICKETS.COM/..." />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Description (Rich Text)</label>
                <div className="bg-background border border-border">
                  <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} className="h-64 mb-12" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Contact / Infoline</label>
                  <button type="button" onClick={addContactField} className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase">
                    <Plus size={12} /> Add Contact
                  </button>
                </div>
                <div className="space-y-4">
                  {contacts.map((c, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative flex-1">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input type="text" className="input-brutalist pl-12" value={c} onChange={(e) => handleContactChange(i, e.target.value)} placeholder="+33 6 00 00 00 00" />
                      </div>
                      <button type="button" onClick={() => removeContactField(i)} className="p-4 border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"><X size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Covers (Hero, Side, Content)</label>
                  <button type="button" onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase">
                    <Upload size={12} /> Add Cover
                  </button>
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                
                <div className="grid grid-cols-1 gap-4">
                  {allCovers.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-border bg-muted-foreground/5 relative">
                      <div className="w-24 h-24 border border-border overflow-hidden bg-black flex-shrink-0">
                        <img 
                          src={item.isPending ? (item as PendingCover).preview : (getMediaUrl((item as CoverItem).original_url || (item as CoverItem).url) || "")} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <select 
                            className="bg-transparent text-[10px] font-mono uppercase tracking-widest border border-border px-2 py-1 outline-none"
                            value={item.label}
                            onChange={(e) => updateCoverLabel(item.index, e.target.value, item.isPending)}
                          >
                            {PREDEFINED_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <button type="button" onClick={() => removeCoverItem(item.index, item.isPending)} className="text-destructive hover:text-destructive/80 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button" 
                            onClick={() => setPrincipalCover(item.index, item.isPending)}
                            className={`flex items-center gap-2 text-[8px] font-mono uppercase tracking-widest transition-colors ${item.is_principal ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                          >
                            <Star size={10} fill={item.is_principal ? "currentColor" : "none"} />
                            {item.is_principal ? "Principal Cover" : "Set as Principal"}
                          </button>
                          {item.isPending && (
                            <button 
                              type="button" 
                              onClick={() => setActiveCrop({ src: (item as PendingCover).preview, pendingIndex: item.index })}
                              className="text-[8px] font-mono uppercase tracking-widest text-accent hover:underline"
                            >
                              Recrop
                            </button>
                          )}
                        </div>
                      </div>
                      {item.is_principal && <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white flex items-center justify-center rounded-full shadow-lg"><Check size={12} /></div>}
                    </div>
                  ))}
                  
                  {(covers.length === 0 && pendingCovers.length === 0) && (
                    <div className="border-2 border-dashed border-border p-12 flex flex-col items-center gap-4 text-muted-foreground cursor-pointer hover:border-accent hover:text-accent transition-colors" onClick={() => coverInputRef.current?.click()}>
                      <ImageIcon size={32} strokeWidth={1} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Add Cover Image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Gallery (Images & Videos)</label>
                  <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-mono text-accent hover:underline uppercase">
                    <Upload size={12} /> Upload
                  </button>
                </div>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleGalleryChange} />
                <div className="grid grid-cols-3 gap-4">
                  {allGallery.map((item, i) => (
                    <div key={i} className="relative aspect-square border border-border group overflow-hidden bg-black">
                      {item.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-2">
                          <Film size={24} />
                          <span className="text-[8px] font-mono uppercase tracking-widest">Video</span>
                        </div>
                      ) : (
                        <img 
                          src={item.isPending ? (item as PendingGalleryItem).preview : (getMediaUrl((item as GalleryItem).original_url || (item as GalleryItem).url) || "")} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      <button type="button" onClick={() => removeGalleryItem(item.index, item.isPending)} className="absolute top-1 right-1 p-1 bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={12} /></button>
                      {item.isPending && <div className="absolute bottom-0 left-0 right-0 bg-accent h-1" />}
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors text-muted-foreground hover:text-accent" onClick={() => galleryInputRef.current?.click()}>
                    <Plus size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-mono uppercase tracking-widest text-center">{error}</div>}

          <div className="pt-8 border-t border-border flex justify-end">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-3 px-12 py-4">
              <Save size={18} />
              <span className="text-sm font-bold tracking-[0.1em]">{isSubmitting ? "PROCESSING..." : (initialData ? "UPDATE EVENT" : "CREATE EVENT")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
