"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useGame } from "../_context/gameContext";
import { useUser } from "../_context/usercontext";
import { playerSubmitPlay, undoPlay } from "../_lib/supabase/database";
import { createClient } from "@/app/_lib/supabase/client";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Balance from "./atoms/balance";
import GameDisplay from "./atoms/gameDisplay";
import SvgCoin from "./icons/svgCoin";
import useSound from 'use-sound';


const FormSchema = z.object({
  playType: z.enum(["pass", "run"]),
  playLength: z.enum(["short", "med", "long"]),
  playBet: z.enum(["1", "2", "3", "4", "5", "6"]),
});

type FormData = z.infer<typeof FormSchema>;

interface OptionWithSubtext<T extends string> {
  value: T;
  label: string;
  subtext?: string;
}

interface ToggleButtonGroupProps<T extends string> {
  options: OptionWithSubtext<T>[];
  selectedOption: T;
  onChange: (value: T) => void;
}

const ToggleButton = <T extends string>({
  option,
  isSelected,
  onClick,
}: {
  option: OptionWithSubtext<T>;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isSelected}
    className={`rounded-full flex-1 py-2 text-[20px] font-regular focus:outline-none transition-colors duration-200 ${
      isSelected ? "bg-cpb-darkgreen text-white" : ""
    }`}
  >
    <div className="flex flex-col items-center">
      <span>{option.label}</span>
      {option.subtext && (
        <span className="text-xs text-cpb-basewhite opacity-85 font-chakra">
          {option.subtext}
        </span>
      )}
    </div>
  </button>
);

const ToggleButtonGroup = <T extends string>({
  options,
  selectedOption,
  onChange,
}: ToggleButtonGroupProps<T>) => (
  <div
    role="group"
    className="flex overflow-hidden border-2 rounded-full border-dashed border-cpb-basewhite w-full p-2"
  >
    {options.map((option) => (
      <ToggleButton
        key={option.value}
        option={option}
        isSelected={selectedOption === option.value}
        onClick={() => onChange(option.value)}
      />
    ))}
  </div>
);

const supabaseClient = createClient();

const odds = {
  "short-run": 2,
  "short-pass": 3,
  "med-run": 10,
  "med-pass": 7,
  "long-run": 50,
  "long-pass": 20,
};

const betValues = {
  "1": 10,
  "2": 25,
  "3": 50,
  "4": 100,
  "5": 250,
  "6": 500,
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    const rounded = num / 1000;
    return Number.isInteger(rounded) ? `${rounded}k` : `${rounded.toFixed(1)}k`;
  }
  return num.toString();
};

const Gameboard = () => {
  const { user } = useUser();
  const { isMatchActive, matchData, play_state, play_id } = useGame();
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [playSubmitSound] = useSound('/sfx/submit.wav');

  const calculatePayout = (playType: "run" | "pass", playLength: "short" | "med" | "long", playBet: number) => {
    const key = `${playLength}-${playType}` as keyof typeof odds;
    const multiplier = odds[key] || 0;
    return playBet * multiplier;
  };

  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      playType: "run",
      playLength: "short",
      playBet: "1",
    },
  });

  const playType = watch("playType");
  const playLength = watch("playLength");
  const playBetValue = betValues[watch("playBet")];
  const winAmount = calculatePayout(playType, playLength, playBetValue);



  const checkSubmissionState = async () => {
    if (matchData?.matchId && play_id) {
      const { data, error } = await supabaseClient
        .from("player_picks")
        .select("*")
        .eq("match_id", matchData.matchId)
        .eq("play_id", play_id)
        .eq("player_id", user.player_id)
        .maybeSingle();

      if (error) {
        console.error("Error checking submission:", error);
        return false;
      }

      return !!data;
    }
    return false;
  };

  const fetchSubmissionStatus = async () => {
    const submissionExists = await checkSubmissionState();
    setIsSubmitted(submissionExists);
  };

  const handleUndo = async () => {
    if (matchData?.matchId && play_id) {
      await undoPlay(matchData.matchId, user.player_id, play_id);
      await fetchSubmissionStatus();
    }
  };

  useEffect(() => {
    fetchSubmissionStatus();
  }, [matchData, play_id, user.player_id]);

  const onSubmit = async (data: FormData) => {
    const matchId = matchData?.matchId;
    if (matchId && play_id) {
      await playerSubmitPlay(
        matchId,
        user.player_id,
        play_id,
        data.playType,
        data.playLength,
        Number(data.playBet)
      );
      playSubmitSound()
      await fetchSubmissionStatus();
    }
  };

  useEffect(() => {
    const playerPicksSubscription = supabaseClient
      .channel("player_picks_state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_picks" },
        async (payload: any) => {
          if (payload.new.player_id === user.player_id) {
            await fetchSubmissionStatus();
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(playerPicksSubscription);
    };
  }, [user.player_id]);

  const isFormActive = isMatchActive && play_id != null;

  return (
    <div className="font-flick">
      <Balance />
      <GameDisplay />
      <form
        className="w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 min-h-[290px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div
          className={`flex flex-col gap-4 min-w-full ${
            !isFormActive || isSubmitted
              ? "opacity-50 cursor-default pointer-events-none"
              : ""
          }`}
        >
          <Controller
            name="playType"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                options={[
                  { value: "run", label: "Run" },
                  { value: "pass", label: "Pass" },
                ]}
                selectedOption={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="playLength"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                options={[
                  { value: "short", label: "Short", subtext: "< 5yds" },
                  { value: "med", label: "Medium", subtext: "5-20yds" },
                  { value: "long", label: "Long", subtext: "20< yds" },
                ]}
                selectedOption={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="playBet"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                options={[
                  { value: "1", label: "10" },
                  { value: "2", label: "25" },
                  { value: "3", label: "50" },
                  { value: "4", label: "100" },
                  { value: "5", label: "250" },
                  { value: "6", label: "500" },
                ]}
                selectedOption={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {isFormActive ? (
            isSubmitted ? (
              <button
                type="button"
                className="bg-cpb-darkgreen uppercase text-lg font-bold w-full border-cpb-darkgreen border-2 rounded-xl py-3 shadow-lg flex flex-row justify-center items-center gap-2"
              >
                PICK SUBMITTED
                <Image
                  width={20}
                  height={20}
                  src="/check-icon.svg"
                  alt="checkmark"
                  className="w-5 h-5"
                />
              </button>
            ) : (
              <button
                type="submit"
                className="bg-cpb-darkgreen uppercase text-lg font-bold w-full border-cpb-darkgreen border-2 rounded-xl py-4 px-2 shadow-lg flex flex-row justify-center gap-4 items-center"
              >
                <div className="flex flex-row items-top gap-2">
                  <div className="flex flex-col items-center mb-auto gap-1">
                    <p className="leading-none [text-shadow:0px_0px_15.65px_rgba(255,255,255,0.5)]">BET</p>
                    <div className="ml-auto w-4 h-4">
                      <SvgCoin />
                    </div>
                  </div>
                  <p className="text-cpb-basewhite text-[52px] leading-[80%] [text-shadow:0px_0px_15.65px_rgba(255,255,255,0.5)]">
                    {formatNumber(playBetValue)}
                  </p>
                </div>

                <div className="uppercase text-2xl font-normal py-1 border-[#EAE107] border-[.4px] rounded-xl px-4">
                  SUBMIT
                </div>

                <div className="flex flex-row items-top gap-2">
                  <div className="flex flex-col items-center mb-auto gap-1">
                    <p className="leading-none [text-shadow:0px_0px_15.65px_rgba(255,255,255,0.5)]">WIN</p>
                    <div className="ml-auto w-4 h-4">
                      <SvgCoin />
                    </div>
                  </div>
                  <p className="text-cpb-basewhite text-[52px] leading-[80%] [text-shadow:0px_0px_15.65px_rgba(255,255,255,0.5)]">
                    {formatNumber(winAmount)}
                  </p>
                </div>
              </button>
            )
          ) : (
            <div className="bg-cpb-baseblack uppercase text-lg font-bold w-full border-cpb-baseblack border-2 rounded-xl py-3 shadow-lg text-center justify-center items-center">
              PICKS CLOSED
            </div>
          )}
        </div>
      </form>
      <div className="w-full px-10 pb-5"></div>
    </div>
  );
};

export default Gameboard;
