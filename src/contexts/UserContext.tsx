/** @format */

// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig"; // 導入 db
import { doc, getDoc } from "firebase/firestore"; // 導入 Firestore 的函數
import { User } from "firebase/auth";

// 定義額外的用戶資料類型
interface UserInfo {
  username?: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // 從 Firestore 獲取用戶資訊
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data() as UserInfo);
        } else {
          setUserInfo(null);
        }
      } else {
        setUserInfo(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, userInfo, setUserInfo }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
