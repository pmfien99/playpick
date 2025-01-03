"use client";

import { useEffect } from "react";
import { useGame } from "@/app/_context/gameContext";
import { createClient } from "@/app/_lib/supabase/client";
import Image from "next/image";

const supabaseClient = createClient();

const GameDisplay = () => {
  const { isMatchActive, matchData, play_state } = useGame();

  useEffect(() => {
    console.log("game state");
  }, []);

  const downText = (() => {
    switch (matchData?.currentDown) {
      case 1:
        return "First Down";
      case 2:
        return "Second Down";
      case 3:
        return "Third Down";
      case 4:
        return "Fourth Down";
      default:
        return "Break";
    }
  })();

  const isHomeTeamPossession = matchData?.possessionId === matchData?.homeTeamId;


  return (
    <div className="flex flex-row w-full justify-center gap-4 my-4">
      <div className="w-16 h-16 relative">
        <Image
          width={64}
          height={64}
          src={
            isMatchActive
              ? matchData?.awayTeamLogo || "/placeholder.png"
              : "/placeholder.png"
          }
          alt={
            isMatchActive ? matchData?.awayTeamName || "away-logo" : "away-logo"
          }
          className="w-full h-full rounded-full object-contain border-2 border-white bg-cpb-basewhite"
        />
        {matchData?.possessionId === matchData?.awayTeamId && (
          <Image
          src="/possession_indicator.png"
          width={24}
          height={24}
          alt="possession-indicator"
          className="absolute top-1/2 right-[72px] transform -translate-y-1/2"
          />
        )}
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-row justify-center items-center">
          <div className="w-[25px] h-[25px] flex justify-start items-center">
            <svg
              width="18"
              height="22"
              viewBox="0 0 18 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={isHomeTeamPossession ? "opacity-0" : ""}
            >
              <path
                d="M0.500001 11.8661C-0.166666 11.4812 -0.166666 10.519 0.5 10.1341L16.25 1.04083C16.9167 0.655932 17.75 1.13706 17.75 1.90686L17.75 20.0934C17.75 20.8632 16.9167 21.3443 16.25 20.9594L0.500001 11.8661Z"
                fill="#101010"
              />
            </svg>
          </div>
          <div className="w-[38px] h-auto mt-[7px]">
            <Image
              src={`/downmarker-${matchData?.currentDown}.svg`}
              width={32}
              height={32}
              alt="possession-indicator"
              className="relative w-full h-auto"
            />
          </div>
          <div className="w-[25px] h-[25px] flex justify-end items-center">
            <svg
              width="19"
              height="22"
              viewBox="0 0 19 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={isHomeTeamPossession ? "" : "opacity-0"}
            >
              <path
                d="M18 10.1341C18.6667 10.519 18.6667 11.4812 18 11.8661L2.25 20.9594C1.58333 21.3443 0.749997 20.8632 0.749997 20.0934L0.749998 1.90685C0.749998 1.13705 1.58333 0.655929 2.25 1.04083L18 10.1341Z"
                fill="#101010"
              />
            </svg>
          </div>
        </div>

        <p className="text-cpb-baseblack text-normal">{downText}</p>
      </div>
      <div className="w-16 h-16 relative">
        <Image
          src={
            isMatchActive
              ? matchData?.homeTeamLogo || "/placeholder.png"
              : "/placeholder.png"
          }
          width={64}
          height={64}
          alt={
            isMatchActive ? matchData?.homeTeamName || "team-logo" : "team-logo"
          }
          className="w-full h-full rounded-full object-contain border-2 border-white bg-cpb-basewhite"
        />
        {matchData?.possessionId === matchData?.homeTeamId && (
          <Image
            src="/possession_indicator.png"
            width={24}
            height={24}
            alt="possession-indicator"
            className="absolute top-1/2 left-[72px] transform -translate-y-1/2"
          />
        )}
      </div>
    </div>
  );
};

export default GameDisplay;
