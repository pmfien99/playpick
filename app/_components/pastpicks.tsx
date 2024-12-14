"use client";

type PastPick = {
  pick_type: string;
  pick_distance: string;
  points_allocated: number;
  play_type: string;
  play_distance: string | null; 
  is_ignored: boolean;
};


const PastPicks = () => {


  return (
    <>
        <div className="bg-cpb-darkgreen w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 pb-14 absolute bottom-[44px] ">
        </div>
    </>
  );
};

export default PastPicks;
