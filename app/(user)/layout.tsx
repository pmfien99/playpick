"use client";

import React from "react";
import { Chakra_Petch } from "@next/font/google";
import { UserProvider } from "@/app/_context/usercontext";
import { GameProvider } from "@/app/_context/gameContext";
import { PastPicksProvider } from "@/app/_context/pastPicksContext";

import "@/app/globals.css";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <GameProvider>
        <PastPicksProvider> 
          <html lang="en">
            <body
              className={`${chakraPetch.className} bg-cpb-basewhite min-h-full`}
            >
              <main className="flex content-center justify-center bg-cpb-basegreen bg-[url('../public/bg-texture.svg')] bg-repeat min-h-[100vh]">
                <div className="flex flex-col w-full max-w-[430px] ">
                  {children}
                </div>
              </main>
            </body>
          </html>
        </PastPicksProvider>
      </GameProvider>
    </UserProvider>
  );
}