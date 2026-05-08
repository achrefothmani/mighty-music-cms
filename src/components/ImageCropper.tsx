"use client";

import { useState } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number;
  onCropComplete: (crop: PixelCrop) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, aspect, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      {
        unit: "%",
        width: 90,
        height: 90,
      },
      width,
      height
    );
    setCrop(initialCrop);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-background border border-border flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Crop Image</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCrop(undefined)}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-2 uppercase"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={onCancel}
              className="text-[10px] font-mono text-destructive hover:text-destructive/80 flex items-center gap-2 uppercase"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-muted-foreground/5 min-h-0">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="max-h-full"
          >
            <img 
              src={imageSrc} 
              alt="Crop workspace" 
              onLoad={onImageLoad} 
              className="max-h-[60vh] w-auto object-contain"
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-4">
          <button
            onClick={() => completedCrop && onCropComplete(completedCrop)}
            disabled={!completedCrop}
            className="btn-primary flex items-center gap-3 px-8 py-3 disabled:opacity-50"
          >
            <Check size={18} />
            <span className="text-[10px] font-bold tracking-widest uppercase">Apply Crop</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Use the handles to adjust the crop area. Press Apply when finished.
        </p>
      </div>
    </div>
  );
}
