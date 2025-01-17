"use client";

import React, { useEffect } from "react";
import { Chakra_Petch } from "@next/font/google";
import { UserProvider } from "@/app/_context/usercontext";
import Navigation from "@/app/_components/navigation";
import { ViewProvider } from "../_context/viewContext";

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
      <ViewProvider>
      <html lang="en">
        <body className={`${chakraPetch.className} bg-white min-h-full`}>
          <main className="flex content-center justify-center bg-white min-h-full">
            <div className="flex flex-col w-full max-w-[430px]">
              <Navigation theme={"light"} sideNav={false}></Navigation>
              <div className="flex flex-col items-center w-full">
                <div className="h-20 flex justify-center items-center w-full">
                  <svg
                    width="169"
                    height="35"
                    viewBox="0 0 169 35"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.409 0.049997C24.109 0.049997 25.3923 0.649997 26.259 1.85C27.1257 3.01667 27.3257 4.43333 26.859 6.1L23.009 20.6C22.5423 22.2667 21.559 23.7 20.059 24.9C18.559 26.1 16.959 26.7 15.259 26.7H9.95898L7.65898 35H0.808984L8.40898 5.6L11.659 7.45L6.80898 -2.38419e-06L22.409 0.049997ZM15.759 20.6L19.709 5.75H13.359L15.109 7.55L11.959 19.2H8.75898L11.609 20.6H15.759ZM28.9855 28.9H39.8355L35.1855 35H22.7855L30.6855 5.6L33.8855 7.45L29.0355 -2.38419e-06H39.3855L31.9855 27.65L28.9855 28.9ZM49.2984 -2.38419e-06H63.0484L59.4484 35H52.1984L52.7484 30.6H45.0984L46.7984 31.95L45.5484 35H38.2984L50.9984 5.6L54.1984 7.45L49.2984 -2.38419e-06ZM53.5484 24.15L55.1484 11.65L49.9984 24.15H53.5484ZM83.8223 -2.38419e-06H91.0223L87.3223 13.95C86.7889 15.85 85.7889 17.6 84.3223 19.2C82.8889 20.7667 81.2223 21.9333 79.3223 22.7L76.0223 35H68.7723L71.5223 24.8H75.7223L71.9723 23.05C70.2389 22.3833 68.9889 21.2167 68.2223 19.55C67.4889 17.8833 67.4056 16.0167 67.9723 13.95L70.1723 5.6L73.4223 7.45L68.5723 -2.38419e-06H78.9723L74.2723 17.55H82.7723L79.5223 16L83.8223 -2.38419e-06ZM105.221 0.049997C106.921 0.049997 108.205 0.649997 109.071 1.85C109.938 3.01667 110.138 4.43333 109.671 6.1L105.821 20.6C105.355 22.2667 104.371 23.7 102.871 24.9C101.371 26.1 99.7715 26.7 98.0715 26.7H92.7715L90.4715 35H83.6215L91.2215 5.6L94.4715 7.45L89.6215 -2.38419e-06L105.221 0.049997ZM98.5715 20.6L102.521 5.75H96.1715L97.9215 7.55L94.7715 19.2H91.5715L94.4215 20.6H98.5715ZM111.848 -2.38419e-06H122.198L112.748 35H105.598L113.498 5.6L116.698 7.45L111.848 -2.38419e-06ZM133.098 6.1L127.448 27.3L124.148 28.9H136.598L135.448 35H124.098C122.398 35 121.115 34.4167 120.248 33.25C119.381 32.05 119.181 30.6 119.648 28.9L125.898 5.6L129.148 7.45L124.248 -2.38419e-06H144.798L142.048 6.1H133.098ZM168.094 -2.38419e-06L158.994 13.4L154.594 14.95L157.894 15V35H150.494L150.194 22.65L153.394 21.65H149.844L146.244 35H139.094L146.994 5.6L150.194 7.45L145.344 -2.38419e-06H155.694L151.694 14.8L161.894 -2.38419e-06H168.094Z"
                      fill="#0C1D17"
                    />
                  </svg>
                </div>
                {children}
              </div>
            </div>
          </main>
        </body>
      </html>
      </ViewProvider>
    </UserProvider>
  );
}
