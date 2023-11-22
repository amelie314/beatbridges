/** @format */

import React, { useState } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  // 新增狀態
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

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
      await updateProfile(user, { displayName: displayName });

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        bio: bio,
        photoURL: "", // 儲存大頭照的 URL
        displayName: displayName, // 確保這裡的字段名與您的Firestore結構一致
      });
      console.log("Firestore 寫入成功");
      alert("帳戶註冊成功！");
      router.push("/member-center"); // 更改導向到會員中心
    } catch (error) {
      alert(`帳戶註冊失敗，請再試一次：${error.message}`);
      console.error("帳戶註冊失敗：", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#131313", minHeight: "100vh" }}>
      <form onSubmit={handleSignup}>
        <input
          className="text-black p-1 m-3  border rounded-md text-dark-purple"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="text-black p-1 m-3  border rounded-md text-primary-color"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <input
          type="text"
          className="text-black p-1 m-3  border rounded-md text-primary-color"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="text"
          className="text-black p-1 m-3  border rounded-md text-primary-color"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          required
        />

        <button
          className="text-primary-color p-1 bg-tertiary-color border rounded-md"
          type="submit"
        >
          註冊
        </button>
      </form>
    </div>
  );
};

export default Signup;
