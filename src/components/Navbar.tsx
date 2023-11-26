/** @format */

// /src/components/Navbar.tsx
import Link from "next/link";
import { auth, db } from "../firebaseConfig";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth"; // 確保這個導入是正確的
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, getDoc } from "firebase/firestore";
import {
  faUser,
  faHouse,
  faDoorOpen,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import {
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

// const Navbar = ({ currentUser }: { currentUser: User | null }) => {

const Navbar = ({ currentUser }: { currentUser: User | null }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username); // 假设用户名字段是 `username`
        }
      }
    };

    fetchUsername();
  }, [currentUser]);

  const profileLink = username ? `/profile/${username}` : "/login";

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
            <Link href="/concert">
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faMapLocationDot} />
              </div>{" "}
              {/* 會員中心連結 */}
            </Link>
            <Link href={profileLink}>
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faUser} />
              </div>
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
            <Link href="/concert">
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faMapLocationDot} />
              </div>{" "}
              {/* 會員中心連結 */}
            </Link>
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
