/** @format */

// /src/components/SignupModal.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons"; // 導入 X 圖標

interface SignupModalProps {
  show: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ show, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const router = useRouter();

  const validateUsername = (username) => {
    // 正則表達式用於檢查用戶名稱是否只包含字母、數字及標點符號
    const regex = /^[a-zA-Z0-9.\-_]+$/;
    return regex.test(username);
  };

  // 處理註冊表單提交的函數
  const handleSignup = async (event) => {
    event.preventDefault();
    // 在創建帳戶前驗證 username
    if (!validateUsername(username)) {
      alert(
        "用戶名稱格式不正確，只能包含字母、數字及標點符號（例如：username.123）。"
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      //add

      // 更新 Firebase Authentication 的 displayName，不涉及照片上傳
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        bio: bio,
        photoURL: "", // 儲存大頭照的 URL
        displayName: displayName, // 確保這裡的字段名與您的Firestore結構一致
        uid: user.uid,
      });
      // 註冊成功後的操作
      console.log("Firestore 寫入成功");
      alert("帳戶註冊成功！");

      // 先關閉 Modal
      onClose();

      // 然後導向到 /concert
      router.push("/concert");

      // 清空表單欄位
      setEmail("");
      setPassword("");
      setUsername("");
      setDisplayName("");
      setBio("");
    } catch (error) {
      alert(`帳戶註冊失敗，請再試一次：${error.message}`);
      console.error("帳戶註冊失敗：", error);
    }
  };
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg z-50 relative">
        {" "}
        {/* 添加 relative 以支持絕對定位的子元素 */}
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-4 text-lg text-primary-color" // 將右邊距增加到 4
        >
          <FontAwesomeIcon icon={faTimes} /> {/* 使用 X 圖標 */}
        </button>
        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
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
          <input
            className="p-2 rounded-md text-primary-color"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <button
            className="p-2 bg-tertiary-color font-bold text-white rounded-md hover:bg-green-500 transition duration-300"
            type="submit"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
