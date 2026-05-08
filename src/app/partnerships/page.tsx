"use client";

import { useState } from "react";
import { MOCK_PARTNERSHIPS } from "@/lib/mock-data";
import { Partnership } from "@/lib/types";
import DrawerForm from "@/components/DrawerForm";
import EmptyState from "@/components/EmptyState";

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>(MOCK_PARTNERSHIPS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);

  return (
    <div className="stagger-in space-y-8">
      {partnerships.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partnerships.map((item) => (
            <div 
              key={item.id} 
              className="card-brutalist group cursor-pointer hover:border-accent transition-all flex flex-col"
              onClick={() => {
                setSelectedPartnership(item);
                setIsDrawerOpen(true);
              }}
            >
              <div className="aspect-square bg-[#1A1A1A] flex items-center justify-center p-8 overflow-hidden border-b border-border group-hover:border-accent transition-colors">
                {item.cover_image ? (
                  <img src={item.cover_image} alt="" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Logo</div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-sm font-mono tracking-widest font-bold uppercase group-hover:text-accent transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2 uppercase">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          message="NO PARTNERSHIPS FOUND" 
          ctaText="＋ ADD NEW PARTNER" 
          onCtaClick={() => setIsDrawerOpen(true)}
        />
      )}

      <DrawerForm 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPartnership ? `EDIT PARTNER / ${selectedPartnership.title}` : "ADD NEW PARTNER"}
      >
        <form id="drawer-form" className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Partner Name</label>
            <input type="text" className="input-brutalist" defaultValue={selectedPartnership?.title} placeholder="COMPANY NAME" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Logo URL</label>
            <input type="text" className="input-brutalist" defaultValue={selectedPartnership?.cover_image} placeholder="HTTPS://..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Short Description</label>
            <textarea className="input-brutalist h-24 resize-none" defaultValue={selectedPartnership?.description} placeholder="PARTNERSHIP ROLE..." />
          </div>
        </form>
      </DrawerForm>
    </div>
  );
}
