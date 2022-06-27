import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import ImagePicker from "../components/ImagePicker";
import Sidebar from "../components/Sidebar";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { addFoodCategory } from "../features/foods/foodsSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";

export type categoryFormError = {
  name: string | undefined;
};

export type categoryForm = {
  name: string;
  errors: categoryFormError | null;
};
const AddCategory: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const [form, setForm] = useState<categoryForm>({
    name: "",
    errors: null,
  });
  const [error, setError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<
    string | ArrayBuffer | null
  >("");
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/addCategory");
    }
  }, [user, completed, router]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);

  if (completed && !user) {
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
      name: "",
      errors: null,
    });
    setSelectedImage("");
  };
  const handleAddCategory = async () => {
    setError("");
    setAddLoading(true);
    const data = {
      imgURL: selectedImage,
      name: form.name,
    };
    if (!form.name || !selectedImage) {
      setAddLoading(false);
      setError("Set All Fields");
      return;
    }
    const res = await dispatch(addFoodCategory(data));
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
          <title>Add Food Category</title>
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
                  Add new food category
                </h2>
                <div className={`flex flex-col sm:flex-row items-center`}>
                  <ImagePicker
                    image={selectedImage}
                    setImage={setSelectedImage}
                    tstyles={`w-[180px] h-[150px] mr-2`}
                  />
                  <div className="flex flex-col">
                    <input
                      type="text"
                      className="p-2 outline-none border border-slate-200 my-2"
                      value={form.name}
                      onChange={(e) => {
                        handleFormChange("name", e.target.value);
                      }}
                      placeholder="Food Name"
                    />
                  </div>
                </div>
                <button
                  disabled={addLoading}
                  onClick={handleAddCategory}
                  className={`flex items-center ${
                    addLoading ? "opacity-70" : "opacity-100"
                  } justify-center w-[80%] p-5 bg-blue-600 hover:bg-blue-700 text-slate-100 rounded-md shadow-md mt-2`}
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

export default AddCategory;
