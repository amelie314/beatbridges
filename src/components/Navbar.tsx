/** @format */

// /src/components/Navbar.tsx
import Link from "next/link";
import { auth } from "../firebaseConfig";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth"; // 確保這個導入是正確的
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHouse, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import {
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ currentUser }: { currentUser: User | null }) => {
  // const Navbar = () => {
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
    <nav className="text-[15px] flex justify-between items-center p-3 bg-primary-color text-secondary-color border-b border-white">
      <Link href="/">
        <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
          <FontAwesomeIcon icon={faHouse} />
        </div>
      </Link>
      <div>
        {currentUser ? (
          <div className="flex items-center space-x-3">
            {" "}
            {/* 添加flex容器以對齊子元素 */}
            <Link href="/member-center">
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faUser} />
              </div>{" "}
              {/* 會員中心鏈接 */}
            </Link>
            <button
              onClick={handleLogout}
              className="hover:bg-show-color px-3 py-1 rounded font-bold"
            >
              <FontAwesomeIcon icon={faDoorOpen} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link href="/login">
              {" "}
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faRightToBracket} />
              </div>
            </Link>
            <Link href="/signup">
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
