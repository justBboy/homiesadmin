import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Sidebar from "../../components/Sidebar";
import { selectSidebarStreched } from "../../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { selectAdminWithId, editAdmin } from "../../features/users/usersSlice";
import { useAlert } from "react-alert";

export type memberFormError = {
  adminName: string | undefined;
  email: string | undefined;
  phoneNumber: string | undefined;
};

export type memberForm = {
  name: string;
  email: string;
  phoneNumber: string;
  errors: memberFormError | null;
};
const editMembers = () => {
  const router = useRouter();
  const alert = useAlert();
  const { id } = router.query;
  const admin = useAppSelector(selectAdminWithId(id as string));
  const dispatch = useAppDispatch();
  const [editLoading, setEditLoading] = useState(false);

  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const { user, completed } = useFirebaseAuth();
  const [error, setError] = useState("");
  const [form, setForm] = useState<memberForm>({
    name: admin ? admin.username : "",
    email: admin ? admin.email : "",
    phoneNumber: admin
      ? `${
          admin.phoneNumber.startsWith("+")
            ? "0" + admin.phoneNumber.substring(4)
            : admin.phoneNumber
        }`
      : "",
    errors: null,
  });

  useEffect(() => {
    if (completed && !user) {
      router.push(`/login?next=/editMember/${id}`);
    }
  }, [user, completed]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);

  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  const handleEditAdmin = async () => {
    const data = {
      username: form.name,
      email: form.email,
      phoneNumber: form.phoneNumber,
    };
    if (id) {
      setEditLoading(true);
      const res = await dispatch(editAdmin({ uid: id.toString(), data }));
      if (res.meta.requestStatus === "rejected")
        setError((res as any).error.message);
      alert.success("Edit Successful");
      router.back();
      setEditLoading(false);
    }
  };

  if (!completed && !user) {
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );
  }

  if (completed && !admin) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p className={`font-md text-md`}>
          Search user on
          <Link href="/members">
            <a className="font-bold text-blue-600"> Dashboard</a>
          </Link>
        </p>
      </div>
    );
  }

  if (completed && user && admin) {
    return (
      <div>
        <Head>
          <title>Edit Admin Member</title>
        </Head>
        <Sidebar />
        <main
          className={`${
            sidebarStreched ? "ml-[270px]" : "ml-[60px]"
          } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
        >
          <div className={`sm:p-5 md:p-10`}>
            <section
              className={`antialiased bg-gray-100 text-gray-600 h-screen p-1 sm:px-4`}
            >
              <div
                className={`m-auto justify-center mt-10 h-full flex flex-col items-center animate__animated animate__fadeIn`}
              >
                <h2 className={`font-bold text-2xl mb-5 capitalize`}>
                  Edit Admin Member - {admin.username.split(" ")[0]}
                </h2>
                <div className={`flex items-center w-full`}>
                  <div className="flex flex-col w-[100%] sm:w-[70%] mx-auto items-center">
                    <input
                      type="text"
                      className="p-2 outline-none border border-slate-200 my-2 w-[80%]"
                      value={form.name}
                      onChange={(e) => {
                        handleFormChange("name", e.target.value);
                      }}
                      placeholder="Food Name"
                    />
                    <input
                      type="email"
                      className="p-2 outline-none border border-slate-200 w-[80%] my-2"
                      value={form.email}
                      onChange={(e) => {
                        handleFormChange("email", e.target.value);
                      }}
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      className="p-2 outline-none border border-slate-200 w-[80%]"
                      value={form.phoneNumber}
                      onChange={(e) => {
                        handleFormChange("phoneNumber", e.target.value);
                      }}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                <button
                  onClick={handleEditAdmin}
                  disabled={editLoading}
                  className={`flex items-center ${
                    editLoading ? "opacity-70" : "opacity-100"
                  } justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md mt-3`}
                >
                  {editLoading ? (
                    <AiOutlineLoading
                      className={`text-2xl animate-spin`}
                      color="black"
                    />
                  ) : (
                    "Edit"
                  )}
                </button>
              </div>
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

export default editMembers;
