import { collection, doc, getDoc } from "firebase/firestore";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { AiOutlineLoading } from "react-icons/ai";
import ConfirmModal from "../../components/ConfirmModal";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import {
  deleteAgentRequest,
  deleteAgentRequests,
  getAgentRequests,
  selectAgentRequests,
  setNewRequestsCount,
} from "../../features/agentRequests/agentRequestsSlice";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { useOnAgentRequestUpdated } from "../../features/hooks/useOnAgentRequestsUpdated";
import { auth, db } from "../../libs/Firebase";
import axios from "../../libs/axios";
import { getIdToken } from "firebase/auth";

export const numInPage = 20;
const Requests: NextPage = () => {
  const { newRequestsCount } = useOnAgentRequestUpdated();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [search, setSearch] = useState("");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalAgentRequests, setTotalAgentRequests] = useState(0);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    nanoseconds: number;
    seconds: number;
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteRequestsLoading, setDeleteRequestsLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | boolean>("");
  const [acceptRequestId, setAcceptRequestId] = useState<string | boolean>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [agentRequestsLoading, setAgentRequestsLoading] = useState(false);
  const [error, setError] = useState("");
  const agentRequests = useAppSelector(selectAgentRequests(page));
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);
  const [displayedAgentRequests, setDisplayedAgentRequests] = useState<
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
      setAgentRequestsLoading(true);
      if (lastUpdateComplete && lastUpdate) {
        if (page <= totalPages)
          await dispatch(
            getAgentRequests({ page, lastUpdate: lastUpdate.nanoseconds })
          );
        setAgentRequestsLoading(false);
      }
    })();
  }, [page, lastUpdateComplete, dispatch, lastUpdate, totalPages]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(
        doc(collection(db, "appGlobals"), "agentRequests")
      );
      const globals: any = res.data();
      setTotalAgentRequests((res.data() as any)?.agentRequestsCount || 0);
      setLastUpdate({
        nanoseconds: globals?.agentRequestsLastUpdate?.nanoseconds,
        seconds: globals?.agentRequestsLastUpdate?.seconds,
      });
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    dispatch(setNewRequestsCount(0));
  }, [agentRequests]);

  useEffect(() => {
    let numPages =
      totalAgentRequests > numInPage
        ? Math.floor(totalAgentRequests / numInPage)
        : 1;
    setTotalPages(numPages);
  }, [totalAgentRequests]);

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
      await dispatch(deleteAgentRequests(selected));
      alert.success("Delete Successful");
      setTotalAgentRequests(
        totalAgentRequests - 1 < 0 ? 0 : totalAgentRequests - 1
      );
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
    setDeleteRequestsLoading(true);
    await dispatch(deleteAgentRequests([id]));
    setDeleteRequestsLoading(false);
    alert.success(`Delete Successful`);
    setTotalAgentRequests(
      totalAgentRequests - 1 < 0 ? 0 : totalAgentRequests - 1
    );
    setDeleteUserId("");
    setSelectedRequests([]);
  };

  const handleAcceptRequest = async (id: string) => {
    if (auth.currentUser) {
      setAcceptRequestLoading(true);
      const token = await getIdToken(auth.currentUser);
      const res = await axios.post("/customers/acceptRequest", {
        uid: id,
        token,
      });
      setAcceptRequestId("");
      setAcceptRequestLoading(false);
      if (res.data.error)
        return setError(
          typeof res.data.error === "string"
            ? res.data.error
            : res.data.error.toString()
        );
      alert.success("Added successfully");
      dispatch(deleteAgentRequest(id));
    } else {
      setError("Log in first");
    }
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
    setDisplayedAgentRequests(
      agentRequests.map((r) => [
        r.uid,
        r.firstName + " " + r.lastName,
        r.phoneNumber,
        r.email,
        <button
          key={r.uid}
          onClick={() => {
            setAcceptRequestId(r.uid);
          }}
          className="rounded-md text-green-500 border border-green-600 bg-white p-2 hover:bg-green-500 hover:text-white"
        >
          Accept Request
        </button>,
      ])
    );
  }, [agentRequests, search]);

  console.log(acceptRequestId);
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
          <title>Homiezfoods admin - Requests</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          {agentRequestsLoading ? (
            <div className={`w-full h-screen flex justify-center items-center`}>
              <AiOutlineLoading
                className={`text-2xl animate-spin`}
                color="black"
              />
            </div>
          ) : (
            <div className={`p-1 sm:p-5 lg:p-8`}>
              <div className={`max-w-4xl mx-auto flex flex-col items-center`}>
                <h2 className={`font-bold text-xl mb-5`}>Agent Requests</h2>
                <Table
                  hasSideAction
                  hasDelete
                  actions={[
                    {
                      id: "1",
                      name: "Delete Selected",
                      onGo: () => handleDeleteSelected(selectedRequests),
                    },
                  ]}
                  title={
                    <div className={`flex justify-between`}>
                      <h3 className="text-md font-bold">
                        {search ? "Search" : "Total"} -{" "}
                        {search
                          ? displayedAgentRequests.length
                          : totalAgentRequests || 0}
                      </h3>
                    </div>
                  }
                  onDeletePressed={(id) => {
                    setDeleteUserId(id);
                  }}
                  selected={selectedRequests}
                  setSelected={setSelectedRequests}
                  hasPagination
                  onPaginationNext={handleNextPage}
                  onPaginationPrev={handlePrevPage}
                  totalPages={totalPages}
                  page={page}
                  searchPlaceHolder="Search For Requests..."
                  actionLoading={actionLoading}
                  search={search}
                  setSearch={setSearch}
                  titles={["id", "Name", "Phone Number", "Email", ""]}
                  data={displayedAgentRequests}
                />
              </div>
            </div>
          )}
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            agentRequests.find((a) => a.uid === deleteUserId)?.lastName
          }?`}
          loading={deleteRequestsLoading}
          setShow={setDeleteUserId}
          show={Boolean(deleteUserId)}
        />
        <ConfirmModal
          onConfirm={() => handleAcceptRequest(acceptRequestId as string)}
          confirmText={`Are you sure you want to make ${
            agentRequests.find((a) => a.uid === acceptRequestId)?.lastName
          } an agent?`}
          loading={acceptRequestLoading}
          setShow={setAcceptRequestId}
          show={Boolean(acceptRequestId)}
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

export default Requests;
