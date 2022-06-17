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

const members: NextPage = () => {
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
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

  const handleSelectedAction = () => {
    console.log(selectedMembers);
  };

  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editMember/${id}`);
  };

  if (!loading && user) {
    return (
      <div>
        <Head>
          <title>Homiezfoods admin - Admin Members</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div className={`p-1 sm:p-5 md:p-7`}>
            <div className={`max-w-3xl mx-auto flex flex-col items-center`}>
              <h2 className={`font-bold text-xl mb-5`}>Admin Members</h2>
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
                    <Link href="/addMember">
                      <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                        Add New
                      </button>
                    </Link>
                  </div>
                }
                onEditPressed={handleEdit}
                selected={selectedMembers}
                setSelected={setSelectedMembers}
                searchPlaceHolder="Search For Admin..."
                search={search}
                setSearch={setSearch}
                titles={["id", "Admin Name", "Email", "Phone Number"]}
                data={[
                  ["1", "Yaw Tutu Asare", "justbboyjs@gmail.com", "0247506391"],
                ]}
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

export default members;
