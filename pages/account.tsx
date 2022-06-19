import { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AiOutlineInfoCircle,
  AiOutlineLoading,
  AiOutlineLogout,
} from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { selectSidebarStreched } from "../features/designManagement/designManagementSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import useMountTransition from "../features/hooks/useMountTransition";
import { auth } from "../libs/Firebase";
import { GrFormNext } from "react-icons/gr";
import ConfirmModal from "../components/ConfirmModal";
import { getIdToken, signOut } from "firebase/auth";
import axios from "../libs/axios";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import { editAdmin } from "../features/users/usersSlice";

export type accountFormErrors = {
  username: string | undefined;
  phoneNumber: string | undefined;
  email: string | undefined;
};

export type accountForm = {
  username: { v: string; active: boolean };
  phoneNumber: { v: string; active: boolean };
  email: { v: string; active: boolean };
  errors: accountFormErrors | null;
};

enum states {
  profile,
  passwords,
}

const account: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const sidebarStreched = useAppSelector(selectSidebarStreched);
  const [pState, setPState] = useState<states>(states.profile);
  const { user, completed } = useFirebaseAuth();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [changePLoading, setChangePLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<accountForm>({
    email: { v: "", active: false },
    phoneNumber: { v: "", active: false },
    username: { v: "", active: false },
    errors: null,
  });
  const [isChanged, setIsChanged] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: { active: form.username.active, v: user.username || "" },
        email: { active: form.email.active, v: user.email || "" },
        phoneNumber: { active: form.email.active, v: user.phone || "" },
        errors: form.errors,
      });
    }
  }, [user]);
  useEffect(() => {
    setIsChanged(
      form.email.v != user?.email ||
        form.phoneNumber.v != user?.phone ||
        form.username.v != user?.username
    );
  }, [form]);

  const handleFormChange = (key: string, v: string | number) => {
    setForm({ ...form, [key]: { ...(form as any)[key as string], v } });
  };

  const handleChangePword = useMemo(() => {
    return async () => {
      if (user && auth.currentUser) {
        try {
          setChangePLoading(true);
          const token = await getIdToken(auth.currentUser);
          const res = await axios.post("/auth/sendPasswordVerification", {
            token,
          });
          if (res.data.error) {
            setError(res.data.error);
            setChangePLoading(false);
            return;
          }
          alert.success("Email Sent");
        } catch (err) {
          console.log(err);
        }
        setChangePLoading(false);
      }
    };
  }, [user, auth.currentUser]);

  const handleLogout = async () => {
    setSubmitLoading(true);
    await signOut(auth);
    setSubmitLoading(false);
  };

  const handleUpdate = async () => {
    const data = {
      username: form.username.v,
      email: form.email.v,
      phoneNumber: form.phoneNumber.v.startsWith("+")
        ? "0" + form.phoneNumber.v.substring(4)
        : form.phoneNumber.v,
    };
    if (user?.uid) {
      setSubmitLoading(true);
      const res = await dispatch(editAdmin({ uid: user.uid.toString(), data }));
      if (res.meta.requestStatus === "rejected") {
        setError((res as any).error.message);
      } else {
        alert.success("Edit Successful");
        setTimeout(() => {
          router.back();
        }, 500);
      }
      setTimeout(() => {
        setSubmitLoading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (completed && !user) {
      router.push("/login?next=/account");
    }
  }, [user, completed]);

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);

  return (
    <div>
      <Head>
        <title>Account</title>
      </Head>
      <Sidebar />
      <main
        className={` ${
          sidebarStreched ? "ml-[270px]" : "ml-[60px]"
        } w-[calc(100% - ${sidebarStreched ? "270px" : "60px"})]`}
      >
        <div className={`w-full sm:p-10 p-5`}>
          <div
            className={`w-full shadow p-3 flex justify-between items-center`}
          >
            <h2 className={`font-bold text-md`}>Your Profile</h2>
            <button
              onClick={() => setShowConfirm(true)}
              title="Logout"
              className={`w-[35px] h-[35px] bg-red-600 hover:bg-red-700 rounded-[50%] shadow flex justify-center items-center`}
            >
              <AiOutlineLogout color="#eee" className="text-xl" />
            </button>
          </div>
          <div className={`w-full flex min-h-[60vh]`}>
            <div className={`w-[20%] flex flex-col border-r min-h-[60vh]`}>
              <div
                onClick={() => {
                  setPState(states.profile);
                }}
                className={`sm:font-md font-sm text-sm sm:text-md ${
                  pState === states.profile ? "bg-slate-200" : ""
                } cursor-pointer p-3 flex items-center hover:bg-slate-200 border-b border-slate-100`}
              >
                <AiOutlineInfoCircle
                  color="#222"
                  className={`text-2xl sm:text-lg mr-1`}
                />
                <span className={`hidden sm:inline`}>Info</span>
              </div>
              <div
                onClick={() => {
                  setPState(states.passwords);
                }}
                className={`sm:font-md font-sm text-sm sm:text-md ${
                  pState === states.passwords ? "bg-slate-200" : ""
                } cursor-pointer p-3 flex items-center hover:bg-slate-200 border-b border-slate-100`}
              >
                <RiLockPasswordLine
                  color="#222"
                  className={`text-2xl sm:text-lg mr-1`}
                />
                <span className={`hidden sm:inline`}>Password</span>
              </div>
            </div>
            <div className={`w-[80%]`}>
              {pState === states.profile ? (
                <div className={`animate__animated animate__fadeIn`}>
                  <div
                    className={`flex flex-col w-full items-center pt-2 sm:p-3`}
                  >
                    <h2 className={`font-bold text-md`}>Profile Info</h2>
                    <div className="relative">
                      <label
                        htmlFor="username"
                        className={`ml-3 mt-2 font-sm text-sm text-slate-700`}
                      >
                        Your Name:
                      </label>
                      <input
                        readOnly={!form.username.active}
                        value={form.username.v}
                        onChange={(e) =>
                          handleFormChange("username", e.target.value)
                        }
                        type="text"
                        className={`outline-none ${
                          form.username.active
                            ? "opacity-100 text-slate-900"
                            : "opacity-70 text-slate-600"
                        } border border-slate-300 p-3 w-full relative z-1 mx-3 mb-3 max-w-[380px] rounded-md`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            username: {
                              ...form.username,
                              active: !form.username.active,
                            },
                          });
                        }}
                        className="absolute top-[50%] right-2 translate-y-[-50%] z-5 mt-1 cursor-pointer"
                      >
                        <FiEdit2
                          className={`text-xl hover:text-black`}
                          color="#555"
                        />
                      </button>
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className={`ml-3 mt-2 font-sm text-sm text-slate-700`}
                      >
                        Your Email:
                      </label>
                      <input
                        readOnly={!form.email.active}
                        value={form.email.v}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                        type="email"
                        className={`outline-none ${
                          form.email.active
                            ? "opacity-100 text-slate-900"
                            : "opacity-70 text-slate-600"
                        } border border-slate-300 p-3 w-full relative z-1 mx-3 mb-3 max-w-[380px] rounded-md`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            email: {
                              ...form.email,
                              active: !form.email.active,
                            },
                          });
                        }}
                        className="absolute top-[50%] right-2 translate-y-[-50%] z-5 mt-1 cursor-pointer"
                      >
                        <FiEdit2
                          className={`text-xl hover:text-black`}
                          color="#555"
                        />
                      </button>
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className={`ml-3 mt-2 font-sm text-sm text-slate-700`}
                      >
                        Your Phone:
                      </label>
                      <input
                        readOnly={!form.phoneNumber.active}
                        value={`${
                          form.phoneNumber.v.startsWith("+")
                            ? "0" + form.phoneNumber.v.substring(4)
                            : form.phoneNumber.v
                        }`}
                        onChange={(e) =>
                          handleFormChange("phoneNumber", e.target.value)
                        }
                        type="tel"
                        className={`outline-none ${
                          form.phoneNumber.active
                            ? "opacity-100 text-slate-900"
                            : "opacity-70 text-slate-600"
                        } border border-slate-300 p-3 w-full relative z-1 mx-3 mb-3 max-w-[380px] rounded-md`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            phoneNumber: {
                              ...form.phoneNumber,
                              active: !form.phoneNumber.active,
                            },
                          });
                        }}
                        className="absolute top-[50%] right-2 translate-y-[-50%] z-5 mt-1 cursor-pointer"
                      >
                        <FiEdit2
                          className={`text-xl hover:text-black`}
                          color="#555"
                        />
                      </button>
                    </div>
                    <button
                      onClick={handleUpdate}
                      disabled={submitLoading || !isChanged}
                      className={`${
                        isChanged || submitLoading
                          ? "opacity-100"
                          : "opacity-60"
                      } flex cursor-pointer items-center justify-center p-3 w-full max-w-[380px] bg-yellow-600 hover:bg-yellow-700 text-slate-100 rounded-md shadow-md`}
                    >
                      {submitLoading ? (
                        <AiOutlineLoading
                          className="text-xl animate-spin"
                          color="#fff"
                        />
                      ) : (
                        <>
                          <span className={`mx-auto`}>update</span>
                          <span className={`ml-auto`}>
                            <GrFormNext
                              className={`text-slate-100 text-xl bg-slate-100 rounded`}
                            />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                pState === states.passwords && (
                  <div className={`animate__animated animate__fadeIn`}>
                    <div
                      className={`flex flex-col w-full items-center pt-2 sm:p-3`}
                    >
                      <h2 className={`font-bold text-md`}>Change Password</h2>
                      <div className={`mt-5`}>
                        <button
                          onClick={handleChangePword}
                          disabled={changePLoading}
                          className={`${
                            changePLoading
                              ? "opacity-60 cursor-not-allowed "
                              : "opacity-100 cursor-pointer hover:bg-blue-700 "
                          } flex  items-center justify-center p-3 w-full max-w-[380px] bg-blue-600 text-slate-100 rounded-md shadow-md`}
                        >
                          {changePLoading ? (
                            <>
                              <AiOutlineLoading
                                className="text-xl animate-spin"
                                color="#fff"
                              />
                              <span className={`mx-auto mr-2 opacity-0`}>
                                Click to Send Verification Link
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={`mx-auto mr-2`}>
                                Click to Send Verification Link
                              </span>
                              <span className={`ml-auto`}>
                                <GrFormNext
                                  className={`text-slate-100 text-xl bg-slate-100 rounded`}
                                />
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
      <ConfirmModal
        onConfirm={handleLogout}
        confirmText="Are you sure you want to logout From your account?"
        loading={submitLoading}
        setShow={setShowConfirm}
        show={showConfirm}
      />
    </div>
  );
};

export default account;
