import { onAuthStateChanged, Unsubscribe, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../../libs/Firebase";

export type savedUserType = {
  email: string | null;
  phone: string | null;
  username: string | null;
  admin?: boolean;
  superadmin?: boolean;
};
const useFirebaseAuth = () => {
  const [completed, setCompleted] = useState(false);
  const [user, setUser] = useState<savedUserType | null>(null);

  const onStateChanged = async (user: User | null) => {
    if (user) {
      const idTokenResult = await user.getIdTokenResult();
      const u: savedUserType = {
        email: user.email,
        phone: user.phoneNumber,
        username: user.displayName,
        admin: Boolean(idTokenResult.claims.admin),
        superadmin: Boolean(idTokenResult.claims.superadmin),
      };
      setUser(u);
      setCompleted(true);
    } else {
      setUser(user);
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

  return { user, completed };
};

export default useFirebaseAuth;
