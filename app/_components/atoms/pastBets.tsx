"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/app/_context/usercontext";
import { getPastPicks } from "@/app/_lib/supabase/database";

const PastBets = () => {
  const { user } = useUser();
  const [pastPicks, setPastPicks] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <div
        className={`font-flick font-normal text-[16px] cursor-pointer w-full flex flex-col justify-center items-center px-10 py-5 z-40 pb-[104px] mt-auto absolute bottom-0 ${
          isOpen ? "bg-white text-black" : "bg-cpb-darkgreen text-cpb-basewhite"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <p>{isOpen ? "CLOSE" : "Play Log"}</p>
      </div>
      <div
        className={`bg-cpb-darkgreen w-full text-cpb-basewhite flex flex-col items-center px-10 pt-24 pb-24 absolute z-30 top-0 left-0 min-h-[100vh] max-h-[100vh] transition-transform z-10 duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="grid grid-cols-4 gap-4 w-full text-center font-bold mb-4">
          <div>#</div>
          <div>PICK</div>
          <div>PLAY</div>
          <div>PAYOUT</div>
        </div>
        <div className="w-full max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cpb-basewhite scrollbar-track-cpb-darkgreen relative top-0 left-0">
          {pastPicks.map((pick, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 w-full text-center mb-2 text-[14px] capitalize"
            >
              <div>{index + 1}</div>
              <div>
                {pick.guess.type} {pick.guess.distance}
              </div>
              <div>
                {pick.actual.type} {pick.actual.distance}
              </div>
              <div>{pick.balanceChange}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PastBets;