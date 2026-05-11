"use client";

import { useState, useEffect } from "react";
import { getEvents, deleteEvent } from "@/services/events.service";
import { Event } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { Search, Trash2, Edit, Plus, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS EVENT?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const filtered = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH EVENTS..." 
            className="w-full bg-transparent pl-8 py-2 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/events/new"
          className="btn-brutalist flex items-center justify-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus size={16} />
          ADD EVENT
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : filtered.length > 0 ? (
        <DataTable
          columns={[
            { label: "Event" },
            { label: "Info" },
            { label: "" },
            { label: "Actions", align: "right" }
          ]}
        >
          {filtered.map((e) => (
            <tr key={e.id} className="group border-b border-border hover:bg-white/5 transition-colors relative">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted-foreground/10 overflow-hidden border border-border">
                    {e.cover_image ? (
                      <img src={getMediaUrl(e.cover_image) || ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Calendar size={20} className="text-muted-foreground" /></div>
                    )}
                  </div>
                  <span className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{e.title}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                  <Calendar size={12} /> {new Date(e.date_time).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                  <MapPin size={12} /> {e.location}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/events/${e.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(e.id)} className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState message="NO EVENTS FOUND" ctaText="＋ ADD EVENT" onCtaClick={() => window.location.href = "/events/new"} />
      )}
    </div>
  );
}
