"use client";

import { useState, useEffect } from "react";
import { getAbout } from "@/services/about.service";
import { AboutPage } from "@/lib/types";
import AboutForm from "@/components/about/AboutForm";
import { Info } from "lucide-react";

export default function AboutCMSPage() {
  const [aboutData, setAboutData] = useState<AboutPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setIsLoading(true);
      const data = await getAbout();
      setAboutData(data);
    } catch (err) {
      console.error("Failed to fetch about data:", err);
      setError("FAILED TO LOAD ABOUT PAGE DATA");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-destructive font-mono text-sm uppercase tracking-widest">{error}</div>
        <button 
          onClick={fetchAbout}
          className="btn-brutalist px-6 py-2"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="stagger-in space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Info className="text-accent" size={24} />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Manage About Page</h1>
        </div>
      </div>

      {aboutData && <AboutForm initialData={aboutData} />}
    </div>
  );
}
