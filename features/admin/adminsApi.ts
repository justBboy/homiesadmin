import axios from "../../libs/axios";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../libs/Firebase";
import { memberFormItems } from "../../pages/addMember";
import { getIdToken, updateEmail, updateProfile } from "firebase/auth";

export const getAdminsApi = async (page: number, lastUpdate: number) => {
  try {
    const q = query(collection(db, "admins"));
    const matched = await getDocs(q);
    return { data: matched.docs.map((d) => d.data()), lastUpdate };
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
      if (auth.currentUser.uid !== uid) {
        const token = await getIdToken(auth.currentUser);
        const res = await axios.post("/auth/updateAdmin", {
          ...data,
          token,
          uid,
        });
        if (res.data.error) throw res.data.error;
      } else {
        if (
          `+233${data.phoneNumber.substring(1)}` !==
          auth.currentUser.phoneNumber
        ) {
          const token = await getIdToken(auth.currentUser);
          const res = await axios.post("/auth/changePhoneAdmin", {
            phoneNumber: data.phoneNumber,
            token,
          });
          if (res.data.error) throw res.data.error;
        }
        if (data.email !== auth.currentUser.email)
          await updateEmail(auth.currentUser, data.email);
        if (data.username !== auth.currentUser.displayName)
          await updateProfile(auth.currentUser, {
            displayName: data.username,
          });

        const q = query(collection(db, "admins"), where("uid", "==", uid));
        const matched = await getDocs(q);
        for (const adm of matched.docs) {
          await updateDoc(adm.ref, data);
        }
      }
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
