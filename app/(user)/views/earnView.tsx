"use client";

import SvgIcon from "@/app/_components/icons/svgIcon";
import { useState } from "react";
import EarnCard from "@/app/_components/atoms/earnCard";

const EarnView = () => {
  const [activeTab, setActiveTab] = useState<string>("achievements");

  const achievementsData = [
    {
      image: "/downmarker-4.svg",
      heading: "RISKY BUSINESS",
      subheading: "Predict (10) 4th Down Conv.",
      progress: 4,
      goal: 10,
      reward: 1000,
    },
    {
      image: "/downmarker-4.svg",
      heading: "TOUCHDOWN MASTER",
      subheading: "Predict (5) Touchdowns",
      progress: 3,
      goal: 5,
      reward: 1500,
    },
    {
      image: "/downmarker-4.svg",
      heading: "FIELD GOAL PRO",
      subheading: "Predict (10) Field Goals",
      progress: 7,
      goal: 10,
      reward: 1200,
    },
    {
      image: "/downmarker-4.svg",
      heading: "INTERCEPTION KING",
      subheading: "Predict (3) Interceptions",
      progress: 1,
      goal: 3,
      reward: 1800,
    },
    {
      image: "/downmarker-4.svg",
      heading: "SACK ATTACK",
      subheading: "Predict (8) Sacks",
      progress: 5,
      goal: 8,
      reward: 1600,
    }
  ];

  const missionsData = [
    {
      image: "/downmarker-4.svg",
      heading: "Achievement 1",
      subheading: "Subheading 1",
      progress: 10,
      goal: 100,
      reward: 1000,
    },
    {
      image: "/downmarker-4.svg",
      heading: "Achievement 2",
      subheading: "Subheading 2",
      progress: 20,
      goal: 200,
      reward: 2000,
    },
  ];


  const renderTabContent = () => {
    switch (activeTab) {
      case "achievements":
        return (
          <div className="grid grid-cols-2 gap-4">
            {achievementsData.map((achievement) => (
              <EarnCard {...achievement} />
            ))}
          </div>
        )
      case "missions":
        return (
          <div className="grid grid-cols-2 gap-4">
            {missionsData.map((mission) => (
              <EarnCard {...mission} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center align-center">
        <SvgIcon className="w-[95px] h-[115px] text-[#FFDB41]" name="profile" />
        <p className="text-[20px] font-flick text-cpb-basewhite drop-shadow-md">
          Coming Soon
        </p>
        <h1 className="text-[50px] font-flick leading-[50px] drop-shadow-md">
          Earn more coins
        </h1>
        <div className="mx-10 flex flex-col items-center justify-center align-center bg-[#EAE20540] text-color-cpb-basewhite font-bold text-[16px] p-4 rounded-lg mt-6 relative">
          <button className="h-6 w-6 absolute top-4 right-2 aspect-square flex justify-center items-center m-auto">
            <svg
              width="24"
              height="24"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.6971 10.5877C5.76312 10.6469 5.85104 10.6666 5.93904 10.6666C6.02704 10.6666 6.11504 10.6469 6.18098 10.5877L8.60058 8.41887L11.0202 10.5877C11.0862 10.6469 11.1741 10.6666 11.2621 10.6666C11.3501 10.6666 11.4381 10.6469 11.5041 10.5877C11.636 10.4694 11.636 10.292 11.5041 10.1737L9.08446 8.00484L11.5041 5.836C11.636 5.71771 11.636 5.54025 11.5041 5.42197C11.3721 5.30368 11.1741 5.30368 11.0422 5.42197L8.62255 7.5908L6.20296 5.42197C6.071 5.30368 5.87302 5.30368 5.74106 5.42197C5.6091 5.54025 5.60909 5.71772 5.74106 5.836L8.16065 8.00484L5.74106 10.1737C5.56513 10.2723 5.56513 10.4694 5.6971 10.5877Z"
                fill="white"
              />
            </svg>
          </button>
          <p className="max-w-[80%] mr-auto">
            Complete daily missions & tasks to bank more coins!
          </p>
        </div>
      </div>
      {/* tabs */}
      <div className="w-full text-cpb-basewhite flex flex-col justify-center items-center px-10 py-5 mt-3 text-lg">
        <div className="flex flex-row justify-start items-center overflow-x-scroll w-[100vw] max-w-[430px] pl-3">
          <button
            className={`mx-4 px-4 py-1 rounded-full font-flick flex flex-row justify-center items-center gap-1 ${
              activeTab === "achievements"
                ? "bg-[#EAE205] text-cpb-baseblack"
                : "bg-cpb-baseblack text-cpb-basewhite bg-opacity-20"
            }`}
            onClick={() => setActiveTab("achievements")}
          >
            <svg
              width="12"
              height="18"
              viewBox="0 0 12 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.1739 1.74974C6.42837 -1.99508 0.00012207 0.670883 0.00012207 5.96411C0.00012207 10.7909 5.39678 13.5144 9.23219 10.9457C12.4215 8.80818 12.8212 4.39789 10.1738 1.74974H10.1739ZM8.95856 12.503V18L6.28626 16.3143C6.07514 16.181 5.81427 16.1923 5.6192 16.3223L2.95991 18V12.503C4.85749 13.3739 7.06178 13.3739 8.95851 12.503L8.95856 12.503Z"
                fill="currentColor"
              />
            </svg>
            Achievements
          </button>
          <button
            className={`px-4 py-1 rounded-full font-flick flex flex-row justify-center items-center gap-2 ${
              activeTab === "missions"
                ? "bg-[#EAE205] text-cpb-baseblack"
                : "bg-cpb-baseblack text-cpb-basewhite bg-opacity-20"
            }`}
            onClick={() => setActiveTab("missions")}
          >
            <svg
              width="18"
              height="17"
              viewBox="0 0 18 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.444446 16.9998H7.39798C7.25661 16.6811 7.27823 16.3157 7.45619 16.015L9.97916 11.7652C10.2561 11.2985 10.8398 11.1015 11.3496 11.3034L12.6975 11.8355L15 8.27369L11.1898 5.54953V3.75713L14.0497 2.35219V2.35137C14.2002 2.27781 14.295 2.12661 14.295 1.96153C14.295 1.79644 14.2002 1.64604 14.0497 1.57168L10.9455 0.0457694C10.9405 0.0433175 10.9347 0.0425002 10.9289 0.0400482C10.9198 0.0359618 10.9089 0.0335098 10.8998 0.0302406H10.899C10.8557 0.0147119 10.81 0.00572242 10.7634 0.00326921C10.7576 0.00326921 10.7526 0 10.7468 0L10.7401 0.0016346C10.6886 0.00245189 10.6379 0.0130768 10.5896 0.0310575C10.578 0.0351439 10.5672 0.0408651 10.5564 0.0457689V0.0465861C10.5414 0.0514899 10.5273 0.0580283 10.514 0.0653836C10.489 0.0809123 10.4666 0.0988935 10.4458 0.119326C10.4408 0.123413 10.435 0.126682 10.43 0.131586H10.4308C10.3959 0.166729 10.3684 0.207595 10.3476 0.252547C10.3426 0.263172 10.3385 0.274613 10.3343 0.286056V0.285239C10.3152 0.333459 10.3044 0.384133 10.3036 0.43644V5.78417L6.07259 11.0763C5.95118 11.2307 5.74079 11.2855 5.55784 11.2119L4.00116 10.6014C3.79909 10.5197 3.56708 10.5957 3.45566 10.7804L0.0627121 16.3421C-0.0187817 16.4769 -0.021276 16.6445 0.0577227 16.7801C0.136721 16.9166 0.284741 17.0008 0.444401 17L0.444446 16.9998Z"
                fill="currentColor"
              />
              <path
                d="M15.8871 8.10136C15.7959 8.0207 15.6769 7.98614 15.5594 8.00507C15.4427 8.02482 15.3391 8.09725 15.2749 8.20342L12.8247 12.3038C12.718 12.4816 12.5078 12.554 12.3238 12.4759L10.9102 11.8734C10.7208 11.7927 10.5036 11.8717 10.4008 12.0602L8.05642 16.3399C7.98145 16.4757 7.98145 16.6436 8.05488 16.7802C8.12831 16.916 8.26434 17 8.41196 17H17.588C17.697 17 17.8021 16.9539 17.8794 16.8716C17.9567 16.7893 18 16.6774 18 16.5613V10.1827C18 10.0527 17.9459 9.92838 17.8516 9.84524L15.8871 8.10136Z"
                fill="currentColor"
              />
            </svg>
            Missions
          </button>
        </div>
        {/* tab content */}
        <div className="w-full mt-8 pb-20">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default EarnView;
