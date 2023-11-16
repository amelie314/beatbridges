/** @format */

// /src/components/Navbar.tsx
import Link from "next/link";
import { auth } from "../firebaseConfig";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth"; // 確保這個導入是正確的

// const Navbar = () => {
const Navbar = ({ currentUser }: { currentUser: User | null }) => {
  // 明確指定 useState 的類型為 User | null
  // const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   // 這裡返回的用戶對象將匹配 useState 的類型註解
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user); // 現在 setUser 接受 User 類型或者 null
  //   });

  //   // 返回清理函數
  //   return unsubscribe;
  // }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // 登出成功後的處理，例如狀態更新或跳轉
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  return (
    <nav className="text-[15px] flex justify-between items-center p-4 bg-primary-color text-secondary-color border-b border-white">
      <Link href="/">
        <div className="font-bold">Home</div>
      </Link>
      <div>
        {currentUser ? (
          <button onClick={handleLogout}>Sign out</button>
        ) : (
          <div className="flex flexjustify-between">
            <Link href="/login">
              {" "}
              <div className="mr-4">Login</div>
            </Link>
            <Link href="/signup">
              <div>Sign up</div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
