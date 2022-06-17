import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import ImagePicker from "../../components/ImagePicker";
import Sidebar from "../../components/Sidebar";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import { useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";

export type foodFormError = {
  name: string | undefined;
  price: number | undefined;
  category: string | undefined;
};

export type foodForm = {
  name: string;
  price: number;
  category: string;
  errors: foodFormError | null;
};

const editFood = () => {
  const router = useRouter();
  const [form, setForm] = useState<foodForm>({
    name: "",
    price: 0,
    category: "",
    errors: null,
  });
  const [selectedImage, setSelectedImage] = useState("");
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { id } = router.query;
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

  if (!loading && user) {
    return (
      <div>
        <Head>
          <title>Edit Food</title>
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
                  Edit food - Jollor rice and Chicken
                </h2>
                <div
                  className={`flex flex-col sm:flex-row sm:flex-start flex-center items-center`}
                >
                  <ImagePicker
                    selected={selectedImage}
                    setSelected={setSelectedImage}
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
                    <div className="flex flex-col my-2">
                      <input
                        type="number"
                        className="p-2 outline-none border border-slate-200"
                        value={form.price}
                        onChange={(e) => {
                          handleFormChange("price", e.target.value);
                        }}
                        placeholder="Price"
                      />
                      <span className="font-gothamThin font-thiner text-xs">
                        Price
                      </span>
                    </div>

                    <select
                      className="p-2 outline-none border border-slate-200 my-2"
                      value={form.category}
                      onChange={(e) =>
                        handleFormChange("category", e.target.value)
                      }
                    >
                      <option value="">Choose Category</option>
                    </select>
                  </div>
                </div>
                <button
                  className={`flex items-center justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
                >
                  Edit
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

export default editFood;
