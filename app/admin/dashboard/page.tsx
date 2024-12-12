"use client";

import React from "react";
import Game from "../_components/game";
import { useGame } from "@/app/_context/gameContext";

export default function Page() {
  const { isMatchActive } = useGame();

  return (
      <div className="px-16 py-8 w-full overflow-y-scroll">
      {isMatchActive ? <Game /> : <div>Instructions can go here or something else</div>}
      </div>
  );
}
