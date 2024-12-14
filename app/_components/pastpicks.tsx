"use client";

import { useEffect } from "react";
import { useGame } from "@/app/_context/gameContext";
import { useUser } from "@/app/_context/usercontext";
import { createClient } from "@/app/_lib/supabase/client";

type PastPick = {
  pick_type: string;
  pick_distance: string;
  points_allocated: number;
  play_type: string;
  play_distance: string | null; 
  is_ignored: boolean;
};

const supabaseClient = createClient();

const PastPicks = () => {
  const { isMatchActive, matchData, play_state } = useGame();
  const { user } = useUser();


  return (
    <>
        <div className="bg-cpb-darkgreen w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 pb-14 absolute bottom-[44px] ">
        </div>
    </>
  );
};

export default PastPicks;
