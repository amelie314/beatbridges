/** @format */

// /src/components/Navbar.tsx
import React, { useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faDoorOpen,
  faMapLocationDot,
  faUserPlus,
  faUser,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { auth } from "../firebaseConfig"; // 確保導入了 auth
import { useJoyride } from "../contexts/JoyrideContext"; // 導入 useJoyride
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const { currentUser, userInfo } = useUserContext();
  const { startJoyride, updateJoyrideSteps } = useJoyride();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const handleStartJoyride = () => {
    updateJoyrideSteps(!!currentUser); // 根據用戶是否登入來更新步驟
    startJoyride();
  };

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
        <div
          className="hover:bg-show-color px-3 py-1 rounded font-bold"
          title="Home"
        >
          <FontAwesomeIcon icon={faHouse} />
        </div>
      </Link>
      <div>
        {currentUser ? (
          <div className="flex items-center space-x-3">
            <Link href="/concert">
              <div
                className="map-step  hover:bg-show-color px-3 py-1 rounded font-bold"
                title="Map"
              >
                <FontAwesomeIcon icon={faMapLocationDot} />
              </div>
            </Link>
            <Link href={`/profile/${userInfo?.username || ""}`}>
              <div
                className="member-step hover:bg-show-color px-3 py-1 rounded font-bold"
                title="Member-Center"
              >
                <FontAwesomeIcon icon={faUser} />
              </div>
            </Link>
            <button
              onClick={handleStartJoyride}
              className="guide-step hover:bg-show-color px-3 py-1 rounded font-bold"
            >
              <FontAwesomeIcon icon={faCircleQuestion} />
            </button>
            <button
              onClick={handleLogout}
              className="logout-step hover:bg-show-color px-3 py-1 rounded font-bold"
              title="Logout"
            >
              <FontAwesomeIcon icon={faDoorOpen} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link href="/concert">
              <div
                className="map-step  hover:bg-show-color px-3 py-1 rounded font-bold"
                title="Map"
              >
                <FontAwesomeIcon icon={faMapLocationDot} />
              </div>
            </Link>
            <button
              onClick={() => setShowLoginModal(true)}
              className="login-step hover:bg-show-color px-3 py-1 rounded font-bold"
              title="Login"
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
            <button
              onClick={handleStartJoyride}
              className="guide-step hover:bg-show-color px-3 py-1 rounded font-bold"
            >
              <FontAwesomeIcon icon={faCircleQuestion} />
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
