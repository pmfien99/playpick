"use client";

import { Chakra_Petch } from "@next/font/google";

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
    <html lang="en" >
      <body className={`${chakraPetch.className} bg-white min-h-full text-cpb-baseblack`}>
        <main className="flex content-center justify-center bg-white min-h-[100vh] min-w-full">
          {children}
        </main>
      </body>
    </html>

  );
}
