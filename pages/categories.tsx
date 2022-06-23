import { collection, doc, getDoc } from "firebase/firestore";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import {
  deleteFoodCategories,
  getFoodCategories,
  selectFoodCategories,
} from "../features/foods/foodsSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import Fuse from "fuse.js";
import { db } from "../libs/Firebase";
import { useAlert } from "react-alert";
import ConfirmModal from "../components/ConfirmModal";

const Categories: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const foodCategories = useAppSelector(selectFoodCategories);
  const [selectedFoodCategories, setSelectedFoodCategories] = useState<
    string[]
  >([]);
  const [page, setPage] = useState(1);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [totalFoodCategories, setTotalFoodCategories] = useState(0);
  const [foodCategoriesLastUpdate, setFoodCategoriesLastUpdate] = useState(0);
  const [foodCategoriesLoading, setfoodCategoriesLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | boolean>("");
  const [error, setError] = useState("");
  const [deleteFoodCategoriesLoading, setDeleteFoodCategoriesLoading] =
    useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [displayedFoodCategories, setDisplayedFoodCategories] = useState<
    (string | ReactElement | number)[][]
  >([]);
  const { user, completed } = useFirebaseAuth();
  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/categories");
    }
  }, [user, completed, router]);
  const handleDeleteSelected = useCallback(
    async (selected: string[] | undefined) => {
      setActionLoading(true);
      if (selected) {
        await dispatch(deleteFoodCategories(selected));
        alert.success("Delete Successful");
      }
      setActionLoading(false);
    },
    [alert]
  );
  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);
  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editCategory/${id}`);
  };

  const searchFood = useMemo(() => {
    return (search: string) => {
      const options = {
        keys: ["name"],
      };
      const fuse = new Fuse(foodCategories, options);
      if (search) {
        let sItems = fuse.search(search);
        console.log(sItems);
        return sItems.map((i) => i.item);
      }
    };
  }, [foodCategories]);

  const handleDelete = async (id: string) => {
    setDeleteFoodCategoriesLoading(true);
    await dispatch(deleteFoodCategories([id]));
    setDeleteFoodCategoriesLoading(false);
    alert.success(`Delete Successful`);
    setDeleteUserId("");
    setSelectedFoodCategories([]);
  };
  /*
  const handleGetAdminsListener = async () => {
    const q = query(collection(db, "admins"));
    return await onSnapshot(q, (snapshot) => {
      const matches = snapshot.docChanges();
      const admins = matches.map((m) => m.doc.data());
      dispatch(addAdmins(admins as userType[]));
    });
  };
*/
  useEffect(() => {
    (async () => {
      setfoodCategoriesLoading(true);
      console.log(lastUpdateComplete);
      if (lastUpdateComplete) {
        await dispatch(
          getFoodCategories({ page, lastUpdate: foodCategoriesLastUpdate })
        );
        setfoodCategoriesLoading(false);
      }
    })();
  }, [lastUpdateComplete, dispatch, page, foodCategoriesLastUpdate]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "foods"));
      const globals: any = res.data();
      setTotalFoodCategories((res.data() as any)?.foodCategoriesCount);
      setFoodCategoriesLastUpdate(
        globals?.foodCategoriesLastUpdate?.nanoseconds || 0
      );
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    if (search) {
      let foodCategories = searchFood(search);
      if (foodCategories)
        setDisplayedFoodCategories(
          foodCategories.map((category, indx) => [
            category.id,
            <img
              width="50px"
              height="50px"
              src={category.imgURL?.toString() || ""}
              key={indx}
              alt="Food image"
            />,
            category.name,
            category.numFoods,
            category.orders,
            category.sales,
          ])
        );
      return;
    }
    setDisplayedFoodCategories(
      foodCategories.map((category, indx) => [
        category.id,
        <img
          width="50px"
          height="50px"
          src={category.imgURL?.toString() || ""}
          key={indx}
          alt="Food image"
        />,
        category.name,
        category.numFoods,
        category.orders,
        category.sales,
      ])
    );
  }, [foodCategories, search, searchFood]);

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Homiezfoods admin - Food Categories</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div className={`sm:p-5 md:p-10`}>
            <section className="antialiased bg-gray-100 text-gray-600 flex flex-col items-center min-h-screen p-1 sm:px-4">
              <h3 className={`font-bold text-xl mt-10`}>Food Categories</h3>
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
                      {search
                        ? displayedFoodCategories.length
                        : foodCategories.length || 0}
                    </h3>
                    <Link href="/addCategory">
                      <button className="text-white bg-blue-400 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                        Add New
                      </button>
                    </Link>
                  </div>
                }
                onEditPressed={handleEdit}
                onDeletePressed={(id) => setDeleteUserId(id)}
                actionLoading={actionLoading}
                selected={selectedFoodCategories}
                setSelected={setSelectedFoodCategories}
                searchPlaceHolder="Search For Food Category"
                search={search}
                setSearch={setSearch}
                titles={[
                  "id",
                  "",
                  "Name",
                  "Number Of Foods",
                  "Orders",
                  "Sales",
                ]}
                data={displayedFoodCategories}
              />
            </section>
          </div>
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            foodCategories.find((u) => u.id === deleteUserId)?.name
          }`}
          loading={deleteFoodCategoriesLoading}
          setShow={setDeleteUserId}
          show={Boolean(deleteUserId)}
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

export default Categories;
