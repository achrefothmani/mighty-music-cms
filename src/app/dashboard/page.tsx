"use client";

import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Users, Eye, MousePointer, Clock, RefreshCw, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  summary: {
    total_views: number;
    unique_visitors: number;
    avg_duration: string;
    bounce_rate: string;
  };
  views_over_time: Array<{ date: string; views: number }>;
  top_pages: Array<{ path: string; views: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analytics/overview`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback/Mock data for demonstration if API fails during initial setup
      /*
      setData({
        summary: { total_views: 12500, unique_visitors: 4200, avg_duration: "3:45", bounce_rate: "42%" },
        views_over_time: [
          { date: '2026-05-01', views: 400 },
          { date: '2026-05-02', views: 600 },
          { date: '2026-05-03', views: 500 },
          { date: '2026-05-04', views: 800 },
          { date: '2026-05-05', views: 700 },
        ],
        top_pages: [
          { path: '/', views: 5000 },
          { path: '/artists', views: 3000 },
          { path: '/music', views: 2000 },
        ]
      });
      */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-accent" size={40} />
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Syncing Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-red-500 font-mono text-sm uppercase tracking-wider">System Error</p>
          <p className="text-muted-foreground text-xs">{error}</p>
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

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">Analytics Dashboard</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1 tracking-wider uppercase">Real-time Performance Metrics</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 hover:bg-card border border-border transition-colors group"
          title="Refresh Data"
        >
          <RefreshCw size={18} className="group-hover:text-accent transition-colors" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Views" value={data.summary.total_views.toLocaleString()} icon={<Eye size={20} />} />
        <StatCard title="Unique Visitors" value={data.summary.unique_visitors.toLocaleString()} icon={<Users size={20} />} />
        <StatCard title="Avg. Duration" value={data.summary.avg_duration} icon={<Clock size={20} />} />
        <StatCard title="Bounce Rate" value={data.summary.bounce_rate} icon={<MousePointer size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views Over Time */}
        <div className="lg:col-span-2 bg-card p-8 border border-border">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={18} className="text-accent" />
            <h2 className="text-sm font-bold tracking-widest uppercase">Traffic Evolution</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.views_over_time}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#ff3e00' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#ff3e00" 
                  strokeWidth={2} 
                  dot={{ r: 0 }} 
                  activeDot={{ r: 4, fill: '#ff3e00' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-card p-8 border border-border">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={18} className="text-accent" />
            <h2 className="text-sm font-bold tracking-widest uppercase">Content Ranking</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_pages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="path" 
                  type="category" 
                  width={80} 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px', fontFamily: 'monospace' }}
                  cursor={{ fill: '#222' }}
                />
                <Bar dataKey="views" fill="#ff3e00" radius={[0, 2, 2, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-card p-6 border border-border group hover:border-accent transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="text-muted-group-hover:text-accent transition-colors opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
}
