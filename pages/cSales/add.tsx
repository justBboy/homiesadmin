import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import Select, { Options } from "react-select";
import makeAnimated from "react-select/animated";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { AiOutlineLoading } from "react-icons/ai";
import { orderType } from "../../features/orders/ordersSlice";
import { addCustomSale } from "../../features/customSales/customSalesSlice";
import Head from "next/head";
import Sidebar from "../../components/Sidebar";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../libs/Firebase";
import {
  getFoods,
  selectFood,
  selectFoods,
} from "../../features/foods/foodsSlice";

const animatedComponents = makeAnimated();
const Add: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const [error, setError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [foodsLastUpdate, setFoodsLastUpdate] = useState(0);
  const foods = useAppSelector(selectFoods);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodOptions, setFoodOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/cSales/add");
    }
  }, [user, completed, router]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  useEffect(() => {
    (async () => {
      setFoodsLoading(true);
      if (lastUpdateComplete) {
        await dispatch(getFoods({ page: 1, lastUpdate: foodsLastUpdate }));
        setFoodsLoading(false);
      }
    })();
  }, [lastUpdateComplete, dispatch, foodsLastUpdate]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "foods"));
      const globals: any = res.data();
      setFoodsLastUpdate(globals?.foodsLastUpdate?.nanoseconds || 0);
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    setFoodOptions(
      foods.map((f) => ({
        label: f.name,
        value: f.id,
      }))
    );
  }, [foods]);

  if ((!completed && !user) || !lastUpdateComplete) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  const handleAddCustomSale = async () => {
    setError("");
    setAddLoading(true);
    const data: Partial<orderType> = {};
    const res = await dispatch(addCustomSale(data));
    if (res.meta.requestStatus === "rejected")
      setError((res as any).error.message);
    else {
      alert.success(`Added Successfuly`);
    }
    setAddLoading(false);
  };

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Add Custom Sale</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div className={`sm:p-5 md:p-10`}>
            <section
              className={`antialiased bg-gray-100 text-gray-600 h-screen p-1 sm:px-4`}
            >
              <div
                className={`m-auto justify-center mt-10 h-full flex flex-col items-center animate__animated animate__fadeIn`}
              >
                <h2 className={`font-bold text-2xl mb-5 capitalize`}>
                  Add new Sale
                </h2>
                <div className={`flex items-center w-full`}>
                  <div className="flex flex-col w-[70%] mx-auto items-center">
                    <Select
                      placeholder="Select Foods Bought"
                      className={`w-[80%]`}
                      value={selectedFoods}
                      onChange={(v: any) => {
                        setSelectedFoods(v);
                      }}
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={foodOptions}
                    />
                  </div>
                </div>
                <button
                  disabled={addLoading}
                  onClick={handleAddCustomSale}
                  className={`flex items-center ${
                    addLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "opacity-100 cursor-pointer"
                  } justify-center w-[80%] p-2 sm:p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md mt-3`}
                >
                  {addLoading ? (
                    <AiOutlineLoading
                      className={`text-2xl animate-spin`}
                      color="black"
                    />
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </section>
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

export default Add;
