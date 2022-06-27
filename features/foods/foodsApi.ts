import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../../libs/Firebase";
import { v4 as uuidV4 } from "uuid";
import { foodCategoryType, foodType } from "./foodsSlice";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";

export const getFoodsApi = async (page: number, lastUpdate: number) => {
  try {
    const q = query(collection(db, "foods"));
    const matched = await getDocs(q);
    const data: any = matched.docs.map((d) => ({
      ...d.data(),
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
    console.log("matched =========> ", matched);
    //const globalRes = await getDoc(doc(collection(db, "appGlobals"), "foods"));
    //const foodGlobals: any = globalRes.data();
    const data: any = matched.docs.map((d) => ({
      ...d.data(),
    }));
    return { data, lastUpdate };
  } catch (err) {
    console.log("getting error =========> ", err);
    throw err;
  }
};

export const addFoodCategoryApi = async (data: Partial<foodCategoryType>) => {
  try {
    const id = uuidV4();
    const storageRef = ref(storage, `foodCategories/${data.name}`);
    if (data.imgURL && typeof data.imgURL === "string") {
      const imgUploaded = await uploadString(
        storageRef,
        data.imgURL,
        "data_url"
      );
      const url = await getDownloadURL(imgUploaded.ref);
      await addDoc(collection(db, "foodCategories"), {
        name: data.name,
        id,
        imgURL: url,
      });
      return { ...data, id, orders: 0, sales: 0, numFoods: 0 };
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const editFoodCategoryApi = async (
  id: string,
  data: Partial<foodCategoryType>
) => {
  try {
    let url = data.imgURL;
    console.log(url);
    if (data.imgURL && data.imgURL.toString().startsWith("data")) {
      console.log("changed");
      const storageRef = ref(storage, `foodCategories/${data.name}`);
      if (data.imgURL && typeof data.imgURL === "string") {
        const imgUploaded = await uploadString(
          storageRef,
          data.imgURL,
          "data_url"
        );
        url = await getDownloadURL(imgUploaded.ref);
      }
    }
    const q = query(collection(db, "foodCategories"), where("id", "==", id));
    const matches = await getDocs(q);
    for (const food of matches.docs)
      await updateDoc(food.ref, { ...data, imgURL: url });
    return { id, data };
  } catch (err) {
    console.log(err);
  }
};

export const editFoodApi = async (id: string, data: Partial<foodType>) => {
  try {
    let url = data.imgURL;
    if (data.imgURL && data.imgURL.toString().startsWith("data")) {
      const storageRef = ref(storage, `foods/${data.name}`);
      if (data.imgURL && typeof data.imgURL === "string") {
        const imgUploaded = await uploadString(
          storageRef,
          data.imgURL,
          "data_url"
        );
        url = await getDownloadURL(imgUploaded.ref);
      }
    }
    const q = query(collection(db, "foods"), where("id", "==", id));
    const matches = await getDocs(q);
    for (const food of matches.docs)
      await updateDoc(food.ref, { ...data, imgURL: url });
    return { id, data };
  } catch (err) {
    console.log(err);
  }
};

export const deleteFoodCategoriesApi = async (ids: string[]) => {
  try {
    for (const id of ids) {
      const q = query(collection(db, "foodCategories"), where("id", "==", id));
      const matches = await getDocs(q);
      for (const food of matches.docs) {
        try {
          const imgRef = await ref(
            storage,
            `foodCategories/${food.data().name}`
          );
          await deleteObject(imgRef);
        } catch (err) {
          console.log(err);
        }

        await deleteDoc(food.ref);
      }
    }
    return ids;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteFoodsApi = async (ids: string[]) => {
  try {
    for (const id of ids) {
      const q = query(collection(db, "foods"), where("id", "==", id));
      const matches = await getDocs(q);
      for (const food of matches.docs) {
        try {
          const imgRef = await ref(storage, `foods/${food.data().name}`);

          await deleteObject(imgRef);
        } catch (err) {
          console.log(err);
        }
        await deleteDoc(food.ref);
      }
      for (const food of matches.docs) {
        await deleteDoc(food.ref);
      }
    }
    return ids;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addFoodapi = async (data: Partial<foodType>) => {
  try {
    console.log(data);
    const id = uuidV4();
    const storageRef = ref(storage, `foods/${data.name}`);
    if (data.imgURL && typeof data.imgURL === "string") {
      const imgUploaded = await uploadString(
        storageRef,
        data.imgURL,
        "data_url"
      );
      const url = await getDownloadURL(imgUploaded.ref);
      try {
        const catmatches = await getDocs(
          query(
            collection(db, "foodCategories"),
            where("id", "==", data.category)
          )
        );
        const category = catmatches.docs[0];
        await addDoc(collection(db, "foods"), {
          name: data.name,
          price: data.price,
          category: {
            id: category.data().id,
            name: category.data().name,
          },
          id,
          imgURL: url,
        });
        return { ...data, id, orders: 0, sales: 0 };
      } catch (err) {
        console.log(err);
        throw "Invalid category";
      }
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const setFoodAvailableApi = async (id: string, available: boolean) => {
  try {
    const q = query(collection(db, "foods"), where("id", "==", id));
    const matches = await getDocs(q);
    for (const food of matches.docs)
      await updateDoc(food.ref, {
        available,
      });
    return { id, available };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
