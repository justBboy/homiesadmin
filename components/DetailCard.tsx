import React from "react";
import { IconType } from "react-icons";

interface props {
  bg: string;
  Icon: IconType;
  title: string;
  subtitle?: string;
  detail: string;
}
const DetailCard: React.FC<props> = ({ bg, Icon, title, subtitle, detail }) => {
  return (
    <div
      style={{ backgroundColor: bg }}
      className={`w-[280px] h-[150px] shadow rounded-xl flex p-5 m-2`}
    >
      <div className={`w-2/3 flex flex-col justify-center`}>
        <h2 className={`font-bold text-md`}>{title}</h2>
        <p className={`font-md text-sm text-slate-400`}>{subtitle}</p>
        <h1 className={`font-bold text-xl`}>{detail}</h1>
      </div>
      <div className={`w-1/3 flex items-center justify-center`}>
        <Icon className={`text-4xl`} />
      </div>
    </div>
  );
};

export default DetailCard;
