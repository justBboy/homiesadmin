import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../components/Sidebar";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";

export type customerFormError = {
  adminName: string | undefined;
  email: string | undefined;
  phoneNumber: string | undefined;
};

export type customerForm = {
  name: string;
  email: string;
  phoneNumber: string;
  errors: customerFormError | null;
};

const addCustomer = () => {
  const router = useRouter();
  const [form, setForm] = useState<customerForm>({
    name: "",
    email: "",
    phoneNumber: "",
    errors: null,
  });
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  if (!loading && null) {
    return (
      <div>
        <Head>
          <title>Add Customer</title>
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
                  Add new Customer
                </h2>
                <div className={`flex items-center w-full`}>
                  <div className="flex flex-col w-[70%] mx-auto items-center">
                    <input
                      type="text"
                      className="p-2 outline-none border border-slate-200 my-2 w-[80%]"
                      value={form.name}
                      onChange={(e) => {
                        handleFormChange("name", e.target.value);
                      }}
                      placeholder="Food Name"
                    />
                    <input
                      type="tel"
                      className="p-2 outline-none border border-slate-200 w-[80%]"
                      value={form.email}
                      onChange={(e) => {
                        handleFormChange("phoneNumber", e.target.value);
                      }}
                      placeholder="Phone Number"
                    />
                    <input
                      type="email"
                      className="p-2 outline-none border border-slate-200 w-[80%] my-2"
                      value={form.email}
                      onChange={(e) => {
                        handleFormChange("email", e.target.value);
                      }}
                      placeholder="Email"
                    />
                  </div>
                </div>
                <button
                  className={`flex items-center justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md mt-3`}
                >
                  Add
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

export default addCustomer;
