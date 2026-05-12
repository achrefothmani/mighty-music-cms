"use client";

import { useState, useEffect } from "react";
import { getNews, deleteNews } from "@/services/news.service";
import { News } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { Search, Trash2, Edit, Plus, Newspaper } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS NEWS ARTICLE?")) return;
    try {
      await deleteNews(id);
      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete news:", error);
    }
  };

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stagger-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH NEWS BY TITLE..." 
            className="w-full bg-transparent pl-8 py-2 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link 
          href="/news/new"
          className="btn-brutalist flex items-center justify-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus size={16} />
          ADD NEWS
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : filteredNews.length > 0 ? (
        <DataTable
          columns={[
            { label: "Title" },
            { label: "Actions", align: "right" }
          ]}
        >
          {filteredNews.map((n) => (
            <tr key={n.id} className="group border-b border-border hover:bg-white/5 transition-colors relative">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted-foreground/10 overflow-hidden border border-border">
                    {n.cover_image ? (
                      <img src={getMediaUrl(n.cover_image) || ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Newspaper size={20} className="text-muted-foreground" /></div>
                    )}
                  </div>
                  <span className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{n.title}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/news/${n.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(n.id)} className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState message="NO NEWS ARTICLES FOUND" ctaText="＋ ADD NEWS" onCtaClick={() => window.location.href = "/news/new"} />
      )}
    </div>
  );
}
