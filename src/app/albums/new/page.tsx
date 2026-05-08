import AlbumForm from "@/components/albums/AlbumForm";

export default function NewAlbumPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">Proclaim New Album</h1>
      <AlbumForm />
    </div>
  );
}
