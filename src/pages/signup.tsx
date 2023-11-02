/** @format */

import React, { useState } from "react";
import { useRouter } from "next/router";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (event) => {
    event.preventDefault();
    const auth = getAuth(app);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/concert"); // 註冊成功，導向至 concert 頁面
    } catch (error) {
      console.error(error);
      alert(error.message); // 當有錯誤發生時，跳出提醒視窗
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
          className="text-black p-1 m-3  border rounded-md text-dark-purple"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
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
