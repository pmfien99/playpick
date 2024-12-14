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

  useEffect(() => {
    if (user?.player_id && matchData?.drive_id) {
      refreshPastPicks(user.player_id, matchData.drive_id);
    }

    const playerPicksSubscription = supabaseClient
      .channel("player_picks_state")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_picks",
        },
        async (payload: any) => {
          if (
            (payload.eventType === "DELETE" &&
              payload.old?.player_id === user.player_id) ||
            (payload.new && payload.new.player_id === user.player_id)
          ) {
            if (driveId) {
              await refreshPastPicks(user.player_id, driveId);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(playerPicksSubscription);
    };
  }, [user.player_id, driveId, playId, refreshPastPicks]);

  const renderPick = (pick: PastPick | null, index: number) => {
    let pickText = "No pick";
    let playText = "Unsubmitted";
    let pointsText = "TBD";
    let iconSrc = `/icon_index${index + 1}.svg`;
    let pointsColorClass = "";

    if (pick) {
      if (pick.pick_type && pick.pick_distance) {
        pickText = `${pick.pick_type} ${pick.pick_distance}`;
      }

      switch (index) {
        case 0:
          playText =
            pick.pick_type && pick.pick_distance ? "Submitted" : "Unsubmitted";
          pointsText = "TBD";
          iconSrc = "/icon_index1.svg";
          break;
        case 1:
        case 2:
          // Logic for the second and third rows
          if (pick.is_ignored) {
            pickText =
              pick.pick_type && pick.pick_distance
                ? `${pick.pick_type} ${pick.pick_distance}`
                : "N/A";
            playText = "N/A";
            pointsText = "N/A";
            iconSrc = "/icon_index2.svg";
          } else {
            pickText =
              pick.pick_type && pick.pick_distance
                ? `${pick.pick_type} ${pick.pick_distance}`
                : "N/A";
            playText = pick.play_type
              ? pick.play_distance
                ? `${pick.play_type} ${pick.play_distance}`
                : pick.play_type
              : "Scoring";
            pointsText =
              pick.pick_type === null || pick.pick_distance === null
                ? "N/A"
                : pick.points_allocated !== null
                ? `${pick.points_allocated > 0 ? "+" : ""}${
                    pick.points_allocated
                  }pts`
                : "TBD";
            iconSrc = pick.play_type ? "/icon_index3.svg" : "/icon_index2.svg";
          }
          break;
        default:
          break;
      }
    }

    if (pick?.points_allocated) {
      pointsColorClass =
        pointsText === "TBD"
        ? "text-white"
        : pointsText === "N/A"
        ? "text-[#DAB100]" // Gold
        : pick?.points_allocated === 0 || pick?.points_allocated < 0
        ? "text-cpb-lightred" // Red
        : pick?.points_allocated > 0
        ? "text-cpb-lightgreen" // Green
        : "text-white"; // Default to white if none of the above
    }

    return (
      <div
        key={index}
        className="grid w-full gap-x-2"
        style={{ gridTemplateColumns: "30px 1fr 1fr 60px" }}
      >
        <p className="text-xs sm:text-sm flex items-center">
          <img src={iconSrc} alt={`icon_index${index + 1}`} className="mr-2" />
          {index + 1}
        </p>
        <p className="text-xs sm:text-sm">{pickText}</p>
        <p className="text-xs sm:text-sm">{playText}</p>
        <p className={`text-xs sm:text-sm ${pointsColorClass}`}>{pointsText}</p>
      </div>
    );
  };

  return (
    <>
        <div className="bg-cpb-darkgreen w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 pb-14 absolute bottom-[44px] ">
          <h2 className="text-base font-bold">My Picks</h2>
          <div className="w-full text-sm mt-3">
            <div
              className="grid w-full font-bold gap-x-2"
              style={{ gridTemplateColumns: "30px 1fr 1fr 60px" }}
            >
              <p>#</p>
              <p className="uppercase">Pick</p>
              <p className="uppercase">Play</p>
              <p className="uppercase">Points</p>
            </div>
            {pastPicksData.length > 0 ? (
              [0, 1, 2].map((index) =>
                index < pastPicksData.length
                  ? renderPick(pastPicksData[index], index)
                  : null
              )
            ) : (
              <p className="text-center mt-3 text-xs sm:text-sm">
                Start guessing to see your past picks
              </p>
            )}
          </div>
        </div>
    </>
  );
};

export default PastPicks;
