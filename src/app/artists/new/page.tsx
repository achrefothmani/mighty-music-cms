import ArtistForm from "@/components/artists/ArtistForm";

export default function NewArtistPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-[0.2em] text-accent">PROCLAIM NEW ARTIST</h1>
      <ArtistForm />
    </div>
  );
}
