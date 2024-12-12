"use client";

import Gameboard from "@/app/_components/gameboard";
import PastPicks from "@/app/_components/pastpicks";

const PlayView = () => {
  return (
    <div>
      <Gameboard />
      <PastPicks />
    </div>
  );
};

export default PlayView;
