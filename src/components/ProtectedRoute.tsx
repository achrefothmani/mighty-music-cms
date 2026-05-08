"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token && pathname !== "/login") {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (!isAuthorized && pathname !== "/login") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]">
        <div className="text-accent animate-pulse-brutalist mb-4">
          <h1 className="text-4xl font-bold tracking-[0.3em]">MIGHTY</h1>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground tracking-[0.5em] uppercase">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
