"use client";

import {
  endAllMatches,
  createPlay,
  setDown,
  getMatchPlays,
} from "@/app/_lib/supabase/database";
import { useEffect, useState } from "react";
import { Drive, PlayState } from "@/app/_types/types";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { useGame } from "@/app/_context/gameContext";
import { setPossession } from "@/app/_lib/supabase/database";
import Play from "./play";

const Game = () => {
  const { matchData, isMatchActive, play_state } = useGame();
  const [showPopup, setShowPopup] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [plays, setPlays] = useState<PlayData[]>([]);
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      selectedTeamId: matchData?.homeTeamId || "",
    },
  });

  interface PlayData {
    play_id: string;
    play_state: PlayState;
    created_at: string;
    play_number: number;
  }

  useEffect(() => {
    fetchPlays();
  }, [matchData]);

  const fetchPlays = async () => {
    try {
      const playsData = await getMatchPlays(matchData?.matchId || "");
      const numberedPlays = playsData.map((play, index) => ({
        ...play,
        play_number: playsData.length - index,
      }));
      setPlays(numberedPlays as PlayData[]);
    } catch (error) {
      console.error("Error fetching plays:", error);
    }
  };

  const getTeamName = (drive: Drive) => {
    if (drive.team_id === matchData?.homeTeamId) {
      return matchData.homeTeamName;
    } else if (drive.team_id === matchData?.awayTeamId) {
      return matchData.awayTeamName;
    }
    return "Unknown Team";
  };

  const handleGameOverClick = () => {
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    await endAllMatches();
    setShowPopup(false);
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  const handleSetPossession = async (teamId: string) => {
    await setPossession(matchData?.matchId || "", teamId);
  };

  const handleAddPlay = async () => {
    if (isCooldown) return;
    setIsCooldown(true);
    await createPlay(matchData?.matchId || "");
    setTimeout(() => setIsCooldown(false), 3000);
  };

  const handleSetDown = async (downNumber: number) => {
    await setDown(matchData?.matchId || "", downNumber);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-col gap-2 items-center">
            <Image
              className="w-16 h-16"
              src={matchData?.homeTeamLogo || ""}
              alt={matchData?.homeTeamName || ""}
              width={64}
              height={64}
            />
            <div className="flex flex-row gap-2 items-center">
              <h1 className="text-2xl font-bold">{matchData?.homeTeamName}</h1>
              <div
                className={`w-3 h-3 rounded-full ${
                  matchData?.possessionId === matchData?.homeTeamId
                    ? "bg-cpb-lightgreen dramatic-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            {matchData?.possessionId === matchData?.homeTeamId ? (
              <div className="p-2 rounded-md bg-cpb-darkgreen text-white opacity-40 pointer-events-none">
                Has Possession
              </div>
            ) : (
              <button
                onClick={() => handleSetPossession(matchData?.homeTeamId || "")}
                className="p-2 rounded-md bg-cpb-darkgreen text-white"
              >
                Take Possession
              </button>
            )}
          </div>
          <h1 className="text-2xl font-regular">VS</h1>
          <div className="flex flex-col gap-2 items-center">
            <Image
              className="w-16 h-16"
              src={matchData?.awayTeamLogo || ""}
              alt={matchData?.awayTeamName || ""}
              width={64}
              height={64}
            />
            <div className="flex flex-row gap-2 items-center">
              <h1 className="text-2xl font-bold">{matchData?.awayTeamName}</h1>
              <div
                className={`w-3 h-3 rounded-full ${
                  matchData?.possessionId === matchData?.awayTeamId
                    ? "bg-cpb-lightgreen dramatic-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            {matchData?.possessionId === matchData?.awayTeamId ? (
              <div className="p-2 rounded-md bg-cpb-darkgreen text-white opacity-40 pointer-events-none">
                Has Possession
              </div>
            ) : (
              <button
                onClick={() => handleSetPossession(matchData?.awayTeamId || "")}
                className="p-2 rounded-md bg-cpb-darkgreen text-white"
              >
                Take Possession
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((down) => (
            <button
              key={down}
              className={`p-2 ${
                matchData?.currentDown !== down ? "opacity-40" : ""
              }`}
              onClick={() => handleSetDown(down)}
            >
              <Image
                src={`/downmarker-${down}.svg`}
                width={32}
                height={17}
                alt={`down-marker-${down}`}
                className="relative"
              />
            </button>
          ))}
        </div>
        <div className="flex flex-row gap-4 mt-4">
          <button
            className={`p-3 rounded-xl font-bold uppercase text-md shadow-md bg-cpb-lightgreen text-cpb-baseblack ${
              play_state === "play_open" ? "opacity-40 pointer-events-none" : ""
            }`}
            onClick={handleAddPlay}
            disabled={play_state === "play_open"}
          >
            Add Play
          </button>
          <button
            className="p-3 rounded-xl font-bold uppercase text-md shadow-md bg-cpb-lightred text-cpb-baseblack"
            onClick={handleGameOverClick}
          >
            Game Over
          </button>
        </div>
        <div className="flex flex-col gap-2 max-w-[1100px] p-8 bg-cpb-basewhite shadow-md w-full border border-cpb-baseblack rounded-lg mt-8">
          {plays.map((play) => (
            <Play
              key={play.play_id}
              play_id={play.play_id}
              play_state={play.play_state}
              created_at={play.created_at}
              play_number={play.play_number}
            />
          ))}
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              Are you sure you want to end the game?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                className="p-2 rounded-md bg-cpb-lightred text-white"
                onClick={handleConfirm}
              >
                Yes
              </button>
              <button
                className="p-2 rounded-md bg-gray-300 text-black"
                onClick={handleCancel}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes dramaticPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 10px 10px rgba(0, 255, 0, 0);
          }
        }

        .dramatic-pulse {
          animation: dramaticPulse 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Game;
