"use client";

import Navigation from "@/app/_components/navigation";
import PlayView from "./views/playView";
import StandingsView from "./views/standingsView";
import EarnView from "./views/earnView";
import WinView from "./views/winView";
import ProfileView from "./views/profileView";
import Link from "next/link";
import SvgIcon from "@/app/_components/icons/svgIcon";
import useSound from "use-sound";
import { useState } from "react";

export default function Page() {
  const [activeView, setActiveView] = useState("play");
  const [playToggleSound] = useSound("/sfx/tab-switch.wav");

  const getBackgroundStyle = () => {
    switch (activeView) {
      case "play":
        return "bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(158.04deg,#00D4A1_-24.59%,#00644F_52.08%)]";
      case "standings":
        return "bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(158.04deg,#5392D3_0%,#002852_100%)]";
      case "earn":
        return "bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(158.04deg,#FAE720_0%,#101010_100%)]";
      case "win":
        return "bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(158.04deg,#8B6AF8_0%,#101010_100%)]";
      case "profile":
        return "bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(158.04deg,#0C1D17_0%,#101010_100%)]";
    }
  };

  return (
    <div
      className={`relative bg-cover bg-top ${getBackgroundStyle()} shadow-[0_0_50px_0_rgba(0,0,0,0.25)] min-h-full z-50`}
    >
      <Navigation theme={"dark"} />
      {activeView === "play" && <PlayView />}
      {activeView === "standings" && <StandingsView />}
      {activeView === "earn" && <EarnView />}
      {activeView === "win" && <WinView />}
      {activeView === "profile" && <ProfileView />}
      <div className="nav-bar">
        <Link
          className={`flex flex-col items-center justify-center align-center ${
            activeView === "play" ? "text-[#00D4A1]" : "text-[#8B8B8C]"
          }`}
          href="/"
          onClick={() => {
            setActiveView("play");
          }}
        >
          <SvgIcon className="w-8 h-8" name="play" />
          <p className="text-current text-base font-flick">PLAY</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${
            activeView === "standings" ? "text-[#5392D3]" : "text-[#8B8B8C]"
          }`}
          href="/"
          onClick={() => {
            setActiveView("standings");
          }}
        >
          <SvgIcon className="w-8 h-8" name="standings" />
          <p className="text-current text-base font-flick">STANDINGS</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${
            activeView === "earn" ? "text-[#FED45F]" : "text-[#8B8B8C]"
          }`}
          href="/"
          onClick={() => {
            setActiveView("earn");
          }}
        >
          <SvgIcon className="w-8 h-8" name="earn" />
          <p className="text-current text-base font-flick">EARN</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${
            activeView === "win" ? "text-[#8971D7]" : "text-[#8B8B8C]"
          }`}
          href="/"
          onClick={() => {
            setActiveView("win");
          }}
        >
          <SvgIcon className="w-8 h-8" name="win" />
          <p className="text-current text-base font-flick">WIN</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${
            activeView === "profile" ? "text-[#F9F9FB]" : "text-[#8B8B8C]"
          }`}
          href="/"
          onClick={() => {
            setActiveView("profile");
          }}
        >
          <SvgIcon className="w-8 h-8" name="profile" />
          <p className="text-current text-base font-flick">PROFILE</p>
        </Link>
      </div>
      <style jsx>{`
.nav-bar {
  position: fixed;
  height: 84px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #101010;
  border-radius: 1.5rem 1.5rem 0 0;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 2rem;
  z-index: 50;
}

@media (min-width: 768px) {
  .nav-bar {
    position: absolute;
    top: auto;
    bottom: 0;
  }
}
      `}</style>
    </div>
  );
}