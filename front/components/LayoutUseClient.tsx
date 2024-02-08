"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { AccountType, AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "./Header";

const LayoutUseClient = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AccountType | null>(null);

  const changeCurrentUser = useCallback(
    (data: AccountType) => {
      setCurrentUser(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
    },
    [currentUser]
  );

  const handleLogOut = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    router.push("/auth");
  }, []);

  const contextValue = {
    currentUser,
    changeCurrentUser,
  };

  useEffect(() => {
    if (typeof window != "undefined") {
      const currentUserInStorage = localStorage.getItem("currentUser");
      if (currentUserInStorage) {
        setCurrentUser(JSON.parse(currentUserInStorage));
        router.push("/");
      } else {
        router.push("/auth");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>
      <div className="p-12">
        <Header
          username={currentUser?.username}
          address={currentUser?.address}
          onLogoutClicked={handleLogOut}
        />

        {children}
      </div>
    </AuthContext.Provider>
  );
};

export default LayoutUseClient;
