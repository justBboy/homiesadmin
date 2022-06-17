import { signInWithEmailAndPassword } from "firebase/auth";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { GrFormNext } from "react-icons/gr";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { auth } from "../libs/Firebase";

export type loginFormError = {
  email: string | undefined;
  password: string | undefined;
};

export type loginForm = {
  email: string;
  password: string;
  errors: loginFormError | null;
};

const login: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<loginForm>({
    email: "",
    password: "",
    errors: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      setSubmitLoading(false);
    } catch (err) {
      console.log(err);
      if (typeof err === "object") {
        if (
          (err as any).code === "auth/wrong-password" ||
          (err as any).code === "auth/user-not-found"
        ) {
          setError("Your email or password is incorrect");
        } else setError("There was an error, please try again");
      }
      if (typeof err === "string")
        setError("There was an error, please try again");
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const next = router.query["next"]?.toString() || "/";
      router.push(next);
    }
  }, [user]);

  useEffect(() => {
    if (!emailRef.current?.checkValidity()) {
      emailRef.current?.reportValidity();
    }
  }, [form.email]);

  if (loading)
    return (
      <div className={`w-screen h-screen flex justify-center items-center`}>
        <AiOutlineLoading className={`text-2xl animate-spin`} color="black" />
      </div>
    );

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
              Login to your account
            </h2>
          </div>
          <div className={`flex flex-col w-full`}>
            <div className={`relative flex items-center`}>
              <div
                className={`w-[20%] bg-slate-600 h-full rounded-l p-2 my-2 flex items-center justify-center`}
              >
                <MdOutlineMail color="#ddd" />
              </div>
              <input
                type="email"
                placeholder="Your Email"
                ref={emailRef}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`p-2 outline-none border border-slate-200 my-2 w-[80%] h-full rounded-r`}
              />
            </div>
            <div className={`relative flex items-center`}>
              <div
                className={`w-[20%] bg-slate-600 h-full rounded-l p-2 my-2 flex items-center justify-center`}
              >
                <RiLockPasswordLine color="#ddd" />
              </div>
              <input
                type="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
};

export default login;
