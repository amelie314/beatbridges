/** @format */

// /src/pages/index.tsx
import "../app/globals.css";
import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForwardStep } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

// 將login函數改為接收email, password和狀態更新函數
async function login(
  email: string,
  password: string,
  setError: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // 登入成功後的處理...
  } catch (error) {
    console.error(error);
    setError(true); // 使用傳入的狀態更新函數來處理錯誤
  }
}
export default function Home() {
  const [showSignup, setShowSignup] = useState(false); // 將狀態放在Home組件內部
  const [runJoyride, setRunJoyride] = useState(true);

  const joyrideSteps = [
    {
      target: ".welcome",
      content: "Hey there! Ready to rock the Taiwan Concert Map? 🎸  ",
      showProgress: true,
      styles: {
        options: {
          backgroundColor: "black", // 黑色背景
          borderRadius: "8px", // 圓角邊框
          width: "250px", // 調整寬度
          padding: "10px", // 內部填充
          borderWidth: "2px", // 邊框寬度
          borderColor: "white", // 白色邊框
          color: "white", // 文字顏色
        },
      },
    },
    // 更多步驟...
    {
      target: ".login-step",
      content: "Join the crew! Sign in to connect and share your vibe ✨",
      styles: {
        options: {
          backgroundColor: "black", // 黑色背景
          borderRadius: "8px", // 圓角邊框
          width: "250px", // 調整寬度
          padding: "10px", // 內部填充
          borderWidth: "2px", // 邊框寬度
          borderColor: "white", // 白色邊框
          color: "white", // 文字顏色
        },
      },
    },
    {
      target: ".map-step",
      content:
        "Discover where the magic happens! Pinpoint cool venues and events. 📍🎶",
      styles: {
        options: {
          backgroundColor: "black", // 黑色背景
          borderRadius: "8px", // 圓角邊框
          width: "250px", // 調整寬度
          padding: "10px", // 內部填充
          borderWidth: "2px", // 邊框寬度
          borderColor: "white", // 白色邊框
          color: "white", // 文字顏色
        },
      },
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRunJoyride(false);
    }
  };

  // 使用login函數時需要傳入setError
  const handleLogin = (email: string, password: string) =>
    login(email, password, setShowSignup);

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
      <div className="welcome"></div>
      <Joyride
        steps={joyrideSteps}
        run={runJoyride}
        callback={handleJoyrideCallback}
        locale={{
          last: "Finish", // 最後一步的按鈕文本
          next: "Next", // 下一步的按鈕文本
          skip: "Skip", // 跳過按鈕文本
          close: "Close", // 關閉按鈕文本
        }}
        showSkipButton={true}
        showProgress={true}
        continuous={true}
      />
    </div>
  );
}
