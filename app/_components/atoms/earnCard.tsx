import React from 'react';

interface EarnCardProps {
  image: string; // URL to the image source
  heading: string;
  subheading: string;
  progress: number;
  goal: number;
  reward: number;
}

const EarnCard: React.FC<EarnCardProps> = ({
  image,
  heading,
  subheading,
  progress,
  goal,
  reward,
}) => {
  return (
    <div className="w-full h-auto bg-cpb-baseblack rounded-xl top-0 z-50 p-4 shadow-lg">
      <div className="container mx-auto px-1 h-full flex flex-col gap-2 items-center leading-none">
        <img src={image} alt="Earn Card Image" className="w-full h-auto max-w-11" />
        <h1 className="text-xl lg:text-[16px] font-bold text-white text-center leading-none">{heading}</h1>
        <h2 className="text-[3vw] sm:text-[2vw] lg:text-[11px] text-gray-300 text-center leading-none">{subheading}</h2>
        <div className="w-full flex items-center">
        <span className="text-white mr-2 text-[10px]">{progress}</span>
        <div className="w-full bg-[#8C8C8D] rounded-full h-2.5">
            <div
              className="bg-[#FE3018] h-2.5 rounded-full"
              style={{ width: `${(progress / goal) * 100}%` }}
            ></div>
          </div>
          <span className="text-white ml-2 text-[10px]">{goal}</span>
        </div>
        <p className="text-white text-[16px]">Reward: {reward}</p>
      </div>
    </div>
  );
};

export default EarnCard;