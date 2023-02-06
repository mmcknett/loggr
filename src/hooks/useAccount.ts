import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { IFirebaseContext } from "../data/FirebaseContext";
import { IAccountData } from "../data/data-types";
import { checkedAccountPath } from "../data/paths";

export function useAccount(fBaseContext: IFirebaseContext) {
  const [account, setAccount] = useState<IAccountData>({});

  useEffect(() => {
    const accountsPath = checkedAccountPath(fBaseContext);
    const d = doc(fBaseContext.db, accountsPath);
    const unsub = onSnapshot(d, (accountDocRef) => {
      const account: IAccountData = accountDocRef.data() || {};
      setAccount(account);
    });
    return unsub;
  }, [fBaseContext]);

  return account;
}