"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/_context/usercontext";
import SvgCoin from "../icons/svgCoin";
import { createClient } from "@/app/_lib/supabase/client";
import { getCoinBalance } from "@/app/_lib/supabase/database";

const supabase = createClient();

interface BalanceProps {
  textSize?: string;
  lineHeight?: string;
  iconSize?: string;
}

const Balance: React.FC<BalanceProps> = ({
  textSize = "text-[80px]",
  lineHeight = "leading-none",
  iconSize = "w-[18px] h-[18px]",
}) => {
  const { user } = useUser();
  const [score, setScore] = useState<number>(0);

  const formatScore = (score: number): { leadingZeros: string; mainNumber: string } => {
    const scoreString = score.toString().padStart(8, '0');
    const leadingZeros = scoreString.slice(0, -score.toString().length);
    const mainNumber = scoreString.slice(-score.toString().length);
    return { leadingZeros, mainNumber };
  };

  const { leadingZeros, mainNumber } = formatScore(score);

  useEffect(() => {
    if (!user.player_id) return;

    const fetchInitialScore = async () => {
      try {
        const initialBalance = await getCoinBalance(user.player_id);
        setScore(initialBalance || 0);
      } catch (error) {
        console.error("Error fetching initial score:", error);
      }
    };

    fetchInitialScore();

    const coinBalanceSubscription = supabase
      .channel("player_coin_balance")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `player_id=eq.${user.player_id}`,
        },
        (payload: any) => {
          if (payload.new) {
            setScore(payload.new.coin_balance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(coinBalanceSubscription);
    };
  }, [user.player_id]);

  return (
    <div className="flex items-center justify-center relative m-auto">
      <div className="relative flex items-center justify-center m-auto">
        <p className={`${textSize} ${lineHeight} [text-shadow:0px_0px_15.65px_rgba(255,255,255,0.5)]`}>
        <span className="inline-block text-transparent [text-shadow:0px_0px_0.9px_white,0px_0px_0.9px_white,0px_0px_0.9px_white,0px_0px_0.9px_white]">
          {leadingZeros}
        </span>     
        <span className="text-cpb-basewhite ">
        {mainNumber}
        </span>   
        </p>
        <div className={`${iconSize} absolute top-1/2 left-0 transform -translate-y-1/2 flex items-center justify-center ml-[-18px]`}>
          <SvgCoin />
        </div>
      </div>
    </div>
  );
};

export default Balance;