import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { GiConfirmed } from "react-icons/gi";
import { GrFormNext } from "react-icons/gr";
import { RiLockPasswordLine } from "react-icons/ri";
import {
  getUserWithEmailToken,
  selectEmailedUser,
  setPassword,
} from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import { validatePassword } from "../../features/validators";
import { useAlert } from "react-alert";

export type changePasswordFormError = {
  password: string | undefined;
  confirmPassword: string | undefined;
};

export type changePasswordForm = {
  password: string;
  confirmPassword: string;
  errors: changePasswordFormError | null;
};
const changePassword = () => {
  const { user: authUser, completed: isLoggedInLoadingComplete } =
    useFirebaseAuth();
  const [form, setForm] = useState<changePasswordForm>({
    password: "",
    confirmPassword: "",
    errors: null,
  });
  const router = useRouter();
  const alert = useAlert();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectEmailedUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { id } = router.query;

  useEffect(() => {
    (async () => {
      if (id && !user) {
        const res = await dispatch(getUserWithEmailToken(id.toString()));
        if (res.meta.requestStatus === "rejected")
          setError((res as any).error.message);
        setLoading(false);
        setCompleted(true);
      }
    })();
  }, [id, user]);

  useEffect(() => {
    const isValidPassword = validatePassword(form.password);
    console.log(isValidPassword);
    if (!isValidPassword) {
      passwordRef.current?.setCustomValidity(
        "Your password must have Minimum eight characters, at least one letter and one number"
      );
    } else passwordRef.current?.setCustomValidity("");

    if (passwordRef.current?.checkValidity() == false) {
      passwordRef.current?.reportValidity();
    }
  }, [form.password]);

  useEffect(() => {
    console.log(form.confirmPassword === form.password);
    if (form.confirmPassword !== form.password) {
      confirmPasswordRef.current?.setCustomValidity("Passwords do not match");
    } else {
      confirmPasswordRef.current?.setCustomValidity("");
    }
    confirmPasswordRef.current?.reportValidity();
  }, [form.confirmPassword]);

  const handleSubmit = async () => {
    if (id) {
      setSubmitLoading(true);
      const res = await dispatch(
        setPassword({ password: form.password, token: id.toString() })
      );
      if (res.meta.requestStatus === "rejected")
        setError((res as any).error.message);
      alert.success("Password changed successful");
      setSubmitLoading(false);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error]);

  if (!isLoggedInLoadingComplete || loading)
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );

  if (completed && !user) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center`}>
        <p>
          Please You are with an invalid token, contact administration if you
          are an admin
        </p>
      </div>
    );
  }

  return (
    <div>
      <main
        style={{
          background:
            "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
        }}
        className={`flex flex-col justify-center items-center min-h-screen w-screen relative`}
      >
        <div className={``}>
          <Image
            src={`/images/hmzs-min.png`}
            width={180}
            height={60}
            alt="Homies logo"
          />
        </div>
        <div
          className={`mt-10 mb-5 p-5 sm:min-w-[400px] min-h-[200px] shadow-lg relative z-5 bg-white`}
        >
          {error && <p className="text-md text-red-500">{error}</p>}
          <div>
            <h2 className={`font-bold text-slate-900`}>Hi, {user?.username}</h2>
            <p className={`text-sm text-slate-300`}>
              Change Password and login to your account
            </p>
          </div>
          <div className={`flex flex-col w-full`}>
            <div className={`relative flex items-center`}>
              <div
                className={`w-[20%] bg-slate-600 h-full rounded-l p-2 my-2 flex items-center justify-center`}
              >
                <RiLockPasswordLine color="#ddd" />
              </div>
              <input
                type="password"
                placeholder="Enter Password"
                ref={passwordRef}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`p-2 outline-none border border-slate-200 my-2 w-[80%] h-full rounded-r`}
              />
            </div>
            <div className={`relative flex items-center`}>
              <div
                className={`w-[20%] bg-slate-600 h-full rounded-l p-2 my-2 flex items-center justify-center`}
              >
                <GiConfirmed color="#ddd" />
              </div>
              <input
                type="password"
                placeholder="Confirm New Password"
                ref={confirmPasswordRef}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={`p-2 outline-none border border-slate-200 my-2 w-[80%] h-full rounded-r`}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitLoading}
              className={`flex items-center justify-center w-full p-2 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
            >
              {submitLoading ? (
                <AiOutlineLoading
                  className="text-xl animate-spin"
                  color="#fff"
                />
              ) : (
                <>
                  <span className={`mx-auto`}>Change Password</span>
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
      </main>
    </div>
  );
};

export default changePassword;
