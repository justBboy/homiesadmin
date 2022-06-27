import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import ImagePicker from "../../components/ImagePicker";
import Sidebar from "../../components/Sidebar";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import {
  editFoodCategory,
  foodCategoryType,
  selectFoodCategory,
} from "../../features/foods/foodsSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";

export type categoryFormError = {
  name: string | undefined;
};

export type categoryForm = {
  name: string;
  errors: categoryFormError | null;
};
const EditCategory: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const { id } = router.query;
  const { user, completed } = useFirebaseAuth();
  const category = useAppSelector(selectFoodCategory(id as string));
  const [error, setError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [form, setForm] = useState<categoryForm>({
    name: category?.name || "",
    errors: null,
  });
  const [selectedImage, setSelectedImage] = useState<
    string | ArrayBuffer | null
  >(category?.imgURL || "");
  const sidebarStreched = useAppSelector(selectSidebarStreched);

  useEffect(() => {
    if (completed && !user) {
      router.push(`/login?next=/editCategory/${id}`);
    }
  }, [user, completed, router, id]);

  const handleEditCategory = async () => {
    const data: Partial<foodCategoryType> = {
      name: form.name,
      imgURL: selectedImage,
    };
    if (!form.name || !selectedImage) {
      setError("Set All Fields");
      return;
    }
    if (id) {
      setEditLoading(true);
      const res = await dispatch(editFoodCategory({ id: id.toString(), data }));
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

  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Edit Food Category</title>
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
                <h2
                  className={`font-bold text-2xl mb-5 text-center capitalize`}
                >
                  Edit food category - {category?.name}
                </h2>
                <div
                  className={`flex flex-col sm:flex-row sm:flex-start flex-center items-center`}
                >
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
                  onClick={handleEditCategory}
                  disabled={editLoading}
                  className={`flex items-center ${
                    editLoading ? "opacity-70" : "opacity-100"
                  } justify-center w-[80%] p-5 bg-blue-600 hover:bg-blue-700 text-slate-100 rounded-md shadow-md mt-2`}
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

export default EditCategory;
