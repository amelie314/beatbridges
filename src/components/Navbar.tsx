/** @format */

// /src/components/Navbar.tsx
import Link from "next/link";
import { auth, db } from "../firebaseConfig";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router"; // 導入 useRouter
import {
  faHouse,
  faDoorOpen,
  faMapLocationDot,
  faUserPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from "firebase/firestore";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";

const Navbar = ({ currentUser }: { currentUser: User | null }) => {
  const [username, setUsername] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchUsername = async () => {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      };
      fetchUsername();
    } else {
      setUsername(""); // 当没有用户登录时重置用户名
    }
  }, [currentUser, currentUser?.uid]); // 添加 currentUser?.uid 作为依赖

  const router = useRouter(); // 使用 useRouter 鉤子
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/"); // 使用 router.push 來跳轉路由
    } catch (error) {
      console.error("Logout failed:", error);
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
            <Link href="/concert">
              <div className="hover:bg-show-color px-3 py-1 rounded font-bold">
                <FontAwesomeIcon icon={faMapLocationDot} />
              </div>
            </Link>
            <Link href={`/profile/${username}`}>
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
              </div>
            </Link>

            <button
              onClick={() => setShowLoginModal(true)}
              className="hover:bg-show-color px-3 py-1 rounded font-bold"
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
          </div>
        )}
      </div>
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onShowSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        show={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </nav>
  );
};

export default Navbar;
