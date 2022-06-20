import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
} from "firebase/firestore";
import { auth, db } from "../../libs/Firebase";
import axios from "../../libs/axios";
import { customerType } from "./customersSlice";
import { getIdToken } from "firebase/auth";
import { numInPage } from "../../pages/customers";

export const getCustomersApi = async (
  page: number,
  lastDoc: Document | null,
  lastUpdate: number
) => {
  try {
    if (!lastDoc || page <= 1) {
      const q = query(
        collection(db, "users"),
        orderBy("username"),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      const lastDoc = matched.docs[matched.docs.length - 1];
      return {
        data: matched.docs.map((d) => d.data()),
        lastDoc,
        lastUpdate,
        page,
      };
    } else {
      const q = query(
        collection(db, "users"),
        orderBy("username"),
        startAfter(lastDoc),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      return {
        data: matched.docs.map((d) => d.data()),
        page,
        lastUpdate,
        lastDoc: matched.docs[matched.docs.length - 1],
      };
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteCustomersApi = async (uids: string[]) => {
  try {
    const res = await axios.post("/auth/deleteCustomers", uids);
    if (res.data.error) throw res.data.error;
    console.log(res.data);
    return uids;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addCustomerApi = async (data: Partial<customerType>) => {
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      const res = await axios.post("/auth/adminAddCustomer", { token, data });
      if (res.data.error) throw res.data.error;
      return { ...data, uid: res.data.uid };
    }
    return null;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
