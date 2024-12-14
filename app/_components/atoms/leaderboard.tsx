"use client";

import Link from "next/link";
import { useGame } from "../../_context/gameContext";
import { getLeaderboard } from "../../_lib/supabase/database";
import { useEffect, useState } from "react";
import { useUser } from "../../_context/usercontext";

type LeaderboardItem = {
  username: string | null;
  coin_balance: number;
  is_anon: boolean;
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);

  const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboardData(data?.map(item => ({
          ...item,
          is_anon: item.username === null
        })) || []);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5">
      <div className="w-full grid grid-cols-3 gap-3 text-sm mt-3 text-left">
        {/* Header Row */}
        <div className="font-bold text-center mr-auto">RANK</div>
        <div className="font-bold text-center mr-auto">NAME</div>
        <div className="font-bold text-center mr-auto">COINS</div>
        
        {/* Data Rows */}
        {leaderboardData.map((item, index) => (
          <>
            <div key={`rank-${index}`} className="text-center mr-auto">{index + 1}</div>
            <div key={`name-${index}`} className="text-center mr-auto">
              {item.is_anon || !item.username ? "ANON" : item.username}
            </div>
            <div key={`coins-${index}`} className="text-center mr-auto">{item.coin_balance}</div>
          </>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;