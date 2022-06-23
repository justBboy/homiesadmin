import { NextPage } from "next";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { RiLockPasswordLine } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";
import { GrFormNext } from "react-icons/gr";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import {
  getUserWithEmailToken,
  selectEmailedUser,
  setPassword,
} from "../../features/auth/authSlice";
import { AiOutlineLoading } from "react-icons/ai";
import { validatePassword } from "../../features/validators";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";

export type registerFormError = {
  password: string | undefined;
  confirmPassword: string | undefined;
};

export type registerForm = {
  password: string;
  confirmPassword: string;
  errors: registerFormError | null;
};

const Register: NextPage = () => {
  const { user: authUser, completed: isLoggedInLoadingComplete } =
    useFirebaseAuth();
  const [form, setForm] = useState<registerForm>({
    password: "",
    confirmPassword: "",
    errors: null,
  });
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectEmailedUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { token } = router.query;

  useEffect(() => {
    (async () => {
      if (token && !user) {
        const res = await dispatch(getUserWithEmailToken(token.toString()));
        if (res.meta.requestStatus === "rejected")
          setError((res as any).error.message);
        setLoading(false);
        setCompleted(true);
      }
    })();
  }, [token, user]);

  console.log("loading ========> ", loading);

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

  useEffect(() => {
    if (user && !user.disabled) {
      router.push("/login");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (token) {
      setSubmitLoading(true);
      const res = await dispatch(
        setPassword({ password: form.password, token: token.toString() })
      );
      if (res.meta.requestStatus === "rejected")
        setError((res as any).error.message);
      setSubmitLoading(false);
    }
  };

  console.log("error =========> ", error);
  if (loading) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center`}>
        <AiOutlineLoading className="text-3xl animate-spin" color="black" />
      </div>
    );
  }

  if (!isLoggedInLoadingComplete)
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

  if (user && user.disabled) {
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
              <h2 className={`font-bold text-slate-900`}>
                Hi, {user.username}
              </h2>
              <p className={`text-sm text-slate-300`}>
                Set a Password to login to your account
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
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
                  placeholder="Confirm Password"
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
                    <span className={`mx-auto`}>Submit</span>
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
  }
  return (
    <div className={`w-screen h-screen flex justify-center items-center`}>
      <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
    </div>
  );
};

export default Register;
