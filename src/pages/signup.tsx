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
  const [profilePic, setProfilePic] = useState(null); // 用於儲存上傳的圖片文件

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      //add
      // 上傳大頭照到 Firebase Storage 並獲取 URL
      let photoURL = ""; // 初始化 photoURL
      if (profilePic) {
        const picRef = ref(storage, `profilePics/${user.uid}`);
        const snapshot = await uploadBytes(picRef, profilePic);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      console.log("即將更新 displayName 和 photoURL");
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });

      console.log("即將寫入 Firestore");
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        bio: bio,
        photoURL: photoURL, // 儲存大頭照的 URL
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

  // 處理圖片文件變化的函數
  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(e.target.files[0]);
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
