import type { NextPage } from "next";
import {
  Chart,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
} from "chart.js";
import Head from "next/head";
import { Line } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import { dummyOrders } from "../features/constants/dummy";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppSelector } from "../features/hooks";
import Image from "next/image";
import DetailCard from "../components/DetailCard";
import { FaCoins, FaTruckPickup } from "react-icons/fa";
import IconLeftTextRight from "../components/IconLeftTextRight";
import { MdOutlinePayment } from "react-icons/md";
import { BiUserCircle } from "react-icons/bi";
import { IoBagCheckOutline, IoFastFoodSharp } from "react-icons/io5";
import { AiOutlineLoading } from "react-icons/ai";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useEffect } from "react";
import { useRouter } from "next/router";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

const Home: NextPage = () => {
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login");
    }
  }, [user, completed]);

  if (completed && user) {
    return (
      <div className={`min-w-[100vw] min-h-[100vh]`}>
        <Head>
          <title>Home</title>
        </Head>
        <Sidebar />
        <main
          className={` ${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div
            className={`container max-w-[1334px] mx-auto flex flex-col lg:flex-row w-full h-full`}
          >
            <div
              className={`w-full h-[130px] block lg:hidden bg-black rounded-md m-1 sm:m-5 relative`}
            >
              <div className={`absolute w-[30%] h-full right-0 z-0`}>
                {/* <a href='https://www.freepik.com/vectors/abstract-stripes'>Abstract stripes vector created by starline - www.freepik.com</a>*/}
                <Image src="/images/12310_1_150x300.jpg" layout="fill" />
              </div>
              <div className={`w-full h-full`}>
                <h3 className={`font-bold text-white text-md ml-5`}>
                  Total Details
                </h3>
                <div className={`flex flex-row pl-5 mt-2`}>
                  <IconLeftTextRight
                    Icon={MdOutlinePayment}
                    title="28.42k"
                    subtitle="sales"
                  />
                  <IconLeftTextRight
                    Icon={BiUserCircle}
                    title="18k"
                    subtitle="Customers"
                  />
                  <IconLeftTextRight
                    Icon={IoBagCheckOutline}
                    title="18k"
                    subtitle="Orders"
                  />
                  <IconLeftTextRight
                    Icon={IoFastFoodSharp}
                    title="10"
                    subtitle="Foods Sold"
                  />
                </div>
              </div>
            </div>
            <div className={`w-full p-1 sm:p-10`}>
              <h2 className={`font-bold text-2xl`}>
                Hi {user?.username?.split(" ")[0]},
              </h2>
              <div className={`w-full flex`}>
                <div className={`w-full lg:w-[76%] mt-5`}>
                  <Line
                    data={dummyOrders}
                    className={`sm:w-initial sm:h-initial h-[340px]`}
                  />
                  <h5 className={`gothamThin font-sm text-md text-center`}>
                    Past Orders Chart
                  </h5>
                  <div
                    className={`mt-3 flex flex-col sm:flex-row items-center justify-between`}
                  >
                    <DetailCard
                      title="Sales"
                      bg="#bdf38360"
                      Icon={FaCoins}
                      subtitle="Total Sales Today"
                      detail="GH₵ 583"
                    />
                    <DetailCard
                      title="Orders"
                      bg="#8de7ec88"
                      Icon={FaTruckPickup}
                      subtitle="Total Orders Today"
                      detail="35"
                    />
                  </div>
                </div>
                <div
                  className={`w-[24%] h-[530px] hidden lg:block overflow-hidden bg-black rounded-lg mt-6 relative`}
                >
                  <div className={`flex lg:flex-col flex-row pl-5 mt-2`}>
                    <h3 className={`font-bold text-white text-md`}>
                      Total Details
                    </h3>
                    <IconLeftTextRight
                      Icon={MdOutlinePayment}
                      title="28.42k"
                      subtitle="sales"
                    />
                    <IconLeftTextRight
                      Icon={BiUserCircle}
                      title="18k"
                      subtitle="Customers"
                    />
                    <IconLeftTextRight
                      Icon={IoBagCheckOutline}
                      title="18k"
                      subtitle="Orders"
                    />
                    <IconLeftTextRight
                      Icon={IoFastFoodSharp}
                      title="10"
                      subtitle="Foods Sold"
                    />
                  </div>
                  <div className={`absolute w-full h-[30%] bottom-0`}>
                    {/* <a href='https://www.freepik.com/vectors/abstract-stripes'>Abstract stripes vector created by starline - www.freepik.com</a>*/}
                    <Image src="/images/12310_1_150x300.jpg" layout="fill" />
                  </div>
                </div>
              </div>
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

export default Home;
