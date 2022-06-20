import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../../libs/Firebase";
import { foodType } from "./foodsSlice";

export const getFoodsApi = async (page: number, lastUpdate: number) => {
  try {
    const q = query(collection(db, "foods"));
    const matched = await getDocs(q);
    const globalRes = await getDoc(doc(collection(db, "globals"), "foods"));
    const foodGlobals: any = globalRes.data();
    const data: any = matched.docs.map((d) => ({
      ...d.data(),
      orders: foodGlobals ? foodGlobals[`food${d.data().name}OrdersCount`] : 0,
      sales: foodGlobals ? foodGlobals[`food${d.data().name}Sales`] : 0,
    }));
    return { data, lastUpdate };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getFoodCategoriesApi = async (
  page: number,
  lastUpdate: number
) => {
  try {
    const q = query(collection(db, "foodCategories"));
    const matched = await getDocs(q);
    const globalRes = await getDoc(doc(collection(db, "globals"), "foods"));
    const foodGlobals: any = globalRes.data();
    const data: any = matched.docs.map((d) => ({
      ...d.data(),
      orders: foodGlobals ? foodGlobals[`food${d.data().name}OrdersCount`] : 0,
      sales: foodGlobals ? foodGlobals[`food${d.data().name}Sales`] : 0,
    }));
    return { data, lastUpdate };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addFoodCategoryApi = async (data: Partial<foodType>) => {
  try {
    await addDoc(collection(db, "foodCategories"), data);
    return { ...data, orders: 0, sales: 0, numFood: 0 };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const addFoodApi = async (data: Partial<foodType>) => {
  try {
    await addDoc(collection(db, "foods"), data);
    return { ...data, orders: 0, sales: 0 };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
