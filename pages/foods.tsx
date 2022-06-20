import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";

const foods: NextPage = () => {
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
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

  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editFood/${id}`);
  };

  const handleSelectedAction = () => {
    console.log(selectedFoods);
  };

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
                    onGo: handleSelectedAction,
                  },
                ]}
                title={
                  <div className={`flex justify-between`}>
                    <h3 className="text-md font-bold">Total - 1</h3>
                    <Link href="/addFood">
                      <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                        Add New
                      </button>
                    </Link>
                  </div>
                }
                onEditPressed={handleEdit}
                selected={selectedFoods}
                setSelected={setSelectedFoods}
                searchPlaceHolder="Search For Food"
                search={search}
                setSearch={setSearch}
                titles={["id", "Name", "price", "available", "sales", "orders"]}
                data={[
                  [
                    "1",
                    "Jollof Rice and Chicken",
                    "22",
                    "yes",
                    "GHS 11.23k",
                    "2.35k",
                  ],
                ]}
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

export default foods;
