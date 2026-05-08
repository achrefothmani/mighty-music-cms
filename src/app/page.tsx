"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import { getArtists } from "@/services/artists.service";
import { Artist } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

export default function Dashboard() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getArtists();
        setArtists(data);
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const genreCounts = artists.reduce((acc: Record<string, number>, artist) => {
    const genre = artist.genre.toUpperCase();
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const genreData = Object.entries(genreCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="stagger-in space-y-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="TOTAL ARTISTS" value={isLoading ? "..." : artists.length} delta={isLoading ? "" : "LIVE"} />
        <StatCard label="TOTAL TRACKS" value="-" delta="PENDING" />
        <StatCard label="WEBSITE VIEWS" value="24.8K" delta="18%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="card-brutalist flex flex-col">
          <h3 className="text-xs font-mono tracking-[0.2em] mb-8 text-muted-foreground uppercase">
            GENRE DISTRIBUTION
          </h3>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-muted-foreground">LOADING DATA...</div>
            ) : genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#555555" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="var(--font-space-mono)"
                  />
                  <YAxis 
                    stroke="#555555" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="var(--font-space-mono)"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", borderRadius: 0 }}
                    itemStyle={{ color: "#F5F0E8", fontSize: "10px", fontFamily: "var(--font-space-mono)" }}
                  />
                  <Bar dataKey="count" fill="#e11d48" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-muted-foreground">NO DATA AVAILABLE</div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="card-brutalist flex flex-col">
          <h3 className="text-xs font-mono tracking-[0.2em] mb-8 text-muted-foreground uppercase">
            RECENT ACTIVITY
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-center h-full font-mono text-[10px] text-muted-foreground uppercase">
               Integration in progress...
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
