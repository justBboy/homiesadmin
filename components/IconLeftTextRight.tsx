import React from "react";
import { IconType } from "react-icons";

interface props {
  title: string;
  subtitle?: string;
  Icon: IconType;
}

const IconLeftTextRight: React.FC<props> = ({ title, subtitle, Icon }) => {
  return (
    <div className={`flex w-full h-[80px] relative z-2`}>
      <div className={`w-[40%] h-full flex items-center  `}>
        <div
          className={`w-[25px] sm:w-[35px] h-[25px] sm:h-[35px] flex items-center justify-center rounded-[50%] bg-slate-200`}
        >
          <Icon className={`text-md sm:text-2xl`} color="#000" />
        </div>
      </div>
      <div className={`w-[60%] h-full flex flex-col justify-center`}>
        <h2 className={`font-bold text-[9px] sm:text-sm text-white leading-8`}>
          {title}
        </h2>
        <p
          className={`font-bold text-[8px] sm:text-sm text-slate-100 font-gothamThin`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default IconLeftTextRight;
