import { IconType } from "react-icons";
import { BiCategoryAlt, BiHome, BiUserCheck } from "react-icons/bi";
import { CgMenuRightAlt } from "react-icons/cg";
import { MdOutlineEmojiFoodBeverage } from "react-icons/md";
import { AiOutlinePullRequest, AiOutlineUser } from "react-icons/ai";
import { HiOutlineUsers } from "react-icons/hi";
import { SiBuymeacoffee } from "react-icons/si";

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
    name: "custom sales",
    route: "/cSales",
    icon: SiBuymeacoffee,
  },
  {
    name: "foods",
    route: "/foods",
    icon: MdOutlineEmojiFoodBeverage,
  },
  {
    name: "food Categories",
    route: "/categories",
    icon: BiCategoryAlt,
  },
  {
    name: "Agents",
    route: "/agents",
    icon: AiOutlineUser
  },
  {
    name: "admin members",
    route: "/members",
    icon: BiUserCheck,
  },
  {
    name: "customers",
    route: "/customers",
    icon: HiOutlineUsers,
  },
];

export default navigation;
