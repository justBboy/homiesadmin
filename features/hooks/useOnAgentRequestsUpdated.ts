import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../../libs/Firebase";
import {
  addAgentRequests,
  requestType,
  selectAllAgentRequests,
  selectNewAgentRequestsCount,
  setNewRequestsCount,
} from "../agentRequests/agentRequestsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export const useOnAgentRequestUpdated = () => {
  const dispatch = useAppDispatch();
  const newRequestsCount = useAppSelector(selectNewAgentRequestsCount);
  const agentRequests = useAppSelector(selectAllAgentRequests);
  const audioRef = useRef(new Audio("/sounds/new-request-alert.mp3"));

  const onSnap = useCallback(() => {
    const q = query(
      collection(db, "agentRequests"),
      where("viewed", "==", false)
    );
    return onSnapshot(q, (snap) => {
      const dChanges = snap.docChanges();
      console.log("d changes ==================> ", dChanges);
      const newDocs: requestType[] = [];
      for (const newRequest of dChanges) {
        if (newRequest.type === "added") {
          agentRequests.every((r) => {
            const rdata = r.data.findIndex(
              (rd) => rd.uid === newRequest.doc.data().uid
            );
            if (rdata === -1) {
              newDocs.push(newRequest.doc.data() as requestType);
              return false;
            }
            return true;
          });
        }
      }
      console.log("==================> ", newDocs);
      if (newDocs.length) audioRef.current.play();
      dispatch(setNewRequestsCount(newDocs.length + newRequestsCount));
      dispatch(addAgentRequests(newDocs));
    });
  }, []);
  useEffect(() => {
    const unsubscribe = onSnap();
    return () => {
      unsubscribe();
    };
  }, [onSnap]);

  return { agentRequests, newRequestsCount };
};
