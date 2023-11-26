/** @format */

// /src/pages/index.tsx
import "../app/globals.css";
import React from "react";
import Link from "next/link";
import Head from "next/head";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForwardStep } from "@fortawesome/free-solid-svg-icons";

// 登入函數
const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // 登入成功後的處理...
  } catch (error) {
    console.error(error);
    // 處理錯誤...
  }
};

export default function Home() {
  return (
    <div className="flex flex-col bg-primary-color h-screen items-center text-secondary-color">
      <Head>
        <title>Taiwan Concert Venues Map</title>
        <meta name="description" content="Welcome to Taiwan" />
      </Head>
      {/* 設置背景圖片 */}
      {/* 背景圖片 */}
      <div
        className="absolute w-full h-full bg-center bg-cover bg-no-repeat z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        {/* 遮罩层 */}
        <div className="absolute inset-0 bg-black bg-opacity-20 z-10"></div>
      </div>
      <div className="text-white text-3xl"></div>
      <div
        className="absolute top-[570px] right-[20px] transform rotate-90 writing-mode-vertical-rl text-[100px] text-white leading-[0.8]"
        style={{ transformOrigin: "top right" }}
      >
        DRINK THE
        <br />
        POISON-
      </div>
      {/* 歡迎訊息部分 */}
      <div
        className="absolute top-[250px] left-[200px] transform rotate-90 writing-mode-vertical-rl text-[100px] text-tertiary-color leading-[0.8]"
        style={{ transformOrigin: "top left" }}
      >
        FROM THE
        <br />
        SAME VIBE·
        <br /> <FontAwesomeIcon icon={faForwardStep} /> ıı|ıı|ıı|ıı 30 &quot;
      </div>

      <Link href="/concert">
        <div className="absolute bottom-7 left-[170px] px-6 py-3 border-2 border-white text-white bg-opacity-100 bg-primary-color hover:bg-opacity-100 hover:bg-show-color hover:text-white transition duration-300 ease-in-out rounded-full shadow-lg">
          Enter
        </div>
      </Link>
    </div>
  );
}
