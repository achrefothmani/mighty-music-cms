import VideoForm from "@/components/videos/VideoForm";

export default function NewVideoPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Add New Video</h1>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">Create a new video entry for the platform.</p>
      </div>
      
      <VideoForm />
    </div>
  );
}
