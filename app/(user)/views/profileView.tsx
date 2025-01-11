"use client";

import SvgIcon from "@/app/_components/icons/svgIcon";
import Image from "next/image";

const ProfileView = () => {
  return (
    <div className="pb-20">
      <div className="flex flex-col items-center justify-center align-center text-center">
      <SvgIcon className="w-[153px] h-[115px] text-[#90CAC2]" name="profile" />
      <p className="text-[20px] font-flick text-cpb-basewhite drop-shadow-md">Coming Soon</p>
      <h1 className="text-[50px] font-flick leading-[50px] drop-shadow-md">Level up your look!</h1>
      </div>
      <div className="mx-10 flex flex-col items-center justify-center align-center bg-[#F9F9FB1A] text-color-cpb-basewhite font-bold text-[16px] p-4 rounded-lg mt-6 relative">
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
          <p className="max-w-[90%] mr-auto">
          Fill your bag now, unlock gear later.
          </p>
        </div>
        <div className="flex justify-center items-center max-w-full mx-10 mt-6">
        <Image
        width={359}
        height={329}
        src={"/locker-placeholder.svg"}
        alt="locker-placeholder"
        className="h-auto shadow-xl"
      />
      </div>
    </div>
  );
};

export default ProfileView;
