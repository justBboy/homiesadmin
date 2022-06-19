import { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { MdOutlinePendingActions, MdOutlineToday } from "react-icons/md";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import DetailCard from "../components/DetailCard";
import Sidebar from "../components/Sidebar";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppSelector } from "../features/hooks";
import OrderItem from "../components/OrderItem";
import { AiOutlineLoading } from "react-icons/ai";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useRouter } from "next/router";

const orders: NextPage = () => {
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [selectedOrder, setSelectedOrder] = useState("");
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/orders");
    }
  }, [user, completed]);

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  const handleSelectOrder = (id: string) => {
    if (selectedOrder === id) setSelectedOrder("");
    else setSelectedOrder(id);
  };

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Homiezfoods admin - Orders</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]}`}
        >
          <div className={`flex flex-col sm:flex-row justify-center pt-3`}>
            <DetailCard
              Icon={MdOutlinePendingActions}
              bg={"#dbbbb2ad"}
              detail={"5"}
              title={"Pending Today"}
              subtitle={"Orders in progress"}
            />
            <DetailCard
              Icon={MdOutlineToday}
              bg={"#90818161"}
              detail={"15"}
              title={"Orders Today"}
              subtitle={"Completed Today"}
            />
            <DetailCard
              Icon={MdOutlineToday}
              bg={"#69565657"}
              detail={"2"}
              title={"Failed"}
              subtitle={"All Orders Failed"}
            />
          </div>
          <div
            className={`flex flex-col sm:flex-row items-center mx-5 mt-5 mb-5`}
          >
            <div className="w-[100%] sm:w-[40%] mb-2 sm:mb-0 mr-2">
              <input
                type="date"
                className={`p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 outline-slate-200 rounded-lg border border-slate-300`}
                placeholder="Choose Date"
              />
            </div>
            <form className={`sm:w-[60%] w-[100%]`}>
              <label
                htmlFor="searchOrder"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
              >
                Search
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="search"
                  className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 outline-slate-200 rounded-lg border border-slate-300"
                  placeholder="Search Order..."
                  required
                />
                <button
                  type="button"
                  className="text-white absolute right-2.5 bottom-2.5 bg-slate-400 hover:bg-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 "
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          <div>
            <div
              className={`flex justify-evenly w-full items-center px-8 py-5`}
            >
              <div className={`w-1/3 `}>
                <h6 className="font-gotham text-[10px] text-[initial] font-bold text-left">
                  Order Id
                </h6>
              </div>
              <div className={`w-1/3`}>
                <h6 className="font-gotham text-[10px] text-[initial] font-bold text-left">
                  Items Count
                </h6>
              </div>
              <div className={`w-1/3`}>
                <h6 className="font-gotham text-[10px] text-[initial] font-bold text-left">
                  Price
                </h6>
              </div>
            </div>
            <div
              onClick={() => {
                handleSelectOrder("1");
              }}
              className={`relative transition-all duration-1000 bg-slate-200 mx-5 px-1 py-5 hover:bg-slate-300 cursor-pointer mb-5 overflow-hidden`}
            >
              <div
                className={`w-full flex justify-evenly items-center relative`}
              >
                <div className={`w-1/3`}>
                  <h6 className="font-sm text-[10px] sm:text-[initial] sm:font-md text-left">
                    #############Order Id
                  </h6>
                  {selectedOrder ? (
                    <BsFillCaretUpFill
                      className={`absolute right-5 top-[50%] translate-y-[-50%]`}
                    />
                  ) : (
                    <BsFillCaretDownFill className="absolute right-5 top-[50%] translate-y-[-50%]" />
                  )}
                </div>
                <div className={`w-1/3`}>
                  <h6 className="font-sm text-[10px] sm:text-[initial] font-md text-left">
                    Items Count
                  </h6>
                </div>
                <div className={`w-1/3`}>
                  <h6 className="font-sm text-[10px] sm:text-md font-md text-left ml-6">
                    Price
                  </h6>
                </div>
              </div>
              <OrderItem
                items={[{ foodName: "Fried Rice and Chicken", price: 24 }]}
                isOpened={selectedOrder === "1"}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className={`w-screen h-screen flex justify-center items-center`}>
      <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
    </div>
  );
};

export default orders;
