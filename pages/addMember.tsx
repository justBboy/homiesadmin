import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { useDispatch } from "react-redux";
import ImagePicker from "../components/ImagePicker";
import Sidebar from "../components/Sidebar";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { addAdmin } from "../features/users/usersSlice";
import { useAlert } from "react-alert";

export type memberFormError = {
  adminName: string | undefined;
  email: string | undefined;
  phoneNumber: string | undefined;
};

export type memberForm = {
  name: string;
  email: string;
  phoneNumber: string;
  errors: memberFormError | null;
};

export type memberFormItems = {
  name: string;
  email: string;
  phoneNumber: string;
};

const addMember: NextPage = () => {
  const router = useRouter();
  const alert = useAlert();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<memberForm>({
    name: "",
    email: "",
    phoneNumber: "",
    errors: null,
  });
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, completed } = useFirebaseAuth();
  const [error, setError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/addMember");
    }
  }, [user, completed]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  const cleanForm = () => {
    setForm({
      email: "",
      phoneNumber: "",
      name: "",
      errors: null,
    });
  };
  const handleAddAdmin = async () => {
    setError("");
    setAddLoading(true);
    const data = {
      name: form.name,
      email: form.email,
      phoneNumber: form.phoneNumber,
    };
    const res = await dispatch(addAdmin(data));
    if (res.meta.requestStatus === "rejected")
      setError((res as any).error.message);
    else {
      alert.success(`${form.name}, Added Successfuly`);
      cleanForm();
    }
    setAddLoading(false);
  };

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Add Admin Member</title>
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
                  Add new Admin Member
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
                      placeholder="Admin Name"
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
                    <input
                      type="tel"
                      className="p-2 outline-none border border-slate-200 w-[80%]"
                      value={form.phoneNumber}
                      onChange={(e) => {
                        handleFormChange("phoneNumber", e.target.value);
                      }}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                <button
                  disabled={addLoading}
                  onClick={handleAddAdmin}
                  className={`flex items-center ${
                    addLoading ? "opacity-70" : "opacity-100"
                  } justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md mt-3`}
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

export default addMember;
