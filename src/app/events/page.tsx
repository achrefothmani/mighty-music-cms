"use client";

import { useState } from "react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import DrawerForm from "@/components/DrawerForm";
import EmptyState from "@/components/EmptyState";
import { MapPin, Calendar } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <div className="stagger-in space-y-12">
      {events.length > 0 ? (
        <div className="space-y-12 relative before:absolute before:left-[35px] before:top-0 before:bottom-0 before:w-px before:bg-border">
          {events.map((event) => {
            const { day, month } = formatDate(event.date_time);
            return (
              <div key={event.id} className="flex gap-12 group relative">
                {/* Date Block */}
                <div className="flex flex-col items-center justify-center w-[72px] h-[72px] bg-card border border-border group-hover:border-accent transition-colors z-10 bg-background">
                  <span className="text-2xl font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{month}</span>
                </div>

                {/* Content Block */}
                <div 
                  className="flex-1 card-brutalist group-hover:border-accent cursor-pointer transition-all flex gap-8 items-start"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDrawerOpen(true);
                  }}
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono border border-border px-2 py-0.5 text-muted-foreground group-hover:text-accent group-hover:border-accent transition-colors flex items-center gap-1">
                        <MapPin size={10} /> {event.location}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight uppercase group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
                      {event.description}
                    </p>
                  </div>
                  
                  {event.cover_image && (
                    <div className="w-32 h-32 bg-muted-foreground/10 border border-border overflow-hidden shrink-0">
                      <img src={event.cover_image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          message="NO EVENTS SCHEDULED" 
          ctaText="＋ CREATE NEW EVENT" 
          onCtaClick={() => setIsDrawerOpen(true)}
        />
      )}

      <DrawerForm 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedEvent ? `EDIT EVENT / ${selectedEvent.title}` : "CREATE NEW EVENT"}
      >
        <form id="drawer-form" className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Title</label>
            <input type="text" className="input-brutalist" defaultValue={selectedEvent?.title} placeholder="EVENT TITLE" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Location</label>
            <input type="text" className="input-brutalist" defaultValue={selectedEvent?.location} placeholder="CITY / VENUE" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Date & Time</label>
            <input type="datetime-local" className="input-brutalist" defaultValue={selectedEvent?.date_time} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Cover Image URL</label>
            <input type="text" className="input-brutalist" defaultValue={selectedEvent?.cover_image} placeholder="HTTPS://..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Description</label>
            <textarea className="input-brutalist h-32 resize-none" defaultValue={selectedEvent?.description} placeholder="EVENT DETAILS..." />
          </div>
        </form>
      </DrawerForm>
    </div>
  );
}
