"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useGame } from "../_context/gameContext";
import { useUser } from "../_context/usercontext";
import {
  checkSubmissionExists,
  getCoinBalance,
  playerSubmitPlay,
  undoPlay,
} from "../_lib/supabase/database";
import { createClient } from "@/app/_lib/supabase/client";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Balance from "./atoms/balance";
import GameDisplay from "./atoms/gameDisplay";
import SvgCoin from "./icons/svgCoin";
import useSound from "use-sound";

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
      isSelected ? "bg-cpb-basewhite text-cpb-basewhite" : ""
    }`}
    style={
      isSelected
        ? {
            background: "linear-gradient(180deg, #142F25 0.67%, #0C1D17 100%)",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
          }
        : {}
    }
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
  "short-run": 3,
  "short-pass": 10,
  "med-run": 5,
  "med-pass": 3,
  "long-run": 90,
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
  const [playSubmitSound] = useSound("/sfx/submit.wav");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 2000); // 2 seconds

      // Cleanup the timer on component unmount or when errorMessage changes
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const calculatePayout = (
    playType: "run" | "pass",
    playLength: "short" | "med" | "long",
    playBet: number
  ) => {
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

  const checkSubmissionState = async (): Promise<boolean> => {
    if (matchData?.matchId && play_id) {
      const submissionExists: boolean = await checkSubmissionExists(
        play_id,
        user.player_id
      );
      console.log(play_id, user.player_id);

      console.log("submission data", submissionExists);

      return submissionExists;
    }
    return false;
  };

  const fetchSubmissionStatus = async () => {
    console.log("fetching submission status");
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
    const playBetValue = betValues[data.playBet];
    const userBalance = await getCoinBalance(user.player_id);

    if (playBetValue > userBalance) {
      setErrorMessage("Insufficient balance.");
      return;
    }

    if (matchId && play_id) {
      await playerSubmitPlay(
        matchId,
        user.player_id,
        play_id,
        data.playType,
        data.playLength,
        Number(data.playBet)
      );
      playSubmitSound();
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

  const isFormActive = isMatchActive && play_id != null && play_state === "play_open";

  return (
    <div className="font-flick">
      <Balance />
      <GameDisplay />
      <form
        className="w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 min-h-[290px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div
          className={`flex flex-col gap-[10px] min-w-full ${
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
                  { value: "short", label: "Short" },
                  { value: "med", label: "Medium" },
                  { value: "long", label: "Long" },
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
              <></>
            ) : (
              <button
                type="submit"
                className="h-[65px] bg-cpb-darkgreen uppercase text-lg font-bold w-full border-none rounded-full shadow-lg flex flex-row justify-center gap-4 items-center"
                style={{
                  background:
                    "linear-gradient(180deg, #142F25 0.67%, #0C1D17 100%)",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
                  borderRadius: "50px",
                  textShadow: "0px 0px 5.85859px rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="flex flex-row justify-around items-center w-full">
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-1 justify-normal">
                      <p
                        className="leading-[80%]"
                        style={{
                          background:
                            "linear-gradient(180deg, #EAE205 0%, #FED45F 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          textShadow:
                            "0px 0px 3.42059px rgba(216, 210, 0, 0.5)",
                        }}
                      >
                        BET
                      </p>
                      <div className="ml-auto w-4 h-4">
                        <SvgCoin />
                      </div>
                    </div>
                    <p className="text-cpb-basewhite text-[35px] leading-[80%]">
                      {formatNumber(playBetValue)}
                    </p>
                  </div>

                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-1 justify-normal">
                      <p
                        className="leading-[80%]"
                        style={{
                          background:
                            "linear-gradient(180deg, #EAE205 0%, #FED45F 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          textShadow:
                            "0px 0px 3.42059px rgba(216, 210, 0, 0.5)",
                        }}
                      >
                        WIN
                      </p>
                      <div className="ml-auto w-4 h-4">
                        <SvgCoin />
                      </div>
                    </div>
                    <p className="text-cpb-basewhite text-[35px] leading-[80%]">
                      {formatNumber(winAmount)}
                    </p>
                  </div>
                </div>

                <div
                  className="ml-auto uppercase rounded-full border-[#EEDF18] border-[.5px] py-0 px-0 h-full min-w-[65px] flex items-center justify-center"
                  style={{
                    textShadow: "0px 0px 5.85859px rgba(255, 255, 255, 0.5)",
                    border: "0.585859px solid #EEDF18",
                    boxShadow:
                      "0px 0px 1.17172px #FED45F, -5.85859px 0px 5.85859px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  SUBMIT
                </div>
              </button>
            )
          ) : (
            <div className="bg-cpb-baseblack uppercase text-lg font-bold w-full border-cpb-baseblack border-2 rounded-xl py-3 shadow-lg text-center justify-center items-center">
              PICKS CLOSED
            </div>
          )}

{errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
        </div>
        {isSubmitted && play_state === "play_open" && (
          <div
  className="h-[65px] uppercase text-lg font-bold w-full border-none rounded-full shadow-lg flex flex-row justify-center gap-4 items-center mt-[10px]"
  style={{
    background: "rgba(20, 47, 37, 0.5)", // Use rgba for semi-transparent background
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
    borderRadius: "50px",
    textShadow: "0px 0px 5.85859px rgba(255, 255, 255, 0.5)",
  }}
>
  <div className="flex flex-row justify-around items-center w-full">
    <div className="flex flex-row gap-2 opacity-50">
      <div className="flex flex-row items-center gap-1 justify-normal">
        <p
          className="leading-[80%]"
          style={{
            background: "linear-gradient(180deg, #EAE205 0%, #FED45F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0px 0px 3.42059px rgba(216, 210, 0, 0.5)",
          }}
        >
          BET
        </p>
        <div className="ml-auto w-4 h-4">
          <SvgCoin />
        </div>
      </div>
      <p className="text-cpb-basewhite text-[35px] leading-[80%]">
        {formatNumber(playBetValue)}
      </p>
    </div>

    <div className="flex flex-row gap-2 opacity-50">
      <div className="flex flex-row items-center gap-1 justify-normal">
        <p
          className="leading-[80%]"
          style={{
            background: "linear-gradient(180deg, #EAE205 0%, #FED45F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0px 0px 3.42059px rgba(216, 210, 0, 0.5)",
          }}
        >
          WIN
        </p>
        <div className="ml-auto w-4 h-4">
          <SvgCoin />
        </div>
      </div>
      <p className="text-cpb-basewhite text-[35px] leading-[80%]">
        {formatNumber(winAmount)}
      </p>
    </div>
  </div>

  <div
    className="ml-auto uppercase rounded-full border-cpb-basewhite bg-cpb-basewhite text-cpb-baseblack border-[0px] py-0 px-0 h-full min-w-[65px] flex items-center justify-center cursor-pointer"
    onClick={handleUndo}
    style={{
      textShadow: "0px 0px 5.85859px rgba(255, 255, 255, 0.5)",
      boxShadow: "-5.85859px 0px 5.85859px rgba(0, 0, 0, 0.5)",
    }}
  >
    UNDO
  </div>
</div>
        )}
      </form>
      <div className="w-full px-10 pb-5"></div>
    </div>
  );
};

export default Gameboard;
