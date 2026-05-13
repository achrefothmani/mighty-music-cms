"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3,
  LayoutDashboard, 
  Mic2, 
  Music, 
  Disc,
  Calendar, 
  Video, 
  Newspaper, 
  Handshake, 
  Users,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { logout } from "@/services/auth.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { label: "COMMAND CENTER", href: "/", icon: LayoutDashboard },
  { label: "ARTISTS", href: "/artists", icon: Mic2 },
  { label: "SINGLE", href: "/music", icon: Music },
  { label: "ALBUMS", href: "/albums", icon: Disc },
  { label: "EVENTS", href: "/events", icon: Calendar },
  { label: "VIDEOS", href: "/videos", icon: Video },
  { label: "NEWS", href: "/news", icon: Newspaper },
  { label: "PARTNERSHIPS", href: "/partnerships", icon: Handshake },
  { label: "USERS", href: "/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/login") return null;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-accent text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-[240px] bg-background border-r border-border z-40 transition-transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-border">
            <h1 className="text-lg font-bold tracking-[0.2em] text-accent">MIGHTY</h1>
            <p className="text-[9px] text-muted-foreground tracking-[0.3em] mt-1">EST. 2026</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 text-[10px] font-mono tracking-wider transition-all hover:bg-card hover:text-accent group",
                        isActive ? "text-foreground border-l-2 border-accent bg-card" : "text-muted-foreground"
                      )}
                    >
                      <item.icon size={16} className={cn(
                        "group-hover:text-accent transition-colors",
                        isActive ? "text-accent" : "text-muted-foreground"
                      )} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Area */}
          <div className="p-6 border-t border-border">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 w-full group hover:text-accent transition-colors"
            >
              <div className="w-7 h-7 bg-accent flex items-center justify-center text-[9px] font-mono text-white">AD</div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-mono uppercase truncate">Admin User</p>
                <div className="flex items-center gap-1">
                  <p className="text-[9px] text-muted-foreground uppercase group-hover:text-accent transition-colors">Logout</p>
                  <LogOut size={9} className="text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

