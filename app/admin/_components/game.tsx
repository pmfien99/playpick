"use client";

import {
  endAllMatches,
  createDrive,
  getMatchDrives,
  endAllDrives,
  createPlay,
} from "@/app/_lib/supabase/database";
import { useEffect, useState } from "react";
import { Drive, PlayState } from "@/app/_types/types";
import DriveBlock from "./driveblock";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { useGame } from "@/app/_context/gameContext";

const Game = () => {
  const [gameDrives, setGameDrives] = useState<Drive[]>([]);
  const { matchData, driveId, playId } = useGame();
  const [showPopup, setShowPopup] = useState(false);
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      selectedTeamId: matchData?.homeTeamId || "",
    },
  });

  useEffect(() => {
    const fetchDrives = async () => {
      if (matchData?.matchId === null) return;
      if (matchData?.matchId === undefined) return;
      const drives: Drive[] = await getMatchDrives(matchData?.matchId);
      setGameDrives(drives);
    };
    fetchDrives();
  }, [matchData, driveId]);

  const getTeamName = (drive: Drive) => {
    if (drive.team_id === matchData?.homeTeamId) {
      return matchData.homeTeamName;
    } else if (drive.team_id === matchData?.awayTeamId) {
      return matchData.awayTeamName;
    }
    return "Unknown Team";
  };

  const handleGameOverClick = () => {
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    await endAllMatches();
    await endAllDrives();
    setShowPopup(false);
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  const handleNewDriveClick = async (data: { selectedTeamId: string }) => {
    if (!matchData?.matchId) {
      console.error("Match ID is undefined");
      return;
    }
    try {
      const newDrive = await createDrive(
        matchData.matchId,
        data.selectedTeamId
      );
      if (newDrive) {
        await createPlay(newDrive[0].drive_id);
      } else {
        console.error("Failed to create a new drive");
      }
    } catch (error) {
      console.error("Error creating drive or play:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-row gap-6 items-center">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row gap-2 items-center">
            <Image
              className="w-12 h-12"
              src={matchData?.homeTeamLogo || ""}
              alt={matchData?.homeTeamName || ""}
              width={48}
              height={48}
            />
            <h1 className="text-4xl font-bold">{matchData?.homeTeamName}</h1>
          </div>
          <h1 className="text-2xl font-regular">VS</h1>
          <div className="flex flex-row gap-2 items-center">
            <Image
              className="w-12 h-12"
              src={matchData?.awayTeamLogo || ""}
              alt={matchData?.awayTeamName || ""}
              width={48}
              height={48}
            />
            <h1 className="text-4xl font-bold">{matchData?.awayTeamName}</h1>
          </div>
        </div>
        <button
          className="p-3 rounded-xl font-bold uppercase text-md shadow-md bg-cpb-lightred text-cpb-baseblack"
          onClick={handleGameOverClick}
        >
          Game Over
        </button>
      </div>
      {driveId === null ? (
        <div className="my-6">
          <h2 className="text-xl font-regular mb-2">Log a new drive</h2>
          <form
            onSubmit={handleSubmit(handleNewDriveClick)}
            className="flex flex-row gap-4 items-start"
          >
            <Controller
              name="selectedTeamId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select
                  {...field}
                  className="font-medium appearance-none border border-[#1F1F1F] rounded-lg bg-transparent px-4 py-2 cursor-pointer text-center"
                  onChange={(e) => {
                    setValue("selectedTeamId", e.target.value);
                    field.onChange(e);
                  }}
                >
                  <option value="" disabled>
                    Select a team
                  </option>
                  <option value={matchData?.homeTeamId}>
                    {matchData?.homeTeamName}
                  </option>
                  <option value={matchData?.awayTeamId}>
                    {matchData?.awayTeamName}
                  </option>
                </select>
              )}
            />
            <button
              type="submit"
              className="w-auto text-sm rounded-lg bg-cpb-baseblack text-cpb-basewhite uppercase py-3 px-2"
            >
              Start Drive
            </button>
          </form>
        </div>
      ) : (
        <div className="mb-20"></div>
      )}
      <div className="flex flex-col gap-16">
        {gameDrives.some((drive) => drive.is_active) && (
          <>
            <h2 className="text-2xl font-bold mb-4">Current Drive</h2>
            {gameDrives.map(
              (drive, index) =>
                drive.is_active && (
                  <div
                    key={drive.drive_id}
                    className="p-4 bg-white rounded-lg shadow-md border border-gray-300"
                  >
                    <DriveBlock
                      order={gameDrives.length - index}
                      teamName={getTeamName(drive)}
                      active={drive.is_active}
                      drive_id={drive.drive_id}
                    />
                  </div>
                )
            )}
          </>
        )}

        {gameDrives.some((drive) => !drive.is_active) && (
          <>
            <h2 className="text-2xl font-bold mt-8 mb-4">Past Drives</h2>
            {gameDrives
              .filter((drive) => !drive.is_active) 
              .reverse()
              .map((drive, index) => (
                <div
                  key={drive.drive_id}
                  className="p-4 bg-white rounded-lg shadow-md border border-gray-300"
                >
                  <DriveBlock
                    order={gameDrives.length - index}
                    teamName={getTeamName(drive)}
                    active={drive.is_active}
                    drive_id={drive.drive_id}
                  />
                </div>
              ))}
          </>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              Are you sure you want to end the game?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                className="p-2 rounded-md bg-cpb-lightred text-white"
                onClick={handleConfirm}
              >
                Yes
              </button>
              <button
                className="p-2 rounded-md bg-gray-300 text-black"
                onClick={handleCancel}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
