import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import {
  deleteCustomers,
  getCustomers,
  selectCustomers,
} from "../features/customer/customersSlice";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useAlert } from "react-alert";
import ConfirmModal from "../components/ConfirmModal";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../libs/Firebase";

export const numInPage = 20;
const customers: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    nanoseconds: number;
    seconds: number;
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteCustomersLoading, setDeleteCustomersLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | boolean>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const customers = useAppSelector(selectCustomers(page));
  const [displayedCustomers, setDisplayedCustomers] = useState<
    (string | ReactElement)[][]
  >([]);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/customers");
    }
  }, [user, completed]);

  useEffect(() => {
    (async () => {
      setCustomersLoading(true);
      if (lastUpdateComplete && lastUpdate) {
        if (page <= totalPages)
          await dispatch(
            getCustomers({ page, lastUpdate: lastUpdate.nanoseconds })
          );
        setCustomersLoading(false);
      }
    })();
  }, [page, lastUpdateComplete]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "global"));
      console.log(
        "customers count ===========> ",
        (res.data() as any).customersCount
      );
      const globals: any = res.data();
      setTotalCustomers((res.data() as any).customersCount);
      setLastUpdate({
        nanoseconds: globals.customersLastUpdate.nanoseconds,
        seconds: globals.customersLastUpdate.nanoseconds,
      });
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    let numPages =
      totalCustomers > numInPage ? Math.floor(totalCustomers / numInPage) : 1;
    setTotalPages(numPages);
  }, [totalCustomers]);

  console.log(lastUpdate);
  const handleDeleteSelected = async (selected: string[] | undefined) => {
    console.log(selected);
    setActionLoading(true);
    if (selected && selected.length) {
      await dispatch(deleteCustomers(selected));
      alert.success("Delete Successful");
    }
    setActionLoading(false);
  };

  /*
  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editMember/${id}`);
  };
  */

  const handleDelete = async (id: string) => {
    setDeleteCustomersLoading(true);
    await dispatch(deleteCustomers([id]));
    setDeleteCustomersLoading(false);
    alert.success(`Delete Successful`);
    setDeleteUserId("");
    setSelectedCustomers([]);
  };

  const handleNextPage = () => {
    if (page <= totalPages) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    setPage((p) => {
      if (p > 1) return p - 1;
      return p;
    });
  };

  useEffect(() => {
    setDisplayedCustomers(
      customers.map((customer) => [
        customer.uid,
        customer.username,
        `${
          customer.phoneNumber.startsWith("+")
            ? "0" + customer.phoneNumber.substring(4)
            : customer.phoneNumber
        }`,
        customer.email,
      ])
    );
  }, [customers, search]);

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
          <title>Homiezfoods admin - Customers</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          {customersLoading ? (
            <div className={`w-full h-screen flex justify-center items-center`}>
              <AiOutlineLoading
                className={`text-2xl animate-spin`}
                color="black"
              />
            </div>
          ) : (
            <div className={`p-1 sm:p-5 lg:p-8`}>
              <div className={`max-w-2xl mx-auto flex flex-col items-center`}>
                <h2 className={`font-bold text-xl mb-5`}>Customers</h2>
                <Table
                  hasSideAction
                  hasDelete
                  actions={[
                    {
                      id: "1",
                      name: "Delete Selected",
                      onGo: () => handleDeleteSelected(selectedCustomers),
                    },
                  ]}
                  title={
                    <div className={`flex justify-between`}>
                      <h3 className="text-md font-bold">
                        {search ? "Search" : "Total"} -{" "}
                        {search ? displayedCustomers.length : totalCustomers}
                      </h3>
                      <Link href="/addCustomer">
                        <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                          Add New
                        </button>
                      </Link>
                    </div>
                  }
                  onDeletePressed={(id) => setDeleteUserId(id)}
                  selected={selectedCustomers}
                  setSelected={setSelectedCustomers}
                  hasPagination
                  onPaginationNext={handleNextPage}
                  onPaginationPrev={handlePrevPage}
                  totalPages={totalPages}
                  page={page}
                  searchPlaceHolder="Search For Customer..."
                  actionLoading={actionLoading}
                  search={search}
                  setSearch={setSearch}
                  titles={["id", "Customer Name", "Phone Number", "Email"]}
                  data={displayedCustomers}
                />
              </div>
            </div>
          )}
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            customers.find((u) => u.uid === deleteUserId)?.username
          }`}
          loading={deleteCustomersLoading}
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

export default customers;
