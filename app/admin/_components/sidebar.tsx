"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/app/_context/gameContext";
import { getTeams } from "@/app/_lib/supabase/database";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMatch } from "@/app/_lib/supabase/database";
import Image from "next/image";
import { Team } from "@/app/_types/types";

const FormSchema = z
  .object({
    team_home: z.string().nonempty("Home team is required"),
    team_away: z.string().nonempty("Away team is required"),
  })
  .refine((data) => data.team_home !== data.team_away, {
    message: "Home and away teams cannot be the same.",
    path: ["team_away"],
  });

const Sidebar = () => {
  const { isMatchActive } = useGame();
  const [teams, setTeams] = useState<Team[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams();
        const teams = data.map((team) => ({
          id: team.id.toString(),
          full_name: team.full_name,
          short_name: team.short_name,
          logo_url: team.logo_url,
        }));
        setTeams(teams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  const toggleDropdown = (fieldName: string) => {
    setDropdownOpen((prev) => (prev === fieldName ? null : fieldName));
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const homeTeam = teams.find((team) => team.id === data.team_home);
    const awayTeam = teams.find((team) => team.id === data.team_away);

    if (homeTeam && awayTeam) {
      createMatch(
        homeTeam.id,
        homeTeam.short_name,
        homeTeam.logo_url,
        awayTeam.id,
        awayTeam.short_name,
        awayTeam.logo_url
      );
    } else {
      console.error("Selected teams not found");
    }
  };

  return (
    <div className="h-screen bg-cpb-basegray px-6 pt-4 w-64">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`flex flex-col gap-4 ${
          isMatchActive ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {isMatchActive ? (
          <div className="p-4 rounded-xl font-bold uppercase text-xl shadow-md bg-black text-cpb-basewhite">
            Match Active
          </div>
        ) : (
          <button
            type="submit"
            className="p-4 rounded-xl font-bold uppercase text-xl shadow-md bg-cpb-lightgreen text-cpb-baseblack"
          >
            Create Game
          </button>
        )}
        <div className="flex flex-col gap-2">
          <div className="relative w-full flex flex-col gap-4">
            <Controller
              name="team_home"
              control={control}
              render={({ field }) => (
                <div className="relative inline-block w-full">
                  <div
                    className="font-medium w-full appearance-none border border-[#1F1F1F] rounded-lg bg-transparent px-4 py-2 cursor-pointer text-center"
                    onClick={() => toggleDropdown("team_home")}
                  >
                    {teams.find((team) => team.id === field.value)?.short_name ||
                      "Select Home Team"}
                  </div>
                  {dropdownOpen === "team_home" && teams.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-48 overflow-y-auto">
                      {teams.map((team) => (
                        <li
                          key={team.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            field.onChange(team.id);
                            setDropdownOpen(null);
                          }}
                        >
                          <Image
                            src={team.logo_url}
                            alt="team-logo"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                          {team.short_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />

            <Controller
              name="team_away"
              control={control}
              render={({ field }) => (
                <div className="relative inline-block w-full">
                  <div
                    className="font-medium w-full appearance-none border border-[#1F1F1F] rounded-lg bg-transparent px-4 py-2 cursor-pointer text-center"
                    onClick={() => toggleDropdown("team_away")}
                  >
                    {teams.find((team) => team.id === field.value)?.short_name ||
                      "Select Away Team"}
                  </div>
                  {dropdownOpen === "team_away" && teams.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-48 overflow-y-auto">
                      {teams.map((team) => (
                        <li
                          key={team.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            field.onChange(team.id);
                            setDropdownOpen(null);
                          }}
                        >
                          <Image
                            src={team.logo_url}
                            alt="team-logo"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                          {team.short_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
            {errors.team_home?.message && (
              <p className="text-cpb-lightred text-sm">
                {errors.team_home?.message}
              </p>
            )}
            {errors.team_away?.message && (
              <p className="text-cpb-lightred text-sm">
                {errors.team_away?.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Sidebar;