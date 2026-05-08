import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProtectedRoute from "@/components/ProtectedRoute";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "MIGHTY MUSIC CMS",
  description: "Advanced Music Label Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body
        className={`${spaceMono.variable} ${syne.variable} font-sans antialiased min-h-screen flex text-foreground`}
      >
        <ProtectedRoute>
          <div className="flex flex-1 w-full">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <div className="flex-1 p-8 flex flex-col">
                {children}
              </div>
            </main>
          </div>
        </ProtectedRoute>
      </body>
    </html>
  );
}
