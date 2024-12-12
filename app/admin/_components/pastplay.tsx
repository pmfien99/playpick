"use client";

interface PastPlayProps {
  play_number: number;
  play_type: string;
  play_distance: string;
  created_at: string;
  play_id: string;
}

const Play = (props: PastPlayProps) => {

  return (
    <div data-play-id={props.play_id} className="grid grid-cols-[1fr_2fr_10fr] gap-8 items-center">
      <p className="font-normal text-xl"># {props.play_number}</p>
      <div className="opacity-0 w-full text-sm rounded-lg bg-gray-500 text-cpb-basewhite uppercase py-3">
        Drive Closed
      </div>
      <div className="grid grid-cols-4 gap-4 items-center">
        <p className="text-sm">{props.play_type}</p>
        <p className="text-sm">{props.play_distance}</p>
      </div>
    </div>
  );
};

export default Play;
