"use client";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { startPlay, logPlayStateUpdateScores, createPlay } from "@/app/_lib/supabase/database";
import { useGame } from "@/app/_context/gameContext";

interface PlayProps {
  play_id: string;
  play_number: number;
  color?: string;
  play_state: string;
  created_at: string;
}

const FormSchema = z.object({
  play_type: z.string(),
  play_distance: z.string(),
});

const Play = (props: PlayProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const { driveId } = useGame();

  const { color = "#FFFFFF" } = props;

  const typeOptions = [
    { label: "Pass", value: "pass" }, 
    { label: "Run", value: "run" }, 
    { label: "Punt", value: "punt" }, 
    { label: "Sack", value: "sack" }, 
    { label: "FG", value: "field goal" }, 
    { label: "Penalty", value: "penalty" },
    { label: "Knee", value: "knee" },
    { label: "Spike", value: "spike" }, 
    { label: "No Play", value: "no-play" },
    { label: "Timeout", value: "timeout" },
    { label: "Other", value: "other" }, 
  ];

  const distanceOptions = [
    { label: "Short", value: "short" },
    { label: "Medium", value: "med" },
    { label: "Long", value: "long" },
  ];

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (props.play_id && driveId) {
      logPlayStateUpdateScores(props.play_id, driveId, data.play_type, data.play_distance)
        .then(() => {
          return;
        })
        .catch((error) => {
          console.error("Error submitting play:", error);
        });
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const toggleDropdown = (dropdown: string) => {
    setDropdownOpen(dropdown);
  };

  const handleStartPlayClick = async () => {
    if (props.play_id) {
      try {
        await startPlay(props.play_id);
        if (driveId) {
          await createPlay(driveId);
        }
      } catch (error) {
        console.error("Error starting play:", error);
      }
    } 
  };

  const playType = watch("play_type");

  useEffect(() => {
    if (playType !== "pass" && playType !== "run") {
      setValue("play_distance", "");
      setFieldsDisabled(true);
    } else {
      setFieldsDisabled(false);
    }
  }, [playType, setValue]);

  let playStateButton;

  if (props.play_state === "play_closed") {
    playStateButton = (
      <div className="w-full text-sm text-center justify-center items-center text-cpb-baseblack uppercase py-3">
        <p>Play Closed</p>
      </div>
    );
  } else if (props.play_state === "play_open") {
    playStateButton = (
      <button onClick={handleStartPlayClick} className="w-full text-sm rounded-lg bg-cpb-lightgreen text-cpb-baseblack uppercase py-3">
        Start Play
      </button>
    );
  } else if (props.play_state === "play_started") {
    playStateButton = (
      <div className="w-full text-sm text-center justify-center items-center text-cpb-baseblack uppercase py-3">
        <p>Scoring</p>
      </div>
    );
  } else {
    playStateButton = (
      <div className="w-full text-sm rounded-lg bg-gray-500 text-cpb-basewhite uppercase py-3">
        Unkown Error
      </div>
    );
  }

  return (
    <div data-play-id={props.play_id} className="grid grid-cols-[1fr_2fr_10fr] gap-8 items-center">
      <p className="font-normal text-xl"># {props.play_number}</p>
      {playStateButton}
      <form onSubmit={handleSubmit(onSubmit)} className={`grid grid-cols-4 gap-x-4 gap-y-0 ${props.play_state === "play_open" ? "opacity-50 pointer-events-none" : ""}`}>
            <Controller
              name="play_type"
              control={control}
              render={({ field }) => (
                <div className="relative inline-block w-full">
                  <div
                    className={`font-medium w-full appearance-none border border-[#1F1F1F] rounded-lg bg-transparent px-4 py-2 cursor-pointer text-center ${props.play_state === "play_closed" ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => toggleDropdown("play_type")}
                  >
                    {field.value || "Select Play Type"}
                  </div>
                  {dropdownOpen === "play_type" && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1">
                      {typeOptions.map((option) => (
                        <li
                          key={option.value}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            field.onChange(option.value);
                            setDropdownOpen(null);
                          }}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />

            <Controller
              name="play_distance"
              control={control}
              render={({ field }) => (
                <div className="relative inline-block w-full">
                  <div
                    className={`font-medium w-full appearance-none border border-[#1F1F1F] rounded-lg bg-transparent px-4 py-2 cursor-pointer text-center ${props.play_state === "play_closed" || fieldsDisabled ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => toggleDropdown("play_distance")}
                  >
                    {field.value || "Select Distance"}
                  </div>
                  {dropdownOpen === "play_distance" && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1">
                      {distanceOptions.map((option) => (
                        <li
                          key={option.value}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            field.onChange(option.value);
                            setDropdownOpen(null);
                          }}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />

            { props.play_state === "play_started" && (
        <button
          type="submit"
          className="w-24 text-sm rounded-lg bg-cpb-baseblack text-cpb-basewhite uppercase py-3"
        >
            Submit
          </button>
        )}
      </form>
    </div>
  );
};

export default Play;