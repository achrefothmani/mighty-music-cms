"use client";

import { useState, useEffect } from "react";
import { getConfig, updateConfig } from "@/services/config.service";
import { RefreshCw, Save, Type, Palette, Share2, ToggleLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ParamsPage() {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

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

  const updateNestedField = (section: string, field: string, value: any) => {
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
            {['h1', 'h2', 'p'].map((tag) => (
              <div key={tag} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">{tag.toUpperCase()} Settings</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Font Family</label>
                    <input 
                      type="text" 
                      value={config.typography[tag].font} 
                      onChange={(e) => updateTypography(tag, 'font', e.target.value)}
                      className="w-full bg-background border border-border p-2 text-[10px] font-mono uppercase focus:border-accent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Weight</label>
                    <select 
                      value={config.typography[tag].weight} 
                      onChange={(e) => updateTypography(tag, 'weight', e.target.value)}
                      className="w-full bg-background border border-border p-2 text-[10px] font-mono uppercase focus:border-accent outline-none"
                    >
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Size</label>
                    <input 
                      type="text" 
                      value={config.typography[tag].size} 
                      onChange={(e) => updateTypography(tag, 'size', e.target.value)}
                      className="w-full bg-background border border-border p-2 text-[10px] font-mono uppercase focus:border-accent outline-none"
                    />
                  </div>
                </div>
                {/* Preview */}
                <div className="p-4 border border-dashed border-border mt-2 bg-card">
                  <label className="text-[8px] font-mono text-muted-foreground uppercase mb-2 block tracking-widest">Live Preview</label>
                  <div style={{ 
                    fontFamily: config.typography[tag].font, 
                    fontWeight: config.typography[tag].weight,
                    fontSize: config.typography[tag].size
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
                    value={config.socials[platform]} 
                    onChange={(e) => updateNestedField('socials', platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourprofile`}
                    className="w-full bg-background border border-border p-2 text-[10px] font-mono focus:border-accent outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card-brutalist">
            <div className="flex items-center gap-3 mb-6">
              <ToggleLeft size={16} className="text-accent" />
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">System Modules</h3>
            </div>
            <div className="space-y-4">
              {Object.keys(config.features).map(feature => (
                <div key={feature} className="flex items-center justify-between p-3 border border-border hover:bg-card transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-widest">{feature.replace('show_', '').replace('_', ' ')}</span>
                  <button 
                    onClick={() => updateNestedField('features', feature, !config.features[feature])}
                    className={`w-12 h-6 flex items-center p-1 transition-colors ${config.features[feature] ? 'bg-accent' : 'bg-muted'}`}
                  >
                    <div className={`w-4 h-4 bg-white transition-transform ${config.features[feature] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
