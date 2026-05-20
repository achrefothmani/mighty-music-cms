"use client";

import { useState, useEffect } from "react";
import { getConfig, updateConfig } from "@/services/config.service";
import { RefreshCw, Save, Type, Palette, Share2, ToggleLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { SiteConfig } from "@/lib/types";

export default function ParamsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!config) return;
    
    const validWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const families = Object.values(config.typography).map((t: any) => {
      const family = t.font.replace(/ /g, '+');
      const weight = validWeights.includes(t.weight.toString()) ? `:wght@${t.weight}` : '';
      return `family=${family}${weight}`;
    });
    
    const url = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
    
    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [config?.typography]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await getConfig();
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch config", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setStatus(null);
    try {
      await updateConfig(config);
      setStatus({ type: 'success', message: 'Configuration updated successfully' });
      // Clear status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Failed to update config", error);
      setStatus({ type: 'error', message: 'Failed to update configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateNestedField = (section: keyof SiteConfig, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateTypography = (tag: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [tag]: {
          ...prev.typography[tag],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-accent" size={40} />
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Syncing Parameters...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="stagger-in space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">Site Parameters</h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-1 tracking-[0.2em] uppercase">Global configuration & Branding</p>
        </div>
        <div className="flex items-center gap-4">
          {status && (
            <div className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-wider ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {status.message}
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 px-6 py-2 bg-accent text-white text-[10px] font-mono tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Typography Section */}
        <div className="card-brutalist space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Type size={16} className="text-accent" />
            <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">Typography Control</h3>
          </div>
          
          <div className="space-y-8">
            {['h1', 'h2', 'p', 'a'].map((tag) => (
              <div key={tag} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span 
                    className="text-[10px] font-mono uppercase text-accent font-bold"
                    style={{ 
                      fontFamily: (config.typography as any)[tag].font,
                      fontWeight: (config.typography as any)[tag].weight
                    }}
                  >
                    {tag.toUpperCase()} Settings
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Font Family</label>
                    <input 
                      type="text" 
                      value={(config.typography as any)[tag].font} 
                      onChange={(e) => updateTypography(tag, 'font', e.target.value)}
                      className="w-full bg-background border border-border p-2 text-[10px] font-mono uppercase focus:border-accent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Weight</label>
                    <input 
                      type="text"
                      value={(config.typography as any)[tag].weight} 
                      onChange={(e) => updateTypography(tag, 'weight', e.target.value)}
                      placeholder="e.g. 400, 700"
                      className="w-full bg-background border border-border p-2 text-[10px] font-mono uppercase focus:border-accent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Size</label>
                    <input 
                      type="text" 
                      value={(config.typography as any)[tag].size} 
                      onChange={(e) => updateTypography(tag, 'size', e.target.value)}
                      className="w-full bg-background border border-border p-2 text-[10px] font-mono uppercase focus:border-accent outline-none"
                    />
                  </div>
                </div>
                {/* Preview */}
                <div className="p-4 border border-dashed border-border mt-2 bg-card">
                  <label className="text-[8px] font-mono text-muted-foreground uppercase mb-2 block tracking-widest">Live Preview</label>
                  <div style={{ 
                    fontFamily: (config.typography as any)[tag].font, 
                    fontWeight: (config.typography as any)[tag].weight,
                    fontSize: (config.typography as any)[tag].size
                  }}>
                    The quick brown fox jumps over the lazy dog.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branding & Feature Toggles */}
        <div className="space-y-8">
          <div className="card-brutalist">
            <div className="flex items-center gap-3 mb-6">
              <Palette size={16} className="text-accent" />
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">Branding & Identity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block">Primary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={config.branding.primary_color} 
                    onChange={(e) => updateNestedField('branding', 'primary_color', e.target.value)}
                    className="h-9 w-12 bg-background border border-border p-1 outline-none"
                  />
                  <input 
                    type="text" 
                    value={config.branding.primary_color} 
                    onChange={(e) => updateNestedField('branding', 'primary_color', e.target.value)}
                    className="flex-1 bg-background border border-border p-2 text-[10px] font-mono uppercase outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block">Accent Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={config.branding.accent_color} 
                    onChange={(e) => updateNestedField('branding', 'accent_color', e.target.value)}
                    className="h-9 w-12 bg-background border border-border p-1 outline-none"
                  />
                  <input 
                    type="text" 
                    value={config.branding.accent_color} 
                    onChange={(e) => updateNestedField('branding', 'accent_color', e.target.value)}
                    className="flex-1 bg-background border border-border p-2 text-[10px] font-mono uppercase outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-brutalist">
            <div className="flex items-center gap-3 mb-6">
              <Share2 size={16} className="text-accent" />
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">Social Presence</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {['instagram', 'twitter', 'youtube', 'facebook'].map(platform => (
                <div key={platform} className="space-y-1">
                  <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block">{platform}</label>
                  <input 
                    type="text" 
                    value={(config.socials as any)[platform]} 
                    onChange={(e) => updateNestedField('socials' as any, platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourprofile`}
                    className="w-full bg-background border border-border p-2 text-[10px] font-mono focus:border-accent outline-none"
                  />
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
