"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      window.location.href = "/";
    } catch (err) {
      setError("INVALID CREDENTIALS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="card-brutalist w-full max-w-md stagger-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-[0.2em] text-accent">MIGHTY</h1>
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] mt-2 uppercase">Command Center Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-brutalist w-full" 
              placeholder="ADMIN@MIGHTYMUSIC.COM" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-brutalist w-full" 
              placeholder="••••••••" 
              required 
            />
          </div>

          {error && (
            <p className="text-[10px] font-mono text-destructive text-center uppercase">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-4 bg-accent text-accent-foreground text-xs font-mono font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 uppercase"
          >
            {isLoading ? "AUTHENTICATING..." : "SYSTEM OVERRIDE (LOGIN)"}
          </button>
        </form>
      </div>
    </div>
  );
}
