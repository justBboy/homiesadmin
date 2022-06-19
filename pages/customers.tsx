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

const customers: NextPage = () => {
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/customers");
    }
  }, [user, completed]);

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  const handleSelectedAction = () => {
    console.log(selectedCustomers);
  };

  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editCustomer/${id}`);
  };

  if (completed && user) {
    return (
      <div>
        <Head>
          <title>Homiezfoods admin - Customers</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div className={`p-1 sm:p-5 lg:p-8`}>
            <div className={`max-w-2xl mx-auto flex flex-col items-center`}>
              <h2 className={`font-bold text-xl mb-5`}>Customers</h2>
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
                    <Link href="/addCustomer">
                      <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                        Add New
                      </button>
                    </Link>
                  </div>
                }
                onEditPressed={handleEdit}
                selected={selectedCustomers}
                setSelected={setSelectedCustomers}
                searchPlaceHolder="Search For Customer..."
                search={search}
                setSearch={setSearch}
                titles={["id", "Customer Name", "Phone Number", "Email"]}
                data={[["1", "Yaw Tutu Asare", "0247506391", "Email"]]}
              />
            </div>
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

export default customers;
