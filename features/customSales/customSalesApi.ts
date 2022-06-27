import {
  addDoc,
  collection,
  deleteDoc,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  startAt,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../libs/Firebase";
import { v4 as uuidV4 } from "uuid";
import { numInPage } from "../../pages/customers";

export type orderType = {
  id: string;
  totalPrice: number;
  items: {
    id: string;
    itemCategory: string;
    price: number;
    quantity: number;
  }[];
  createdAt?: {
    nanoseconds: number;
    seconds: number;
  };
  csale?: boolean;
};

export const getCustomSalesApi = async (
  page: number,
  lastDoc: Document | null,
  lastUpdate: number
) => {
  try {
    if (!lastDoc || page <= 1) {
      const q = query(
        collection(db, "orders"),
        where("csale", "==", true),
        orderBy("createdAt"),
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
        collection(db, "orders"),
        where("csale", "==", true),
        orderBy("createdAt"),
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

export const deleteCustomSalesApi = async (ids: string[]) => {
  try {
    for (const id of ids) {
      const q = query(collection(db, "orders"), where("id", "==", id));
      const matches = await getDocs(q);
      for (const order of matches.docs) await deleteDoc(order.ref);
    }
    return ids;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addCustomSaleApi = async (data: any) => {
  try {
    const id = uuidV4();
    await addDoc(collection(db, "orders"), {
      id,
      csale: true,
      createdAt: serverTimestamp(),
      ...data,
    });
    return { ...data, id };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const editCustomSaleApi = async (
  data: Partial<orderType>,
  id: string
) => {
  try {
    console.log(id);
    const q = query(collection(db, "orders"), where("id", "==", id));
    const matches = await getDocs(q);
    for (const order of matches.docs) await updateDoc(order.ref, data);
    return { data, id };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
