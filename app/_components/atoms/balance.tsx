"use client";

import { useEffect } from "react";
import { useUser } from "@/app/_context/usercontext";
import { createClient } from "@/app/_lib/supabase/client";
import SvgCoin from "../icons/svgCoin";
import { getCoinBalance } from "@/app/_lib/supabase/database";
import { useState } from "react";

const supabaseClient = createClient();

const Balance = () => {
  const { user } = useUser();
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchUserScore();
  }, [user.player_id]);

  useEffect(() => {
    const coinBalanceSubscription = supabaseClient
      .channel("player_coin_balance")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `player_id=eq.${user.player_id}`,
        },
        async (payload: any) => {
          if (payload.new) {
            setScore(payload.new.coin_balance);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(coinBalanceSubscription);
    };
  }, [user.player_id]);

  const fetchUserScore = async () => {
    try {
      if (user.player_id != null) {
        const userScore = await getCoinBalance(user.player_id);
        if (userScore != null) {
          setScore(userScore.coin_balance);
        } else {
          setScore(0);
        }
      }
    } catch (error) {
      console.error("Error fetching user score:", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center relative m-auto">
        <div className="relative flex items-center justify-center m-auto">
          <p className="text-cpb-basewhite text-[100px] leading-none [text-shadow:0px_0px_15.65px_rgba(255,255,255,0.5)]">
            {score}
          </p>
          <div className="w-[18px] h-[18px] absolute top-1/2 left-0 transform -translate-y-1/2 flex items-center justify-center ml-[-18px]">
          <SvgCoin />
          </div>
        </div>
      </div>
    </>
  );
};

export default Balance;
