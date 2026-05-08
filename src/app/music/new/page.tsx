import MusicForm from "@/components/music/MusicForm";

export default function NewMusicPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">Release New Track</h1>
      <MusicForm />
    </div>
  );
}
