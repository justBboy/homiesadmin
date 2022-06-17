import { onAuthStateChanged, Unsubscribe, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../../libs/Firebase";

export type savedUserType = {
  email: string | null;
  phone: string | null;
  username: string | null;
};
const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<savedUserType | null>(null);

  const onStateChanged = (user: User | null) => {
    console.log("user", user);
    if (user) {
      const u: savedUserType = {
        email: user.email,
        phone: user.phoneNumber,
        username: user.displayName,
      };
      setUser(u);
    } else setUser(user);
  };
  useEffect(() => {
    let unsubscribe: Unsubscribe;
    (async () => {
      unsubscribe = await onAuthStateChanged(auth, onStateChanged);
      setLoading(false);
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  console.log(loading, user);

  return { user, loading };
};

export default useFirebaseAuth;
