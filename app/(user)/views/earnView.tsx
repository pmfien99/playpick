"use client";

import SvgIcon from "@/app/_components/icons/svgIcon";


const EarnView = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center align-center">
      <SvgIcon className="w-[95px] h-[115px] text-[#FFDB41]" name="profile" />
      <p className="text-[20px] font-flick text-cpb-basewhite mix-blend-overlay drop-shadow-md">Coming Soon</p>
      <h1 className="text-[50px] font-flick leading-[50px] drop-shadow-md">Earn more coins</h1>
      </div>
    </div>
  );
};

export default EarnView;
