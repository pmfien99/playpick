"use client";

import Link from "next/link";
import { useGame } from "../_context/gameContext";
import { getLeaderboard } from "../_lib/supabase/database";
import { useEffect, useState } from "react";
import { useUser } from "../_context/usercontext";
type LeaderboardItem = {
  username: string | null;
  points: number;
  is_anon: boolean;
};

const Scoreboard = () => {
  const { isMatchActive, driveId, playId } = useGame();
  const { user } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (driveId) {
        try {
          const data = await getLeaderboard(driveId);
          setLeaderboardData(data || []);
        } catch (error) {
          console.error("Error fetching leaderboard data:", error);
        }
      }
    };

    fetchLeaderboard();
  }, [playId]);

  return (
    <div className="bg-cpb-baseblack w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5">
      <h2 className="text-base font-bold">Scoreboard</h2>
      {isMatchActive ? (
        <div className="w-full">
          <div className="w-full grid grid-cols-2 grid-rows-5 gap-3 gap-x-20 text-sm mt-3 grid-flow-col">
            {leaderboardData.map((item, index) => (
              <div
                key={index}
                className={`w-full flex flex-row justify-start gap-5`}
              >
                <p className="w-3">{index + 1}</p>
                <p>{item.is_anon || !item.username ? "ANON" : item.username}</p>
                <p className="ml-auto">{item.points}</p>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            {user.is_anon && (
              <Link
                className="mt-8 uppercase text-lg font-bold w-full border-cpb-basegreen border-2 rounded-xl py-3 text-center"
                href="/sign-in"
              >
                LOG IN TO JOIN LEADERBOARD
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col justify-center items-center">
          <h2 className="mb-auto w-min-full">No match currently active</h2>
          {user.is_anon && (
            <Link
              className="mt-8 uppercase text-lg font-bold w-full border-cpb-basegreen border-2 rounded-xl py-3 text-center"
              href="/sign-in"
            >
              SIGN UP TO PLAY HERE
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
