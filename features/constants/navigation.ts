import { IconType } from "react-icons";
import { BiHome } from "react-icons/bi";
import { CgMenuRightAlt } from "react-icons/cg";
import { MdOutlineEmojiFoodBeverage } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import { HiOutlineUsers } from "react-icons/hi";

export type navigationType = {
  name: string;
  icon: IconType;
  route: string;
};

const navigation: navigationType[] = [
  {
    name: "home",
    route: "/",
    icon: BiHome,
  },
  {
    name: "orders",
    route: "/orders",
    icon: CgMenuRightAlt,
  },
  {
    name: "foods",
    route: "/foods",
    icon: MdOutlineEmojiFoodBeverage,
  },
  {
    name: "admin members",
    route: "/members",
    icon: AiOutlineUser,
  },
  {
    name: "customers",
    route: "/customers",
    icon: HiOutlineUsers,
  },
];

export default navigation;
