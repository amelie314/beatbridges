/** @format */

// /src/components/LoginModal.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  doc,
  setDoc,
  collection,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useUserContext, UserInfo } from "../contexts/UserContext";
interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onShowSignup: () => void; // 新增一個函數來處理顯示註冊Modal的邏輯
}

const LoginModal: React.FC<LoginModalProps> = ({
  show,
  onClose,
  onShowSignup,
}) => {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demoPassword");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();
  const {
    setUserInfo, // 從 UserContext 獲取 setUserInfo 函數
    setIsLoadingUserInfo, // 從 UserContext 獲取 setIsLoadingUserInfo 函數
  } = useUserContext();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError(""); // Reset error message before attempting to log in

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // If the login is successful, close the modal and redirect
      setEmail("demo@example.com");
      setPassword("demoPassword");
      onClose(); // Close the modal before redirecting
      router.push("/map"); // Redirect to the map page
    } catch (error) {
      console.error("Login process error:", error);
      // Set a user-friendly error message
      setLoginError("Invalid login credentials, please try again.");
    }
  };
  // const handleGoogleLogin = async () => {
  //   const provider = new GoogleAuthProvider();
  //   try {
  //     await signInWithPopup(auth, provider);
  //     // 如果 Google 登入成功，關閉 Modal 並重定向
  //     onClose(); // 關閉 Modal
  //     router.push("/map"); // 重定向到地圖頁面
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     setLoginError("An error occurred with Google login, please try again.");
  //   }
  // };
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoadingUserInfo(true); // 開始加載用戶信息
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 定義 Firestore 中的 users 集合引用
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      let userInfoData;

      // 如果沒有用戶資料，則創建新的用戶資料
      if (querySnapshot.empty) {
        userInfoData = {
          username: `user_${user.uid.substring(0, 5)}`, // 創建一個簡單的用戶名
          bio: "",
          photoURL: user.photoURL || "/default-profile.png",
          displayName: user.displayName || user.email,
          uid: user.uid,
        };

        // 寫入新用戶資料到 Firestore
        await setDoc(doc(db, "users", user.uid), userInfoData);
        console.log("New user created with Google login.");
      } else {
        // 如果用戶已存在，從 Firestore 獲取最新的用戶信息
        userInfoData = querySnapshot.docs[0].data() as UserInfo;
        console.log("User already exists. Fetched existing data.");
      }

      // 更新 context 中的用戶信息
      setUserInfo(userInfoData);

      onClose(); // 關閉 Modal
      router.push("/map"); // 重定向到地圖頁面或其他用戶中心頁面
    } catch (error) {
      console.error("Google login error:", error);
      setLoginError("An error occurred with Google login, please try again.");
    } finally {
      setIsLoadingUserInfo(false); // 結束加載
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg z-50 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-4 text-lg text-primary-color"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-2xl text-gray-500 mb-4 text-center">
          Welcome back.
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            className="p-2 rounded-md text-primary-color"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="p-2 rounded-md text-primary-color"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            className="p-2 bg-tertiary-color font-bold text-white rounded-md hover:bg-green-500 transition duration-300"
            type="submit"
          >
            Login
          </button>

          {loginError && (
            <p className="text-red-500 text-center">{loginError}</p>
          )}
        </form>
        <p className="text-center mt-4 text-gray-500">
          No account?{" "}
          <button onClick={onShowSignup} className="text-green-500 underline">
            Create one
          </button>
          .
        </p>
        <hr className="my-4" />
        <button
          onClick={handleGoogleLogin}
          className="w-full p-2 bg-gray-700 font-bold text-white rounded-md hover:bg-gray-800 transition duration-300 flex justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="mr-2 h-5 w-5" // 設定 SVG 圖示的大小，並添加右邊距
          >
            {/* SVG 內容 */}

            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
