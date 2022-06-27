import React, { useCallback, useEffect, useMemo, useState } from "react";
import navigation from "../features/constants/navigation";
import Image from "next/image";
import {
  selectSidebarStreched,
  setSidebarStreched,
} from "../features/designManagement/designManagementSlice";
import { useAppSelector } from "../features/hooks";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { VscAccount } from "react-icons/vsc";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useOnAgentRequestUpdated } from "../features/hooks/useOnAgentRequestsUpdated";

interface props {}

const Sidebar: React.FC<props> = ({}) => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const { newRequestsCount } = useOnAgentRequestUpdated();
  const dispatch = useDispatch();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    const wrapper = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", wrapper);
    return () => {
      window.removeEventListener("resize", wrapper);
    };
  }, []);

  useEffect(() => {
    if (sidebarStreched) {
      if (window.innerWidth < 1200) dispatch(setSidebarStreched(false));
    } else if (window.innerWidth > 1200) dispatch(setSidebarStreched(true));
  }, [dimensions.width]);

  console.log("============+> ", newRequestsCount);

  return (
    <>
      <div
        style={{
          width: sidebarStreched ? 270 : 60,
        }}
        className={`border-r h-[100vh] fixed left-0 transition-width duration-300 overflow-y-auto`}
      >
        <div className={`py-5 ${sidebarStreched ? "pl-10" : "pl-5"}`}>
          <Image
            width={128}
            height={37.88}
            className={`w-32 transition-opacity duration-200 ${
              sidebarStreched ? "opacity-100" : "opacity-0"
            }`}
            src="/images/logo-no-bg.png"
            alt="Homies logo"
          />

          <div className={`mt-5`}>
            {navigation.map((nav) => (
              <Link href={nav.route} key={nav.name}>
                <a className={`relative`}>
                  {!sidebarStreched &&
                    nav.name.toLowerCase() === "agents" &&
                    newRequestsCount > 0 && (
                      <span
                        className={`absolute top-[-12px] right-[3px] w-[20px] h-[20px] rounded-[50%] flex justify-center items-center bg-red-500 text-white`}
                      >
                        {newRequestsCount}
                      </span>
                    )}
                  <nav.icon
                    className={`cursor-pointer transition-all hover:text-primary ${
                      router.asPath === nav.route && "text-primary"
                    } duration-500${
                      sidebarStreched
                        ? "opacity-0 invisible text-[0px]"
                        : "opacity-1 visible text-2xl"
                    }`}
                  />
                  <div
                    className={`flex items-center my-4 cursor-pointer relative before:absolute before:w-[2px] before:bg-primary before:left-[-2.489rem] before:content-[''] hover:before:h-full before:transition-all before:duration-[200] ${
                      router.asPath === nav.route
                        ? "before:h-full"
                        : "before:h-0"
                    } ${sidebarStreched ? "opacity-100" : "opacity-0"}`}
                  >
                    <nav.icon
                      className={`${
                        sidebarStreched
                          ? "translate-x-0"
                          : "translate-x-[-30px]"
                      }`}
                    />
                    <div className={`w-auto relative`}>
                      <span
                        className={`font-gotham capitalize text-md text-slate-800 ${
                          sidebarStreched ? "opacity-100" : "opacity-0"
                        } ml-8 hover:text-black`}
                      >
                        {nav.name}
                      </span>
                      {nav.name.toLowerCase() === "agents" &&
                        newRequestsCount > 0 && (
                          <span
                            className={`ml-3 min-w-[35px] rounded-md py-1 px-2 bg-red-500 text-white`}
                          >
                            {newRequestsCount}
                          </span>
                        )}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
            <Link href="/account">
              <button
                title={`${user?.username}`}
                className={`rounded-[50%] flex flex-col justify-center items-center mx-auto  ${
                  sidebarStreched
                    ? "translate-x-[-40px] mt-20 border hover:shadow-md border-slate-200 w-[60px] h-[60px]"
                    : "translate-x-[-5px] items-center"
                }`}
              >
                <VscAccount color="rgba(24, 35, 82)" className={`text-2xl`} />
                <span className={`text-[8px] text-center`}>
                  {user &&
                    user.username &&
                    (user.username.split(" ").length > 1
                      ? user.username.split(" ")[0][0] +
                        user.username.split(" ")[
                          user.username.split(" ").length - 1
                        ][0]
                      : user.username.split(" ")[0][1])}
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
