"use client";

import Play from "./play";
import PastPlay from "./pastplay";
import { useState, useEffect } from "react";
import { createClient } from "@/app/_lib/supabase/client";

//TODO: probably good to deprecate this component

interface DriveProps {
  active: boolean;
  drive_id: string;
  teamName: string;
  order: number;
}

interface PlayData {
  id: number;
  playNumber: number;
  play_state: string;
  created_at: string;
  play_type: string | null;
  play_distance: string | null;
  play_id: string;
}

const supabaseClient = createClient();

const DriveBlock: React.FC<DriveProps> = ({ active, drive_id, teamName, order }) => {
  const [drivePlays, setDrivePlays] = useState<PlayData[]>([]);

  useEffect(() => {
    const fetchPlays = async () => {
      console.log("getting plays")
    };
    fetchPlays();

    const subscription = supabaseClient
      .channel('plays_state')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'plays',
        filter: `drive_id=eq.${drive_id}`,
      }, (payload: any) => {
        const updatedPlay = payload.new;
        setDrivePlays(prevPlays => {
          return prevPlays.map(play =>
            play.play_id === updatedPlay.play_id ? { ...play, play_state: updatedPlay.play_state } : play
          );
        });
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, [drive_id]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mb-6">
          {active ? (
            <span className="font-normal"></span>
          ) : (
            <span className="font-normal">Drive #{order}, </span>
          )}
          {teamName}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-x-4 w-full">
        {drivePlays.map((play, index) => (
          <div
            key={play.play_id}
            className={`relative inline-block w-full py-3 px-4 ${
              index % 2 === 0 ? "bg-cpb-basegray" : "bg-transparent"
            }`}
          >
            {active ? (
              <Play
                play_id={play.play_id}
                play_state={play.play_state}
                play_number={drivePlays.length - index}
                created_at={play.created_at}
              />
            ) : (
              <PastPlay
                play_id={play.play_id}
                play_number={drivePlays.length - index}
                play_type={play.play_type || "Unknown"}
                play_distance={play.play_distance || "Unknown"}
                created_at={play.created_at}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriveBlock;