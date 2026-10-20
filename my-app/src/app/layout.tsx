import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/navigation/nav";
import { PlayerBar } from "@/components/player/player-bar";
import { PlayerProvider } from "@/components/player/player-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Music",
  description: "A personal player for the music files on your device.",
  appleWebApp: { capable: true, title: "My Music", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
        <PlayerProvider>
          <Suspense>
            <Nav />
            {children}
          </Suspense>
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
