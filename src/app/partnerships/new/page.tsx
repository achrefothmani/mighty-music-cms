import PartnershipForm from "@/components/partnerships/PartnershipForm";

export default function NewPartnershipPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Add Partnership</h1>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">Create a new brand collaboration entry.</p>
      </div>
      <PartnershipForm />
    </div>
  );
}
