"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useGame } from "../_context/gameContext";
import { useUser } from "../_context/usercontext";
import {
  getUserScore,
  playerSubmitPlay,
  undoPlay,
} from "../_lib/supabase/database";
import { createClient } from "@/app/_lib/supabase/client";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePastPicks } from "../_context/pastPicksContext";
import CountUp from "react-countup";

const FormSchema = z.object({
  playType: z.enum(["pass", "run"]),
  playLength: z.enum(["short", "med", "long"]),
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
    className={`rounded-full flex-1 py-2 text-2xl font-bold focus:outline-none transition-colors duration-200 ${
      isSelected ? "bg-cpb-darkgreen text-white" : ""
    }`}
  >
    <div className="flex flex-col items-center">
      <span>{option.label}</span>
      {option.subtext && (
        <span className="text-xs text-cpb-basewhite opacity-85 font-chakra">{option.subtext}</span>
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

const Gameboard = () => {
  const { refreshPastPicks } = usePastPicks();
  const { user } = useUser();
  const { isMatchActive, matchData, driveId, playId, driveTeam } = useGame();
  const [score, setScore] = useState<number>(0);
  const [prevScore, setPrevScore] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { control, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      playType: "run",
      playLength: "short",
    },
  });

  const checkSubmissionState = async () => {
    if (matchData?.matchId && driveId && playId) {
      const { data, error } = await supabaseClient
        .from("player_picks")
        .select("*")
        .eq("match_id", matchData.matchId)
        .eq("drive_id", driveId)
        .eq("play_id", playId)
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
    if (matchData?.matchId && driveId && playId) {
      await undoPlay(matchData.matchId, driveId, user.player_id, playId);
      await fetchSubmissionStatus();
      await refreshPastPicks(user.player_id, driveId);
    }
  };

  useEffect(() => {
    fetchSubmissionStatus();
    fetchUserScore();
  }, [matchData, driveId, playId, user.player_id]);

  const onSubmit = async (data: FormData) => {
    const matchId = matchData?.matchId;
    if (matchId && driveId && playId) {
      await playerSubmitPlay(
        matchId,
        driveId,
        user.player_id,
        playId,
        data.playType,
        data.playLength
      );
      await fetchSubmissionStatus();
    }
  };

  const fetchUserScore = async () => {
    try {
      if (!isMatchActive) {
        setScore(0);
      } else {
        if (driveId != null && user.player_id != null) {
          const userScore = await getUserScore(driveId, user.player_id);
          if (userScore != null) {
            setPrevScore(score);
            setScore(parseInt(userScore.points, 10)); 
          } else {
            setScore(0);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user score:", error);
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

    const playerScoreSubscription = supabaseClient
      .channel("player_score")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: `player_id=eq.${user.player_id}`,
        },
        async (payload: any) => {
          if (payload.new) {
            setPrevScore(score);
            setScore(parseInt(payload.new.points, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(playerPicksSubscription);
      supabaseClient.removeChannel(playerScoreSubscription);
    };
  }, [user.player_id]);

  useEffect(() => {
    if (driveId && driveId != null) {
      try {
        fetchUserScore();
      } catch (error) {
        console.error("Error fetching user score HERE HERE HERE:", error);
      }
    }
  }, []);

  useEffect(() => {
    setScore(0);
  }, [driveId]);

  const isFormActive = isMatchActive && driveId != null;

  return (
    <div className="font-flick">
      <form
        className="w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 min-h-[290px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-row w-full justify-between mb-8">
          <div className="w-16 h-16 relative mt-3">
            <Image
              width={64}
              height={64}
              src={
                isMatchActive
                  ? matchData?.awayTeamLogo || "/placeholder.png"
                  : "/placeholder.png"
              }
              alt={
                isMatchActive
                  ? matchData?.awayTeamName || "away-logo"
                  : "away-logo"
              }
              className="w-full h-full rounded-full object-contain border-2 border-white bg-cpb-basewhite"
            />
            {driveTeam === matchData?.awayTeamId && (
              <Image
                src="/possession_indicator.png"
                width={17}
                height={17}
                alt="possession-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-[-8px]"
              />
            )}
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="font-bold uppercase text-sm text-center">
              {isMatchActive
                ? driveId == null
                  ? "NO DRIVE" 
                  : driveTeam === matchData?.homeTeamId
                  ? `${matchData?.homeTeamName} drive`
                  : `${matchData?.awayTeamName} drive`
                : "Game Over"}
            </h1>
            {isMatchActive && driveId != null ? (
              <p className="text-[40px] font-bold">
                <CountUp start={prevScore} end={score} duration={1} />{" "}
                <span className="font-normal">pts</span>
              </p>
            ) : (
              <p className="text-[40px] font-bold">Ended</p>
            )}
          </div>
          <div className="w-16 h-16 relative mt-3">
            <Image
              src={
                isMatchActive
                  ? matchData?.homeTeamLogo || "/placeholder.png"
                  : "/placeholder.png"
              }
              width={64}
              height={64}
              alt={
                isMatchActive
                  ? matchData?.homeTeamName || "team-logo"
                  : "team-logo"
              }
              className="w-full h-full rounded-full object-contain border-2 border-white bg-cpb-basewhite"
            />
            {driveTeam === matchData?.homeTeamId && (
              <Image
                src="/possession_indicator.png"
                width={17}
                height={17}
                alt="possession-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-[-8px]"
              />
            )}
          </div>
        </div>

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
            name="playLength"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                options={[
                  { value: "short", label: "Short", subtext: "< 5yds" },
                  { value: "med", label: "Medium", subtext: "5-20yds" },
                  { value: "long", label: "Long", subtext: "20< yds" },
                  { value: "long", label: "Long", subtext: "20< yds" },
                  { value: "long", label: "Long", subtext: "20< yds" },
                  { value: "long", label: "Long", subtext: "20< yds" },
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
                className="bg-cpb-darkgreen uppercase text-lg font-bold w-full border-cpb-darkgreen border-2 rounded-xl py-3 shadow-lg"
              >
                SUBMIT PICK
              </button>
            )
          ) : (
            <div className="bg-cpb-baseblack uppercase text-lg font-bold w-full border-cpb-baseblack border-2 rounded-xl py-3 shadow-lg text-center justify-center items-center">
              PICKS CLOSED
            </div>
          )}
        </div>
      </form>
      <div className="w-full px-10 pb-5">
        {isSubmitted ? (
          <button
            className="uppercase text-base font-bold opacity-100 py-3 border-cpb-basewhite border-2 rounded-xl text-center w-full bg-cpb-basewhite text-cpb-baseblack flex flex-row justify-center items-center gap-2"
            onClick={handleUndo}
          >
            Undo
            <Image
              width={20}
              height={20}
              src="/undo-icon-dark.svg"
              alt="undo"
              className="w-5 h-5"
            />
          </button>
        ) : (
          <div className="uppercase text-base font-bold opacity-50 py-3 border-cpb-basewhite border-2 rounded-xl text-center w-full pointer-events-none flex flex-row justify-center items-center gap-2">
            Undo
            <Image
              width={20}
              height={20}
              src="/undo-icon.svg"
              alt="undo"
              className="w-5 h-5"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Gameboard;
