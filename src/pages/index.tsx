/** @format */

import "../app/globals.css";
import React from "react";
import Link from "next/link";
import Head from "next/head";
// /src/pages/index.tsx
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";

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
    <div className="flex flex-col h-screen justify-center items-center bg-primary-color text-secondary-color">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      {/* 主容器 */}
      <div>
        {/* 主標題部分 */}
        <div className="text-white text-3xl p-8 text-center"></div>
        <div className="absolute top-[225px] right-[-210px] transform rotate-90 writing-mode-vertical-rl text-[100px] text-white leading-[0.8]">
          DRINK THE
          <br />
          POISON-
        </div>
        {/* 歡迎訊息部分 */}
        <div className="text-2xl p-8 text-center"></div>

        {/* 按鈕部分 */}
        <div className="flex justify-center p-8">
          <Link href="/concert">
            <button className="absolute bottom-[20px] left-[250px] text-white bg-green-500 px-4 py-2 border border-white rounded hover:bg-green-400">
              Enter
            </button>
          </Link>
        </div>
        <div className="absolute top-[280px] left-[-220px] transform rotate-90 writing-mode-vertical-rl text-[100px] text-tertiary-color leading-[0.8]">
          FROM THE
          <br />
          SAME VIBE·
          <br />▶ ıı|ıı|ıı|ıı 30 &quot;
        </div>
        <div className="absolute top-[50px] right-0">
          <img
            src="https://i.pinimg.com/564x/95/0b/d1/950bd14366d1919c0e4f873d9e8aa83f.jpg"
            alt="你的照片描述"
            width={600}
            height={600}
            className="transform rotate-90 opacity-75 filter"
          />
        </div>
      </div>
    </div>
  );
}
