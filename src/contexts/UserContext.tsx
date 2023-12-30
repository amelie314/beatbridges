/** @format */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";

export interface UserInfo {
  username?: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

// 定義額外的用戶資料類型
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  isLoadingUserInfo: boolean; // 新增狀態
  setIsLoadingUserInfo: React.Dispatch<React.SetStateAction<boolean>>; // 允許修改狀態的函數
}

// 定義 UserProviderProps 來包含 children
interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 使用 UserProviderProps 作為 UserProvider 的 prop 類型
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setIsLoadingUserInfo(true);
      if (user) {
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
      setIsLoadingUserInfo(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userInfo,
        setUserInfo,
        isLoadingUserInfo,
        setIsLoadingUserInfo,
      }}
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
