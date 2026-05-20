"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;
  
  // Extract title from pathname
  const getTitle = () => {
    if (pathname === "/") return "COMMAND CENTER";
    const segment = pathname.split("/")[1];
    return segment.toUpperCase().replace(/-/g, " ");
  };

  const getCTA = () => {
    const segments = pathname.split("/");
    const section = segments[1];
    
    // Don't show NEW button if already on a new or edit page or for params
    if (pathname === "/" || segments.length > 2 || section === "params") return null;
    
    return {
      text: `＋ NEW ${section.slice(0, -1).toUpperCase()}`,
      href: `/${section}/new`
    };
  };

  const cta = getCTA();

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-8 h-[72px]">
        <h2 className="text-sm font-mono tracking-[0.3em] font-bold">
          {getTitle()}
        </h2>
        
        {cta && (
          <button 
            onClick={() => router.push(cta.href)}
            className="btn-primary flex items-center gap-2 text-[10px] font-bold"
          >
            {cta.text}
          </button>
        )}
      </div>
    </header>
  );
}
