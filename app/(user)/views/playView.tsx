"use client";

import Gameboard from "@/app/_components/gameboard";
import PastBets from "@/app/_components/atoms/pastBets";

const PlayView = () => {
  return (
    <div>
      <Gameboard />
      <PastBets />    
    </div>
  );
};

export default PlayView;
