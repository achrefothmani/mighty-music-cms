"use client";

import { useEffect, useState, use } from "react";
import { getPartnershipById } from "@/services/partnerships.service";
import { Partnership } from "@/lib/types";
import PartnershipForm from "@/components/partnerships/PartnershipForm";

interface EditPartnershipPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPartnershipPage({ params }: EditPartnershipPageProps) {
  const { id } = use(params);
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPartnershipById(id);
        setPartnership(data);
      } catch (error) {
        console.error("Failed to fetch partnership:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!partnership) return <div className="text-center py-20 font-mono uppercase tracking-widest text-muted-foreground">Partnership not found</div>;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Edit Partnership / {partnership.title}</h1>
      </div>
      <PartnershipForm initialData={partnership} />
    </div>
  );
}
