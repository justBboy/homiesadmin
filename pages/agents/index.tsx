import { collection, doc, getDoc } from "firebase/firestore";
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
  deleteAgents,
  getAgents,
  selectAgents,
} from "../../features/agents/agentsSlice";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { useOnAgentRequestUpdated } from "../../features/hooks/useOnAgentRequestsUpdated";
import { db } from "../../libs/Firebase";

export const numInPage = 20;
const Agents = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const { newRequestsCount } = useOnAgentRequestUpdated();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    nanoseconds: number;
    seconds: number;
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteAgentsLoading, setDeleteAgentsLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | boolean>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [error, setError] = useState("");
  const agents = useAppSelector(selectAgents(page));
  const [displayedAgents, setDisplayedAgents] = useState<
    (string | ReactElement | number)[][]
  >([]);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/agents/requests");
    }
  }, [user, completed, router]);

  useEffect(() => {
    (async () => {
      setAgentsLoading(true);
      if (lastUpdateComplete && lastUpdate) {
        if (page <= totalPages)
          await dispatch(
            getAgents({ page, lastUpdate: lastUpdate.nanoseconds })
          );
        setAgentsLoading(false);
      }
    })();
  }, [page, lastUpdateComplete, dispatch, lastUpdate, totalPages]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "agents"));
      const globals: any = res.data();
      setTotalAgents((res.data() as any)?.agentsCount || 0);
      setLastUpdate({
        nanoseconds: globals?.agentsLastUpdate?.nanoseconds,
        seconds: globals?.agentsLastUpdate?.nanoseconds,
      });
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    let numPages =
      totalAgents > numInPage ? Math.floor(totalAgents / numInPage) : 1;
    setTotalPages(numPages);
  }, [totalAgents]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  console.log(lastUpdate);
  const handleDeleteSelected = async (selected: string[] | undefined) => {
    console.log(selected);
    setActionLoading(true);
    if (selected && selected.length) {
      const res = await dispatch(deleteAgents(selected));
      setSelectedAgents([]);
      if (res.meta.requestStatus === "rejected") {
        setError((res as any).error.message);
        return;
      }
      alert.success("Delete Successful");
      setTotalAgents(totalAgents - 1);
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
    setDeleteAgentsLoading(true);
    const res = await dispatch(deleteAgents([id]));
    setDeleteAgentsLoading(false);
    setDeleteUserId("");
    console.log(res);
    if (res.meta.requestStatus === "rejected") {
      setError((res as any).error.message);
      return;
    }
    alert.success(`Delete Successful`);
    setTotalAgents(totalAgents - 1);
    setSelectedAgents([]);
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
    setDisplayedAgents(
      agents.map((agent) => [
        agent.uid,
        agent.firstName + " " + agent.lastName,
        agent.email,
        agent.phoneNumber,
        `₵${agent.sales || 0}`,
        agent.orders || 0,
        `₵${agent.profits || 0}`,
      ])
    );
  }, [agents, search]);

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
          <title>Homiezfoods admin - Agents</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          {agentsLoading ? (
            <div className={`w-full h-screen flex justify-center items-center`}>
              <AiOutlineLoading
                className={`text-2xl animate-spin`}
                color="black"
              />
            </div>
          ) : (
            <div className={`p-1 sm:p-5 lg:p-8`}>
              <div className={`max-w-4xl mx-auto flex flex-col items-center`}>
                <h2 className={`font-bold text-xl mb-5`}>Agents</h2>
                <Table
                  hasSideAction
                  hasDelete
                  actions={[
                    {
                      id: "1",
                      name: "Delete Selected",
                      onGo: () => handleDeleteSelected(selectedAgents),
                    },
                  ]}
                  title={
                    <div className={`flex justify-between`}>
                      <h3 className="text-md font-bold">
                        {search ? "Search" : "Total"} -{" "}
                        {search ? displayedAgents.length : totalAgents || 0}
                      </h3>
                      <Link href="/agents/requests">
                        <button
                          className={`text-white bg-orange-400 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 `}
                        >
                          Requests
                          {newRequestsCount > 0 && (
                            <span
                              className={`ml-3 min-w-[35px] rounded-md py-1 px-2 bg-red-500 text-white`}
                            >
                              {newRequestsCount}
                            </span>
                          )}
                        </button>
                      </Link>
                    </div>
                  }
                  onDeletePressed={(id) => setDeleteUserId(id)}
                  selected={selectedAgents}
                  setSelected={setSelectedAgents}
                  hasPagination
                  onPaginationNext={handleNextPage}
                  onPaginationPrev={handlePrevPage}
                  totalPages={totalPages}
                  page={page}
                  searchPlaceHolder="Search For Agent..."
                  actionLoading={actionLoading}
                  search={search}
                  setSearch={setSearch}
                  titles={[
                    "id",
                    "Agent Name",
                    "Phone Number",
                    "Email",
                    "Sales",
                    "Orders",
                    "Profits",
                  ]}
                  data={displayedAgents}
                />
              </div>
            </div>
          )}
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            agents.find((a) => a.uid === deleteUserId)?.lastName
          }`}
          loading={deleteAgentsLoading}
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

export default Agents;
