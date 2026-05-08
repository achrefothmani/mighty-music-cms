"use client";

import { useState } from "react";
import { MOCK_NEWS } from "@/lib/mock-data";
import { News } from "@/lib/types";
import DrawerForm from "@/components/DrawerForm";
import EmptyState from "@/components/EmptyState";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>(MOCK_NEWS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  return (
    <div className="stagger-in space-y-8">
      {news.length > 0 ? (
        <div className="space-y-8">
          {/* Hero News */}
          {news[0] && (
            <div 
              className="card-brutalist p-0 group cursor-pointer hover:border-accent transition-all overflow-hidden flex flex-col md:flex-row"
              onClick={() => {
                setSelectedNews(news[0]);
                setIsDrawerOpen(true);
              }}
            >
              <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-auto bg-muted-foreground/10 overflow-hidden">
                {news[0].cover_image && (
                  <img src={news[0].cover_image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                )}
              </div>
              <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-accent mb-4 tracking-[0.3em]">LATEST NEWS</span>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-6 group-hover:text-accent transition-colors leading-none">
                  {news[0].title}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md line-clamp-3">
                  {news[0].description}
                </p>
              </div>
            </div>
          )}

          {/* Grid News */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {news.slice(1).map((item) => (
              <div 
                key={item.id} 
                className="card-brutalist p-0 group cursor-pointer hover:border-accent transition-all overflow-hidden"
                onClick={() => {
                  setSelectedNews(item);
                  setIsDrawerOpen(true);
                }}
              >
                <div className="aspect-video bg-muted-foreground/10 overflow-hidden">
                  {item.cover_image && (
                    <img src={item.cover_image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold tracking-tight uppercase group-hover:text-accent transition-colors mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState 
          message="NO NEWS ITEMS" 
          ctaText="＋ CREATE NEW ARTICLE" 
          onCtaClick={() => setIsDrawerOpen(true)}
        />
      )}

      <DrawerForm 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedNews ? `EDIT NEWS / ${selectedNews.title}` : "CREATE NEW ARTICLE"}
      >
        <form id="drawer-form" className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Title</label>
            <input type="text" className="input-brutalist" defaultValue={selectedNews?.title} placeholder="ARTICLE TITLE" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Cover Image URL</label>
            <input type="text" className="input-brutalist" defaultValue={selectedNews?.cover_image} placeholder="HTTPS://..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Description</label>
            <textarea className="input-brutalist h-48 resize-none" defaultValue={selectedNews?.description} placeholder="ARTICLE CONTENT..." />
          </div>
        </form>
      </DrawerForm>
    </div>
  );
}
