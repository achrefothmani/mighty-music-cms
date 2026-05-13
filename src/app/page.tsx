"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import { getArtists } from "@/services/artists.service";
import { getAnalyticsOverview } from "@/services/analytics.service";
import { Artist, AnalyticsData } from "@/lib/types";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { Users, Eye, MousePointer, RefreshCw, BarChart3, Music, Disc } from "lucide-react";

export default function CommandCenter() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [artistsData, analyticsData] = await Promise.all([
        getArtists(),
        getAnalyticsOverview()
      ]);

      setArtists(artistsData);
      setAnalytics(analyticsData);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch command center data", e);
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-accent" size={40} />
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Syncing Systems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center min-h-[400px]">
        <div className="max-w-md space-y-4">
          <p className="text-red-500 font-mono text-xs uppercase tracking-[0.2em]">System Failure</p>
          <p className="text-muted-foreground text-[10px] font-mono uppercase">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-accent text-white text-[10px] font-mono tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-in space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">Command Center</h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-1 tracking-[0.2em] uppercase">Mighty Music Central Operations</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 hover:bg-card border border-border transition-colors group"
          title="Refresh Data"
        >
          <RefreshCw size={14} className="group-hover:text-accent transition-colors" />
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          label="TOTAL ARTISTS" 
          value={artists.length} 
          delta="LIVE" 
        />
        <StatCard 
          label="TOTAL ALBUMS" 
          value={analytics?.summary.total_albums || 0} 
          icon={<Disc size={14} />}
        />
        <StatCard 
          label="TOTAL SINGLES" 
          value={analytics?.summary.total_singles || 0} 
          icon={<Music size={14} />}
        />
        <StatCard 
          label="TOTAL VIEWS" 
          value={analytics?.summary.total_views.toLocaleString() || "0"} 
          icon={<Eye size={14} />}
        />
        <StatCard 
          label="UNIQUE VISITORS" 
          value={analytics?.summary.unique_visitors.toLocaleString() || "0"} 
          icon={<Users size={14} />}
        />
        <StatCard 
          label="BOUNCE RATE" 
          value={analytics?.summary.bounce_rate || "0%"} 
          icon={<MousePointer size={14} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 card-brutalist flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={14} className="text-accent" />
            <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
              Traffic Evolution
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.views_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#555555" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="var(--font-space-mono)"
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                    itemStyle={{ color: "#e11d48", fontSize: "10px", fontFamily: "var(--font-space-mono)" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#e11d48" 
                    strokeWidth={2} 
                    dot={{ r: 0 }} 
                    activeDot={{ r: 4, fill: '#e11d48' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-muted-foreground uppercase">No Traffic Data</div>
            )}
          </div>
        </div>

        {/* Top Pages Section */}
        <div className="card-brutalist flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={14} className="text-accent" />
            <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
              Content Ranking
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {analytics && analytics.top_pages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_pages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="path" 
                    type="category" 
                    width={80} 
                    stroke="#555555" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="var(--font-space-mono)"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", borderRadius: 0 }}
                    cursor={{ fill: '#1A1A1A' }}
                    itemStyle={{ color: "#e11d48", fontSize: "10px", fontFamily: "var(--font-space-mono)" }}
                  />
                  <Bar dataKey="views" fill="#e11d48" radius={[0, 2, 2, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-muted-foreground uppercase">No Content Data</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-3 card-brutalist flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Music size={14} className="text-accent" />
            <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
              Genre Repartition
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {analytics && analytics.genre_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.genre_distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="genre" 
                    type="category" 
                    width={100} 
                    stroke="#555555" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="var(--font-space-mono)"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", borderRadius: 0 }}
                    cursor={{ fill: '#1A1A1A' }}
                    itemStyle={{ color: "#e11d48", fontSize: "10px", fontFamily: "var(--font-space-mono)" }}
                  />
                  <Bar dataKey="count" fill="#e11d48" radius={[0, 2, 2, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-muted-foreground uppercase">No Genre Data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
