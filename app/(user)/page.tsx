"use client";

import Navigation from "@/app/_components/navigation";
import PlayView from "./views/playView";
import StandingsView from "./views/standingsView";
import EarnView from "./views/earnView";
import WinView from "./views/winView";
import ProfileView from "./views/profileView";
import Link from "next/link";
import SvgIcon from "@/app/_components/icons/svgIcon";
import useSound from 'use-sound';

import { useState } from "react";

export default function Page() {
  const [activeView, setActiveView] = useState("play");
  const [playToggleSound] = useSound('/sfx/tab-switch.wav');

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
      className={`relative bg-cover bg-top ${getBackgroundStyle()} shadow-[0_0_50px_0_rgba(0,0,0,0.25)] min-h-full`}
    >
      <Navigation theme={"dark"} />
      {activeView === "play" && <PlayView />}
      {activeView === "standings" && <StandingsView />}
      {activeView === "earn" && <EarnView />}
      {activeView === "win" && <WinView />}
      {activeView === "profile" && <ProfileView />}
      <div
        className="absolute h-[84px] flex flex-row bottom-0 left-0 right-0 py-2 px-8 bg-[#101010] rounded-t-3xl rounded-tl-3xl justify-between"
        style={{ top: "calc(100vh - 84px)" }}
      >
        <Link
          className={`flex flex-col items-center justify-center align-center ${activeView === "play" ? "text-[#00D4A1]" : "text-[#8B8B8C]"}`}
          href="/"
          onClick={() => {
            playToggleSound();
            setActiveView("play");
          }}
        >
          <SvgIcon className="w-8 h-8" name="play" />
          <p className="text-current text-base font-flick">PLAY</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${activeView === "standings" ? "text-[#5392D3]" : "text-[#8B8B8C]"}`}
          href="/"
          onClick={() => {
            playToggleSound();
            setActiveView("standings");
          }}
        >
          <SvgIcon className="w-8 h-8" name="standings" />
          <p className="text-current text-base font-flick">STANDINGS</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${activeView === "earn" ? "text-[#FED45F]" : "text-[#8B8B8C]"}`}
          href="/"
          onClick={() => {
            playToggleSound();
            setActiveView("earn");
          }}
        >
          <SvgIcon className="w-8 h-8" name="earn" />
          <p className="text-current text-base font-flick">EARN</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${activeView === "win" ? "text-[#8971D7]" : "text-[#8B8B8C]"}`}
          href="/"
          onClick={() => {
            playToggleSound();
            setActiveView("win");
          }}
        >
          <SvgIcon className="w-8 h-8" name="win" />
          <p className="text-current text-base font-flick">WIN</p>
        </Link>
        <Link
          className={`flex flex-col items-center justify-center align-center ${activeView === "profile" ? "text-[#F9F9FB]" : "text-[#8B8B8C]"}`}
          href="/"
          onClick={() => {
            playToggleSound();
            setActiveView("profile");
          }}
        >
          <SvgIcon className="w-8 h-8" name="profile" />
          <p className="text-current text-base font-flick">PROFILE</p>
        </Link>
      </div>
    </div>
  );
}
