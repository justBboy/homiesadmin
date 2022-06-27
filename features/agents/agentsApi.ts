import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { auth, db } from "../../libs/Firebase";
import axios from "../../libs/axios";
import { getIdToken } from "firebase/auth";

const numInPage = 20;
export const getAgentsApi = async (
  page: number,
  lastDoc: Document | null,
  lastUpdate: number
) => {
  try {
    if (!lastDoc || page <= 1) {
      const q = query(
        collection(db, "agents"),
        orderBy("createdAt"),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      console.log("matched ================> ", matched);
      const lastDoc = matched.docs[matched.docs.length - 1];
      return {
        data: matched.docs.map((d) => d.data()),
        lastDoc,
        lastUpdate,
        page,
      };
    } else {
      const q = query(
        collection(db, "agents"),
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

export const deleteAgentsApi = async (ids: string[]) => {
  console.log("ids =======> ", ids);
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      const res = await axios.post("/customers/deleteAgents", {
        token,
        uids: ids,
      });
      if (res.data.error) throw res.data.err;
      return ids;
    }
    return [];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// export const addAgentApi = async (data: any) => {
//   try {
//     if (auth.currentUser){
//         const id = uuidv4();
//         await addDoc(collection(db, "agents"), {
//             ...data,
//             id
//         })
//         return {...data, id}
//     }

//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };
