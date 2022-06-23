import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import Fuse from "fuse.js";
import { useAlert } from "react-alert";
import {
  deleteFoods,
  getFoods,
  selectFoods,
  setFoodAvailable,
} from "../features/foods/foodsSlice";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../libs/Firebase";
import ConfirmModal from "../components/ConfirmModal";

const Foods: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const foods = useAppSelector(selectFoods);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [totalFoods, setTotalFoods] = useState(0);
  const [foodsLastUpdate, setFoodsLastUpdate] = useState(0);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | boolean>("");
  const [deleteFoodsLoading, setDeleteFoodsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [foodAvailableLoading, setFoodAvailableLoading] = useState(false);
  const [selectedFoodAvailableChangeId, setSelectedFoodAvailableChangeId] =
    useState<{ id: string | boolean; available: boolean } | null | boolean>(
      null
    );

  const [displayedFoods, setDisplayedFoods] = useState<
    (string | ReactElement | number)[][]
  >([]);
  const { user, completed } = useFirebaseAuth();
  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/foods");
    }
  }, [user, completed, router]);
  const handleDeleteSelected = useCallback(
    async (selected: string[] | undefined) => {
      setActionLoading(true);
      if (selected) {
        await dispatch(deleteFoods(selected));
        alert.success("Delete Successful");
      }
      setActionLoading(false);
    },
    [alert, dispatch]
  );
  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editFood/${id}`);
  };

  const searchFood = useMemo(() => {
    return (search: string) => {
      const options = {
        keys: ["name"],
      };
      const fuse = new Fuse(foods, options);
      if (search) {
        let sItems = fuse.search(search);
        console.log(sItems);
        return sItems.map((i) => i.item);
      }
    };
  }, [foods]);

  const handleDelete = async (id: string) => {
    setDeleteFoodsLoading(true);
    await dispatch(deleteFoods([id]));
    setDeleteFoodsLoading(false);
    alert.success(`Delete Successful`);
    setDeleteUserId("");
    setSelectedFoods([]);
  };

  const handleFoodAvailableChange = async (id: string) => {
    setFoodAvailableLoading(true);
    const res = await dispatch(setFoodAvailable(id));
    if (res.meta.requestStatus === "rejected")
      setError((res as any).error.message);
    const food = foods.find((f) => f.id === id);
    if (food)
      alert.success(
        `${food?.name} now ${
          foods.find((f) => f.id === id)?.available
            ? "Unavailable"
            : "Available"
        }`
      );
    setFoodAvailableLoading(false);
  };
  useEffect(() => {
    (async () => {
      setFoodsLoading(true);
      if (lastUpdateComplete) {
        await dispatch(getFoods({ page, lastUpdate: foodsLastUpdate }));
        setFoodsLoading(false);
      }
    })();
  }, [lastUpdateComplete, dispatch, page, foodsLastUpdate]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "foods"));
      const globals: any = res.data();
      setTotalFoods((res.data() as any)?.foodsCount);
      setFoodsLastUpdate(globals?.foodsLastUpdate?.nanoseconds || 0);
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    if (search) {
      let foods = searchFood(search);
      if (foods)
        setDisplayedFoods(
          foods.map((food, indx) => [
            food.id,
            <img
              width="50px"
              height="50px"
              src={food.imgURL?.toString() || ""}
              key={indx}
              alt="Food image"
            />,
            food.name,
            `₵${food.price}`,
            food.orders,
            food.sales,
            <label
              htmlFor="default-toggle"
              key={indx}
              className="inline-flex relative items-center cursor-pointer"
            >
              <input
                type="checkbox"
                value={food.id}
                onClick={(e) => {
                  setSelectedFoodAvailableChangeId({
                    id: food.id,
                    available: Boolean(food.available),
                  });
                  (e.target as HTMLInputElement).checked = Boolean(
                    food.available
                  );
                }}
                checked={food.available}
                id="default-toggle"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>,
          ])
        );
      return;
    }
    setDisplayedFoods(
      foods.map((food, indx) => [
        food.id,
        <img
          width="50px"
          height="50px"
          src={food.imgURL?.toString() || ""}
          key={indx}
          alt="Food image"
        />,
        food.name,
        `₵${food.price}`,
        food.orders,
        food.sales,
        <label
          htmlFor="default-toggle"
          key={indx}
          className="inline-flex relative items-center cursor-pointer"
        >
          <input
            type="checkbox"
            value={food.id}
            id="default-toggle"
            checked={food.available}
            onClick={(e) => {
              setSelectedFoodAvailableChangeId({
                id: food.id,
                available: Boolean(food.available),
              });
              (e.target as HTMLInputElement).checked = Boolean(food.available);
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>,
      ])
    );
  }, [foods, search, searchFood]);

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Homiezfoods admin - Foods</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div className={`sm:p-5 md:p-10`}>
            <section className="antialiased bg-gray-100 text-gray-600 flex flex-col items-center min-h-screen p-1 sm:px-4">
              <h3 className={`font-bold text-xl mt-10`}>Foods</h3>
              <Table
                hasSideAction
                hasDelete
                hasEdit
                actions={[
                  {
                    id: "1",
                    name: "Delete Selected",
                    onGo: handleDeleteSelected,
                  },
                ]}
                title={
                  <div className={`flex justify-between`}>
                    <h3 className="text-md font-bold">
                      {search ? "Search" : "Total"} -{" "}
                      {search ? displayedFoods.length : foods.length || 0}
                    </h3>
                    <Link href="/addFood">
                      <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                        Add New
                      </button>
                    </Link>
                  </div>
                }
                onEditPressed={handleEdit}
                onDeletePressed={(id) => setDeleteUserId(id)}
                actionLoading={actionLoading}
                selected={selectedFoods}
                setSelected={setSelectedFoods}
                searchPlaceHolder="Search For Food"
                search={search}
                setSearch={setSearch}
                titles={[
                  "id",
                  "",
                  "Name",
                  "Price",
                  "Orders",
                  "Sales",
                  "Available",
                ]}
                data={displayedFoods}
              />
            </section>
          </div>
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            foods.find((u) => u.id === deleteUserId)?.name
          }`}
          loading={deleteFoodsLoading}
          setShow={setDeleteUserId}
          show={Boolean(deleteUserId)}
        />
        <ConfirmModal
          onConfirm={() => {
            const selected = selectedFoodAvailableChangeId as {
              id: string;
              available: boolean;
            };
            handleFoodAvailableChange(selected.id);
          }}
          confirmText={`Are you sure you want to set ${
            foods.find(
              (u) => u.id === (selectedFoodAvailableChangeId as any)?.id
            )?.name
          } as ${
            foods.find(
              (f) => f.id === (selectedFoodAvailableChangeId as any)?.id
            )?.available
              ? "Unavailable"
              : "Available"
          }`}
          loading={foodAvailableLoading}
          setShow={setSelectedFoodAvailableChangeId}
          show={Boolean(selectedFoodAvailableChangeId)}
        />
      </div>
    );
  }
  return (
    <div className={`w-screen h-screen flex justify-center items-center`}>
      <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
    </div>
  );
};

export default Foods;
