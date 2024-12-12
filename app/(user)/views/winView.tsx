"use client";

import SvgIcon from "@/app/_components/icons/svgIcon";

const WinView = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center align-center">
      <SvgIcon className="w-[153px] h-[115px] text-[#8971D7]" name="win" />
      <p className="text-[20px] font-flick text-cpb-basewhite mix-blend-overlay drop-shadow-md">Coming Soon</p>
      <h1 className="text-[50px] font-flick leading-[50px] drop-shadow-md">Win Prizes</h1>
      </div>
    </div>
  );
};

export default WinView;
