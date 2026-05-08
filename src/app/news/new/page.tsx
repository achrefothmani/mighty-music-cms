import NewsForm from "@/components/news/NewsForm";

export default function NewNewsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Publish News</h1>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">Create a new article for the platform.</p>
      </div>
      <NewsForm />
    </div>
  );
}
