/** @format */

import React, { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // 更新用戶資料，添加displayName
      await updateProfile(user, {
        displayName: displayName,
      });
      alert("帳戶註冊成功！");
      router.push("/concert"); // 注册成功，导向至 concert 页面
    } catch (error) {
      alert(`帳戶註冊失敗，請再試一次：${error.message}`);
      console.error("帳戶註冊失敗：", error);
    }
  };

  return (
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
        className="text-black p-1 m-3  border rounded-md text-dark-purple"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="請輸入你的名字"
        required
      />
      <button
        className="text-primary-color p-1 bg-tertiary-color border rounded-md"
        type="submit"
      >
        註冊
      </button>
    </form>
  );
};

export default Signup;
