"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/app/_context/usercontext";
import { getPastPicks } from "@/app/_lib/supabase/database";

const PastBets = () => {
  const { user } = useUser();
  const [pastPicks, setPastPicks] = useState<any[]>([]);

  useEffect(() => {
    if (user.player_id) {
      fetchPastPicks();
    }
  }, [user.player_id]);

  const fetchPastPicks = async () => {
    try {
      const picks = await getPastPicks(user.player_id);
      setPastPicks(picks);
    } catch (error) {
      console.error("Error fetching past picks:", error);
    }
  };

  return (
    <div className="bg-cpb-darkgreen w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 pb-24 relative mt-5">
      <div className="grid grid-cols-4 gap-4 w-full text-center font-bold mb-4">
        <div>#</div>
        <div>PICK</div>
        <div>PLAY</div>
        <div>PAYOUT</div>
      </div>
      <div className="w-full max-h-[100px] min-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-cpb-basewhite scrollbar-track-cpb-darkgreen">
        {pastPicks.map((pick, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 w-full text-center mb-2 text-[14px] capitalize">
            <div>{index + 1}</div>
            <div>{pick.guess.type} {pick.guess.distance}</div>
            <div>{pick.actual.type} {pick.actual.distance}</div>
            <div>{pick.balanceChange}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastBets;