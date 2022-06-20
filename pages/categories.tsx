import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";

const categories: NextPage = () => {
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/foods");
    }
  }, [user, completed]);

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  const handleCategoryEdit = (id: string) => {
    console.log(id);
    router.push(`/editCategory/${id}`);
  };

  const handleCategorySelectedAction = () => {
    console.log(selectedCategories);
  };

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
                    onGo: handleCategorySelectedAction,
                  },
                ]}
                title={
                  <div className={`flex justify-between`}>
                    <h3 className="text-md font-bold">Total - 1</h3>
                    <Link href="/addCategory">
                      <button className="text-white bg-blue-400 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                        Add New
                      </button>
                    </Link>
                  </div>
                }
                onEditPressed={handleCategoryEdit}
                selected={selectedCategories}
                setSelected={setSelectedCategories}
                searchPlaceHolder="Search For Food Category"
                search={categorySearch}
                setSearch={setCategorySearch}
                titles={["id", "Name", "Sales", "Orders"]}
                data={[["1", "Rice", "GHS 22.4k", "402"]]}
              />
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

export default categories;
