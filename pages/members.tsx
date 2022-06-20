import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineLoading } from "react-icons/ai";
import ConfirmModal from "../components/ConfirmModal";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useAlert } from "react-alert";
import {
  deleteAdmins,
  getAdmins,
  selectAdmins,
  setAdminsLastUpdate,
  userType,
} from "../features/admin/adminsSlice";
import Fuse from "fuse.js";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../libs/Firebase";

const members: NextPage = () => {
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const router = useRouter();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [page, setPage] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [search, setSearch] = useState("");
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsLastUpdate, setAdminsLastUpdate] = useState(0);
  const [deleteUserId, setDeleteUserId] = useState<string | boolean>("");
  const [deleteAdminsLoading, setDeleteAdminsLoading] = useState(false);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [displayedAdmins, setDisplayedAdmins] = useState<
    (string | ReactElement)[][]
  >([]);
  const admins = useAppSelector(selectAdmins);
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/members");
    }
  }, [user, completed]);

  console.log(selectedMembers);
  const handleDeleteSelected = async (selected: string[] | undefined) => {
    setActionLoading(true);
    if (selected) {
      await dispatch(deleteAdmins(selected));
      alert.success("Delete Successful");
    }
    setActionLoading(false);
  };

  const searchAdmin = useMemo(() => {
    return (search: string) => {
      const options = {
        keys: ["username", "email", "uid", "phoneNumber"],
      };
      const fuse = new Fuse(admins, options);
      if (search) {
        let sItems = fuse.search(search);
        console.log(sItems);
        return sItems.map((i) => i.item);
      }
    };
  }, [admins, search]);

  const handleEdit = (id: string) => {
    console.log(id);
    router.push(`/editMember/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteAdminsLoading(true);
    await dispatch(deleteAdmins([id]));
    setDeleteAdminsLoading(false);
    alert.success(`Delete Successful`);
    setDeleteUserId("");
    setSelectedMembers([]);
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
  console.log("last update ======> ", lastUpdateComplete);
  useEffect(() => {
    (async () => {
      setAdminsLoading(true);
      console.log(lastUpdateComplete);
      if (lastUpdateComplete) {
        await dispatch(getAdmins({ page, lastUpdate: adminsLastUpdate }));
        setAdminsLoading(false);
      }
    })();
  }, [lastUpdateComplete]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await getDoc(doc(collection(db, "appGlobals"), "global"));
      console.log(
        "customers count ===========> ",
        (res.data() as any).customersCount
      );
      const globals: any = res.data();
      setTotalAdmins((res.data() as any).adminsCount);
      setAdminsLastUpdate(globals.adminsLastUpdate?.nanoseconds || 0);
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    if (search) {
      let admins = searchAdmin(search);
      if (admins)
        setDisplayedAdmins(
          admins.map((admin) => [
            admin.uid,
            admin.username,
            admin.email,
            admin.phoneNumber,
            <AiOutlineCheckCircle
              color={`${admin.disabled ? "#333" : "green"}`}
            />,
          ])
        );
      return;
    }
    setDisplayedAdmins(
      admins.map((admin) => [
        admin.uid,
        admin.username,
        admin.email,
        admin.phoneNumber,
        <AiOutlineCheckCircle color={`${admin.disabled ? "#333" : "green"}`} />,
      ])
    );
  }, [admins, search]);

  const actions = useMemo(() => {
    if (user?.superadmin) {
      return [
        {
          id: "1",
          name: "Delete Selected",
          onGo: handleDeleteSelected,
        },
      ];
    }
  }, [user]);

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
          <title>Homiezfoods admin - Admin Members</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          {adminsLoading ? (
            <div
              className={`w-screen h-screen flex justify-center items-center`}
            >
              <AiOutlineLoading
                className={`text-2xl animate-spin`}
                color="black"
              />
            </div>
          ) : (
            <div className={`p-1 sm:p-5 md:p-7`}>
              <div className={`max-w-3xl mx-auto flex flex-col items-center`}>
                <h2 className={`font-bold text-xl mb-5`}>Admin Members</h2>
                <Table
                  hasSideAction
                  hasDelete={user.superadmin}
                  hasEdit={user.superadmin}
                  actions={actions}
                  title={
                    <div className={`flex justify-between`}>
                      <h3 className="text-md font-bold">
                        {search ? "Search" : "Total"} -{" "}
                        {search ? displayedAdmins.length : totalAdmins}
                      </h3>
                      <Link href="/addMember">
                        <button className="text-white bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 ">
                          Add New
                        </button>
                      </Link>
                    </div>
                  }
                  onEditPressed={handleEdit}
                  onDeletePressed={(id) => setDeleteUserId(id)}
                  actionLoading={actionLoading}
                  selected={selectedMembers}
                  setSelected={setSelectedMembers}
                  searchPlaceHolder="Search For Admin..."
                  search={search}
                  setSearch={setSearch}
                  titles={[
                    "id",
                    "Admin Name",
                    "Email",
                    "Phone Number",
                    "status",
                  ]}
                  data={displayedAdmins}
                />
              </div>
            </div>
          )}
        </main>
        <ConfirmModal
          onConfirm={() => handleDelete(deleteUserId.toString())}
          confirmText={`Are you sure you want to delete ${
            admins.find((u) => u.uid === deleteUserId)?.username
          }`}
          loading={deleteAdminsLoading}
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

export default members;
