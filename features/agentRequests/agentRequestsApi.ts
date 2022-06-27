import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../libs/Firebase";

const numInPage = 20;
export const getAgentRequestsApi = async (
  page: number,
  lastDoc: Document | null,
  lastUpdate: number
) => {
  try {
    if (!lastDoc || page <= 1) {
      const q = query(
        collection(db, "agentRequests"),
        orderBy("createdAt"),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      console.log(matched);
      const lastDoc = matched.docs[matched.docs.length - 1];
      return {
        data: matched.docs.map((d) => d.data()),
        lastDoc,
        lastUpdate,
        page,
      };
    } else {
      const q = query(
        collection(db, "agentRequests"),
        orderBy("createdAt"),
        startAfter(lastDoc),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      console.log(matched);
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

export const deleteAgentRequestsApi = async (ids: string[]) => {
  console.log(ids);
  try {
    for (const id of ids) {
      const q = query(collection(db, "agentRequests"), where("uid", "==", id));
      const matches = await getDocs(q);
      for (const req of matches.docs) await deleteDoc(req.ref);
    }
    return ids;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const setAgentRequestsAsViewedApi = async (uids: string[]) => {
  try {
    for (const uid of uids) {
      const q = query(collection(db, "agentRequests"), where("uid", "==", uid));
      const matches = await getDocs(q);
      for (const req of matches.docs)
        await updateDoc(req.ref, {
          viewed: true,
        });
    }
    return uids;
  } catch (err) {
    console.log("set agents as viewed error ============> ", err);
    throw err;
  }
};
