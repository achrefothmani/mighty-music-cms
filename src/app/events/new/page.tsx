import EventForm from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Host New Event</h1>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">Create a new event entry with details and gallery.</p>
      </div>
      <EventForm />
    </div>
  );
}
