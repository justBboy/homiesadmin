import { collection, doc, getDoc } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import ImagePicker from "../../components/ImagePicker";
import Sidebar from "../../components/Sidebar";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import {
  editFood,
  editFoodCategory,
  foodType,
  getFoodCategories,
  selectFood,
  selectFoodCategories,
} from "../../features/foods/foodsSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { db } from "../../libs/Firebase";

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

const EditFood = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const { id } = router.query;
  const food = useAppSelector(selectFood(id as string));
  const [form, setForm] = useState<foodForm>({
    name: food?.name || "",
    price: food?.price || 0,
    category: (food?.category as any)?.id || "",
    errors: null,
  });
  const [selectedImage, setSelectedImage] = useState<
    string | ArrayBuffer | null
  >(food?.imgURL || "");
  const [
    foodCategoriesLastUpdateComplete,
    setFoodCategoriesLastUpdateComplete,
  ] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [foodCategoriesLastUpdate, setFoodCategoriesLastUpdate] = useState(0);
  const categories = useAppSelector(selectFoodCategories);
  const [error, setError] = useState("");
  const sidebarStreched = useAppSelector(selectSidebarStreched);

  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push(`/login?next=/editFoor/${id}`);
    }
  }, [user, completed, router, id]);

  useEffect(() => {
    (async () => {
      if (foodCategoriesLastUpdateComplete) {
        await dispatch(
          getFoodCategories({ page: 1, lastUpdate: foodCategoriesLastUpdate })
        );
      }
    })();
  }, [foodCategoriesLastUpdateComplete, dispatch, foodCategoriesLastUpdate]);

  useEffect(() => {
    (async () => {
      setFoodCategoriesLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "foods"));
      const globals: any = res.data();
      setFoodCategoriesLastUpdate(
        globals?.foodCategoriesLastUpdate?.nanoseconds || 0
      );
      setFoodCategoriesLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);

  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  const handleEditFood = async () => {
    const data: Partial<foodType> = {
      imgURL: selectedImage,
      name: form.name,
      price: form.price,
      category: form.category,
    };
    if (!form.category || !form.name || !form.price || !selectedImage) {
      setError("Set All Fields");
      return;
    }
    if (id) {
      setEditLoading(true);
      const res = await dispatch(editFood({ id: id.toString(), data }));
      if (res.meta.requestStatus === "rejected")
        setError((res as any).error.message);
      alert.success("Edit Successful");
      router.back();
      setEditLoading(false);
    }
  };

  if (completed && user) {
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
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleEditFood}
                  disabled={editLoading}
                  className={`flex items-center ${
                    editLoading ? "opacity-70" : "opacity-100"
                  } justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
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

export default EditFood;
