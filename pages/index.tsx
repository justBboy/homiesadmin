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
import { useAppDispatch, useAppSelector } from "../features/hooks";
import Image from "next/image";
import DetailCard from "../components/DetailCard";
import { FaCoins, FaTruckPickup } from "react-icons/fa";
import IconLeftTextRight from "../components/IconLeftTextRight";
import { MdOutlinePayment } from "react-icons/md";
import { BiUserCircle } from "react-icons/bi";
import { IoBagCheckOutline, IoFastFoodSharp } from "react-icons/io5";
import { AiOutlineLoading } from "react-icons/ai";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../libs/Firebase";
import { BsTrophyFill } from "react-icons/bs";
import usePastOrderData from "../features/hooks/usePastMonthsOrdersChartData";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

const Home: NextPage = () => {
  const router = useRouter();
  const { data: pastOrderData, loading: pastOrderChartLoading } =
    usePastOrderData(5);
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [loading, setLoading] = useState(true);
  const [totalFoods, setTotalFoods] = useState(0);
  const [yearOrders, setYearOrders] = useState(0);
  const [yearSales, setYearSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [monthOrders, setMonthOrders] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [monthFailed, setMonthFailed] = useState(0);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login");
    }
  }, [user, completed, router]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const today = new Date();
      const globalsCollection = collection(db, "appGlobals");
      try {
        //
        const foodsRes = await getDoc(doc(globalsCollection, "foods"));
        const foods: any = foodsRes.data();
        setTotalFoods(foods?.foodsCount || 0);
        //
        const ordersRes = await getDoc(doc(globalsCollection, "orders"));
        const orders: any = ordersRes.data();
        setYearOrders(
          (orders && orders[`orders-${today.getFullYear()}Count`]) || 0
        );
        //
        const customersRes = await getDoc(doc(globalsCollection, "customers"));
        const customers: any = customersRes.data();
        setTotalCustomers(customers?.customersCount || 0);
        //
        setYearSales(
          (orders && orders[`sales${today.getFullYear()}Made`]) || 0
        );
        //
        setTodayOrders(
          (orders &&
            orders[
              `orders${today.getDate()}-${
                today.getMonth() + 1
              }-${today.getFullYear()}CompletedCount`
            ]) ||
            0
        );
        //
        setTodaySales(
          (orders &&
            orders[
              `sales${today.getDate()}-${
                today.getMonth() + 1
              }-${today.getFullYear()}Made`
            ]) ||
            0
        );
        //
        setMonthSales(
          (orders &&
            orders[
              `sales${today.getMonth() + 1}-${today.getFullYear()}Made`
            ]) ||
            0
        );
        //
        setMonthOrders(
          (orders &&
            orders[
              `orders${
                today.getMonth() + 1
              }-${today.getFullYear()}CompletedCount`
            ]) ||
            0
        );
        //
        setMonthFailed(
          (orders &&
            orders[
              `orders${today.getMonth() + 1}-${today.getFullYear()}FailedCount`
            ]) ||
            0
        );
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    })();
  }, []);

  if (
    completed &&
    user &&
    pastOrderData &&
    !loading &&
    !pastOrderChartLoading
  ) {
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
                  Yearly Sales
                </h3>
                <div className={`flex flex-row pl-5 mt-2`}>
                  <IconLeftTextRight
                    Icon={MdOutlinePayment}
                    title={`${yearSales}`}
                    subtitle="Sales"
                  />
                  <IconLeftTextRight
                    Icon={BiUserCircle}
                    title={`${totalCustomers}`}
                    subtitle="Customers"
                  />
                  <IconLeftTextRight
                    Icon={IoBagCheckOutline}
                    title={`${yearOrders}`}
                    subtitle="Orders"
                  />
                  <IconLeftTextRight
                    Icon={IoFastFoodSharp}
                    title={`${totalFoods}`}
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
                    data={pastOrderData}
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
                      detail={`GH₵ ${todaySales}`}
                    />
                    <DetailCard
                      title="Orders"
                      bg="#8de7ec88"
                      Icon={FaTruckPickup}
                      subtitle="Total Orders Today"
                      detail={`${todayOrders}`}
                    />
                    <div
                      className={`w-[280px] h-[150px] shadow rounded-xl flex p-5 m-2 bg-blue-200`}
                    >
                      <div
                        className={`w-1/3 flex items-center justify-center `}
                      >
                        <BsTrophyFill
                          className={`text-4xl animate-[c-dance_3s_infinite]`}
                          color="#ff9108"
                        />
                      </div>
                      <div className={`w-2/3 flex flex-col justify-center`}>
                        <h4 className={`font-xs text-xs text-center`}>
                          Monthly record
                        </h4>
                        <div className="flex justify-between p-1 items-center w-full">
                          <h3 className="font-bold text-xs">Orders: </h3>
                          <span className="text-xs font-gothamLight">
                            {monthOrders}
                          </span>
                        </div>
                        <div className="flex justify-between p-1 items-center w-full">
                          <h3 className="font-bold text-xs">Sales: </h3>
                          <span className="text-xs font-gothamLight">
                            ₵{monthSales}
                          </span>
                        </div>
                        <div className="flex justify-between p-1 items-center w-full">
                          <h3 className="font-bold text-xs">Failed: </h3>
                          <span className="text-xs font-gothamLight">
                            {monthFailed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-[24%] h-[530px] hidden lg:block overflow-hidden bg-black rounded-lg mt-6 relative`}
                >
                  <div className={`flex lg:flex-col flex-row pl-5 mt-2`}>
                    <h3 className={`font-bold text-white text-md`}>
                      Yearly Sales
                    </h3>
                    <IconLeftTextRight
                      Icon={MdOutlinePayment}
                      title={`₵${yearSales}`}
                      subtitle="Sales"
                    />
                    <IconLeftTextRight
                      Icon={BiUserCircle}
                      title={`${totalCustomers}`}
                      subtitle="Customers"
                    />
                    <IconLeftTextRight
                      Icon={IoBagCheckOutline}
                      title={`${yearOrders}`}
                      subtitle="Orders"
                    />
                    <IconLeftTextRight
                      Icon={IoFastFoodSharp}
                      title={`${totalFoods}`}
                      subtitle="Foods Sold"
                    />
                  </div>
                  <div className={`absolute w-full h-[30%] bottom-0`}>
                    {/* <a href='https://www.freepik.com/vectors/abstract-stripes'>Abstract stripes vector created by starline - www.freepik.com</a>*/}
                    <Image
                      src="/images/12310_1_150x300.jpg"
                      layout="fill"
                      alt="bottom stripes"
                    />
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
