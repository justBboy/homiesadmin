import { collection, doc, getDoc } from "firebase/firestore";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { getOrders, selectOrders } from "../../features/orders/ordersSlice";
import { db } from "../../libs/Firebase";

export const numInPage = 20;
const OrdersHistory: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    nanoseconds: number;
    seconds: number;
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteCustomersLoading, setDeleteCustomersLoading] = useState(false);
  //const [deleteOrderId, setDeleteOrderId] = useState<string | boolean>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [ordersLoading, setCustomersLoading] = useState(false);
  const orders = useAppSelector(selectOrders(page));
  const [displayedOrders, setDisplayedOrders] = useState<
    (string | ReactElement)[][]
  >([]);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/history");
    }
  }, [user, completed, router]);

  useEffect(() => {
    (async () => {
      setCustomersLoading(true);
      if (lastUpdateComplete && lastUpdate) {
        if (page <= totalPages)
          await dispatch(
            getOrders({ page, lastUpdate: lastUpdate.nanoseconds })
          );
        setCustomersLoading(false);
      }
    })();
  }, [page, lastUpdateComplete, dispatch, lastUpdate, totalPages]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "orders"));
      const globals: any = res.data();
      setTotalOrders((res.data() as any)?.ordersCount);
      setLastUpdate({
        nanoseconds: globals?.ordersLastUpdate?.nanoseconds,
        seconds: globals?.ordersLastUpdate?.nanoseconds,
      });
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    let numPages =
      totalOrders > numInPage ? Math.floor(totalOrders / numInPage) : 1;
    setTotalPages(numPages);
  }, [totalOrders]);

  console.log(lastUpdate);
  /*
  const handleDeleteSelected = async (selected: string[] | undefined) => {
    console.log(selected);
    setActionLoading(true);
    if (selected && selected.length) {
      await dispatch(deleteCustomers(selected));
      alert.success("Delete Successful");
    }
    setActionLoading(false);
  };
  */

  /*
  const handleDelete = async (id: string) => {
    setDeleteCustomersLoading(true);
    await dispatch(deleteCustomers([id]));
    setDeleteCustomersLoading(false);
    alert.success(`Delete Successful`);
    setDeleteUserId("");
    setSelectedCustomers([]);
  };
  */

  const handleNextPage = () => {
    if (page <= totalPages) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    setPage((p) => {
      if (p > 1) return p - 1;
      return p;
    });
  };

  /*
  useEffect(() => {
    setDisplayedOrders(
      orders.map((order) => [
        order.id,
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
    */

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
          <title>Homiezfoods admin - Orders History</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          {ordersLoading ? (
            <div className={`w-full h-screen flex justify-center items-center`}>
              <AiOutlineLoading
                className={`text-2xl animate-spin`}
                color="black"
              />
            </div>
          ) : (
            <div className={`p-1 sm:p-5 lg:p-8`}>
              <div className={`max-w-2xl mx-auto flex flex-col items-center`}>
                <h2 className={`font-bold text-xl mb-5`}>Orders History</h2>
                <Table
                  hasSideAction
                  hasDelete
                  actions={[]}
                  title={
                    <div className={`flex justify-between`}>
                      <h3 className="text-md font-bold">
                        {search ? "Search" : "Total"} -{" "}
                        {search ? displayedOrders.length : totalOrders || 0}
                      </h3>
                      {/* 
                       <Link href="/addCustomer">
                        <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                          Add New
                        </button>
                      </Link>
                      */}
                    </div>
                  }
                  //onDeletePressed={(id) => setDeleteUserId(id)}
                  selected={selectedOrders}
                  setSelected={setSelectedOrders}
                  hasPagination
                  onPaginationNext={handleNextPage}
                  onPaginationPrev={handlePrevPage}
                  totalPages={totalPages}
                  page={page}
                  searchPlaceHolder="Search For Orders..."
                  actionLoading={actionLoading}
                  search={search}
                  setSearch={setSearch}
                  titles={[
                    "id",
                    "By",
                    "Total Price",
                    "Number Of Items",
                    "Created At",
                  ]}
                  data={displayedOrders}
                />
              </div>
            </div>
          )}
        </main>
        {/* 
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            customers.find((u) => u.uid === deleteUserId)?.username
          }`}
          loading={deleteCustomersLoading}
          setShow={setDeleteUserId}
          show={Boolean(deleteUserId)}
        />
        */}
      </div>
    );
  }
  return (
    <div className={`w-screen h-screen flex justify-center items-center`}>
      <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
    </div>
  );
};

export default OrdersHistory;
