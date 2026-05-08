"use client";

import { useState, useEffect } from "react";
import { getPartnerships, deletePartnership } from "@/services/partnerships.service";
import { Partnership } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { Search, Trash2, Edit, Plus, Handshake } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const fetchPartnerships = async () => {
    try {
      const data = await getPartnerships();
      setPartnerships(data);
    } catch (error) {
      console.error("Failed to fetch partnerships:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS PARTNERSHIP?")) return;
    try {
      await deletePartnership(id);
      setPartnerships(partnerships.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete partnership:", error);
    }
  };

  const filtered = partnerships.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH PARTNERSHIPS..." 
            className="w-full bg-transparent pl-8 py-2 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/partnerships/new"
          className="btn-brutalist flex items-center justify-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus size={16} />
          ADD PARTNERSHIP
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="card-brutalist p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Title</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="group border-b border-border hover:bg-white/5 transition-colors relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted-foreground/10 overflow-hidden border border-border">
                        {p.cover_image ? (
                          <img src={getMediaUrl(p.cover_image) || ""} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Handshake size={20} className="text-muted-foreground" /></div>
                        )}
                      </div>
                      <span className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/partnerships/${p.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="NO PARTNERSHIPS FOUND" ctaText="＋ ADD PARTNERSHIP" onCtaClick={() => window.location.href = "/partnerships/new"} />
      )}
    </div>
  );
}
