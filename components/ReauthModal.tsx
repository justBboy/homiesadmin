import {
  EmailAuthCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { GrFormNext } from "react-icons/gr";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { auth } from "../libs/Firebase";
import { loginForm } from "../pages/login";
import CenterModal from "./CenterModal";

interface props {
  show?: boolean;
  setShow: (v: boolean) => void;
}

const ReauthModal: React.FC<props> = ({ show, setShow }) => {
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<loginForm>({
    email: "",
    password: "",
    errors: null,
  });

  useEffect(() => {
    if (!emailRef.current?.checkValidity()) {
      emailRef.current?.reportValidity();
    }
  }, [form.email]);
  const handleSubmit = async () => {
    try {
      if (auth.currentUser) {
        setSubmitLoading(true);
        const credential = EmailAuthProvider.credential(
          form.email,
          form.password
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        setShow(false);
      }
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
  return (
    <CenterModal show={show}>
      <div
        className={`mt-10 mb-5 p-5 sm:min-w-[400px] min-h-[200px] shadow-lg relative z-5 bg-white`}
      >
        {error && <p className="text-md text-red-500">{error}</p>}
        <div>
          <h2 className={`font-bold text-slate-900`}>Login to your account</h2>
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
              <AiOutlineLoading className="text-xl animate-spin" color="#fff" />
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
    </CenterModal>
  );
};

export default ReauthModal;
