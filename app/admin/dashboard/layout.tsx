"use client";

import Navigation from "@/app/admin/_components/navigation";
import Sidebar from "@/app/admin/_components/sidebar";
import { GameProvider } from "@/app/_context/gameContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider>
          <div className="min-w-full">
            <Navigation></Navigation>
            <div className="flex flex-row max-h-[calc(100vh-5rem)] overflow-hidden">
              <Sidebar></Sidebar>
              {children}
            </div>
          </div>
    </GameProvider>
  );
}
