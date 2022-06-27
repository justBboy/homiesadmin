import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import Sidebar from "../../../components/Sidebar";
import {
  editCustomSale,
  selectCustomSaleWithId,
} from "../../../features/customSales/customSalesSlice";
import { selectSidebarStreched } from "../../../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../../../features/hooks";
import useFirebaseAuth from "../../../features/hooks/useFirebaseAuth";
import { getFoods, selectFoods } from "../../../features/foods/foodsSlice";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../libs/Firebase";
import { validatePhone } from "../../../features/validators";

export type customSaleFormError = {
  totalPrice: string | undefined;
  customerName: string | undefined;
  customerPhone: string | undefined;
};

export type customSaleForm = {
  totalPrice: string;
  customerName: string;
  customerPhone: string;
  errors: customSaleFormError | null;
};

const animatedComponents = makeAnimated();
const EditSale: NextPage = () => {
  const router = useRouter();
  const alert = useAlert();
  const { id } = router.query;
  const customSale = useAppSelector(selectCustomSaleWithId(id as string));
  const dispatch = useAppDispatch();
  const [editLoading, setEditLoading] = useState(false);

  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, completed } = useFirebaseAuth();
  const [error, setError] = useState("");
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [foodsLastUpdate, setFoodsLastUpdate] = useState(0);
  const foods = useAppSelector(selectFoods);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodOptions, setFoodOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedFoods, setSelectedFoods] = useState<
    { value: string; label: string }[]
  >([]);
  const [form, setForm] = useState<customSaleForm>({
    customerName: customSale ? customSale.customerName : "",
    customerPhone: customSale ? customSale.customerPhone : "",
    totalPrice: customSale ? customSale.totalPrice : 0,
    errors: null,
  });

  useEffect(() => {
    if (completed && !user) {
      router.push(`/login?next=/editMember/${id}`);
    }
  }, [user, completed, router, id]);

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

  useEffect(() => {
    if (customSale) {
      setSelectedFoods(
        customSale.items.map(
          (c: {
            id: string;
            itemCategory: string;
            foodName: string;
            price: number;
            quantity: number;
          }) => ({
            label: c.foodName,
            value: c.id,
          })
        )
      );
    }
  }, [customSale]);

  const handleValidate = () => {
    let error = "";
    const phoneValid = validatePhone(form.customerPhone);
    if (form.customerPhone && phoneValid)
      error = "Phone Number isn't a valid phone number";
    else if (!selectedFoods.length) error = "A food must be selected";
    else if (!form.totalPrice) error = "Total price must be set";
    return error;
  };
  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  const handleEditAdmin = async () => {
    const data = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      totalPrice: parseFloat(form.totalPrice),
    };
    if (id) {
      const error = handleValidate();
      if (error) {
        setError(error);
        setEditLoading(false);
        return;
      }
      setEditLoading(true);
      const res = await dispatch(editCustomSale({ id: id.toString(), data }));
      if (res.meta.requestStatus === "rejected")
        setError((res as any).error.message);
      alert.success("Edit Successful");
      router.back();
      setEditLoading(false);
    }
  };

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  if (completed && !customSale) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p className={`font-md text-md`}>
          Search user on
          <Link href="/members">
            <a className="font-bold text-blue-600"> Dashboard</a>
          </Link>
        </p>
      </div>
    );
  }

  if (completed && user && customSale) {
    return (
      <div>
        <Head>
          <title>Edit Admin Member</title>
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
                  Edit Admin Member - {customSale.customerName}
                </h2>
                <div className={`flex items-center w-full`}>
                  <div className="flex flex-col w-[90%] sm:w-[70%] mx-auto items-center">
                    <Select
                      placeholder="Select Foods Bought"
                      className={`w-full sm:w-[80%]`}
                      value={selectedFoods}
                      onChange={(v: any) => {
                        setSelectedFoods(v);
                      }}
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={foodOptions}
                    />
                    <input
                      type="text"
                      className="p-2 outline-none border border-slate-200 my-2 w-full sm:w-[80%]"
                      value={form.customerName}
                      onChange={(e) => {
                        handleFormChange("customerName", e.target.value);
                      }}
                      placeholder="Customer Name"
                    />
                    <input
                      type="tel"
                      className="p-2 outline-none border border-slate-200 my-2 w-full sm:w-[80%]"
                      value={form.customerPhone}
                      onChange={(e) => {
                        handleFormChange("customerPhone", e.target.value);
                      }}
                      placeholder="Customer Phone"
                    />
                    <input
                      type="number"
                      className="p-2 outline-none border border-slate-200 my-2 w-full sm:w-[80%]"
                      value={form.totalPrice}
                      onChange={(e) => {
                        handleFormChange("totalPrice", e.target.value);
                      }}
                      placeholder="Total Price *"
                    />
                  </div>
                </div>
                <button
                  onClick={handleEditAdmin}
                  disabled={editLoading}
                  className={`flex items-center ${
                    editLoading ? "opacity-70" : "opacity-100"
                  } justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md mt-3`}
                >
                  {editLoading ? (
                    <AiOutlineLoading
                      className={`text-2xl animate-spin`}
                      color="black"
                    />
                  ) : (
                    "Edit"
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

export default EditSale;
