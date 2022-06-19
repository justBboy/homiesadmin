import axios from "../../libs/axios";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { auth, db } from "../../libs/Firebase";
import { memberFormItems } from "../../pages/addMember";
import { getIdToken } from "firebase/auth";

export const getAdminsApi = async (page: number) => {
  try {
    const q = query(collection(db, "admins"), limit(20));
    const matched = await getDocs(q);
    return matched.docs.map((d) => d.data());
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/*
export const editAdminApi = async (
  uid: string,
  data: { email: string; phoneNumber: string; username: string }
) => {
  try {
    const q = query(collection(db, "admins"), where("uid", "==", uid));
    const matched = await getDocs(q);
    for (const adm of matched.docs) {
      await updateDoc(adm.ref, data);
    }
    return { uid, data };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
*/
export const editAdminApi = async (
  uid: string,
  data: { email: string; phoneNumber: string; username: string }
) => {
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      const res = await axios.post("/auth/updateAdmin", {
        ...data,
        token,
        uid,
      });
      if (res.data.error) throw res.data.error;
      return { uid, data };
    }
    return null;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addAdminApi = async (data: memberFormItems) => {
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      const res = await axios.post("/auth/registerAdmin", {
        ...data,
        utoken: token,
      });
      if (res.data.error) throw res.data.error;
      return data;
    }
    return null;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteAdminsApi = async (uids: string[]) => {
  try {
    const res = await axios.post("/auth/deleteAdmins", uids);
    if (res.data.error) throw res.data.error;
    console.log(res.data);
    return uids;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
