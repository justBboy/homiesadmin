import { collection, doc, getDoc } from "firebase/firestore";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import ConfirmModal from "../../components/ConfirmModal";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import {
  deleteCustomSales,
  getCustomSales,
  selectCustomSales,
} from "../../features/customSales/customSalesSlice";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { orderType } from "../../features/orders/ordersSlice";
import { db } from "../../libs/Firebase";

export const numInPage = 20;
const CSales: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    nanoseconds: number;
    seconds: number;
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteSalesLoading, setDeleteSalesLoading] = useState(false);
  const [deleteSaleId, setDeleteSaleId] = useState<string | boolean>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const customSales = useAppSelector(selectCustomSales(page));
  const [displayedCustomers, setDisplayedCustomers] = useState<
    (string | ReactElement | number)[][]
  >([]);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/cSales");
    }
  }, [user, completed, router]);

  useEffect(() => {
    (async () => {
      setSalesLoading(true);
      if (lastUpdateComplete && lastUpdate) {
        if (page <= totalPages)
          await dispatch(
            getCustomSales({ page, lastUpdate: lastUpdate.nanoseconds })
          );
        setSalesLoading(false);
      }
    })();
  }, [page, lastUpdateComplete, dispatch, lastUpdate, totalPages]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "orders"));
      const globals: any = res.data();
      setTotalSales((res.data() as any)?.customSalesCount);
      setLastUpdate({
        nanoseconds: globals?.customSalesLastUpdate?.nanoseconds,
        seconds: globals?.customSalesLastUpdate?.seconds,
      });
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    let numPages =
      totalSales > numInPage ? Math.floor(totalSales / numInPage) : 1;
    setTotalPages(numPages);
  }, [totalSales]);

  console.log(lastUpdate);
  const handleDeleteSelected = async (selected: string[] | undefined) => {
    console.log(selected);
    setActionLoading(true);
    if (selected && selected.length) {
      await dispatch(deleteCustomSales(selected));
      alert.success("Delete Successful");
      setTotalSales(totalSales - 1);
    }
    setActionLoading(false);
  };

  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/cSales/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteSalesLoading(true);
    await dispatch(deleteCustomSales([id]));
    setDeleteSalesLoading(false);
    alert.success(`Delete Successful`);
    setTotalSales(totalSales - 1);
    setDeleteSaleId("");
    setSelectedSales([]);
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
      customSales.map((c) => [
        c.id,
        (c as any).customerName as string,
        (c as any).customerPhone as string,
        `₵${(c as any).totalPrice}`,
      ])
    );
  }, [customSales, search]);

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
          <title>Homiezfoods admin - Custom Sales</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          {salesLoading ? (
            <div className={`w-full h-screen flex justify-center items-center`}>
              <AiOutlineLoading
                className={`text-2xl animate-spin`}
                color="black"
              />
            </div>
          ) : (
            <div className={`p-1 sm:p-5 lg:p-8`}>
              <div className={`max-w-4xl mx-auto flex flex-col items-center`}>
                <h2 className={`font-bold text-xl mb-5`}>Manual Sales</h2>
                <Table
                  hasSideAction
                  hasDelete={user.superadmin}
                  actions={[
                    {
                      id: "1",
                      name: "Delete Selected",
                      onGo: () => handleDeleteSelected(selectedSales),
                    },
                  ]}
                  title={
                    <div className={`flex justify-between`}>
                      <h3 className="text-md font-bold">
                        {search ? "Search" : "Total"} -{" "}
                        {search ? displayedCustomers.length : totalSales || 0}
                      </h3>
                      <Link href="/cSales/add">
                        <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                          Add New
                        </button>
                      </Link>
                    </div>
                  }
                  onDeletePressed={(id) => setDeleteSaleId(id)}
                  selected={selectedSales}
                  setSelected={setSelectedSales}
                  hasEdit
                  onEditPressed={handleEdit}
                  hasPagination
                  onPaginationNext={handleNextPage}
                  onPaginationPrev={handlePrevPage}
                  totalPages={totalPages}
                  page={page}
                  searchPlaceHolder="Search For Custom Sale..."
                  actionLoading={actionLoading}
                  search={search}
                  setSearch={setSearch}
                  titles={["id", "Customer Name", "Phone Number", "Paid"]}
                  data={displayedCustomers}
                />
              </div>
            </div>
          )}
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteSaleId.toString())}
          confirmText={`Are you sure you want to delete?`}
          loading={deleteSalesLoading}
          setShow={setDeleteSaleId}
          show={Boolean(deleteSaleId)}
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

export default CSales;
