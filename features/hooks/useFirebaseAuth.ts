import { onAuthStateChanged, Unsubscribe, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../libs/Firebase";

export type savedUserType = {
  uid: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  admin?: boolean;
  superadmin?: boolean;
};
const useFirebaseAuth = (
  setShowReauth: ((v: boolean) => void) | null = null
) => {
  const [completed, setCompleted] = useState(false);
  const [savedUser, setSavedUser] = useState<savedUserType | null>(null);

  const onStateChanged = async (user: User | null) => {
    if (user) {
      if (user.uid === savedUser?.uid) {
        if (setShowReauth) {
          setShowReauth(true);
        }
      }
      const idTokenResult = await user.getIdTokenResult();
      const u: savedUserType = {
        uid: user.uid,
        email: user.email,
        phone: user.phoneNumber,
        username: user.displayName,
        admin: Boolean(idTokenResult.claims.admin),
        superadmin: Boolean(idTokenResult.claims.superadmin),
      };
      setSavedUser(u);
      setCompleted(true);
    } else {
      setSavedUser(user);
      setCompleted(true);
    }
  };
  useEffect(() => {
    let unsubscribe: Unsubscribe;
    (async () => {
      unsubscribe = await onAuthStateChanged(auth, onStateChanged);
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { user: savedUser, completed };
};

export default useFirebaseAuth;
