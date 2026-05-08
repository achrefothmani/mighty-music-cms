"use client";

import { useEffect, useState, use } from "react";
import { getNewsById } from "@/services/news.service";
import { News } from "@/lib/types";
import NewsForm from "@/components/news/NewsForm";

interface EditNewsPageProps {
  params: Promise<{ id: string }>;
}

export default function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = use(params);
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsById(id);
        setNews(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!news) return <div className="text-center py-20 font-mono uppercase tracking-widest text-muted-foreground">News article not found</div>;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Edit News / {news.title}</h1>
      </div>
      <NewsForm initialData={news} />
    </div>
  );
}
