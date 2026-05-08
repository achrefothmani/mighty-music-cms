"use client";

import { useEffect, useState, use } from "react";
import { getEventById } from "@/services/events.service";
import { Event } from "@/lib/types";
import EventForm from "@/components/events/EventForm";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!event) return <div className="text-center py-20 font-mono uppercase tracking-widest text-muted-foreground">Event not found</div>;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Edit Event / {event.title}</h1>
      </div>
      <EventForm initialData={event} />
    </div>
  );
}
