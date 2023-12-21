/** @format */

import "../app/globals.css";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useJoyride } from "../contexts/JoyrideContext";
import dynamic from "next/dynamic";
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });
import Image from "next/image";

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

const LandingPage = () => {
  const [showSignup, setShowSignup] = useState(false);
  const { runJoyride, joyrideSteps, stopJoyride } = useJoyride();
  // 明確地指定 useRef 的類型為 HTMLDivElement
  const sectionOneRef = useRef<HTMLDivElement>(null);
  const sectionTwoRef = useRef<HTMLDivElement>(null);
  const sectionThreeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const windowPos = window.scrollY;
      if (sectionOneRef.current && windowPos > 300) {
        sectionOneRef.current.style.opacity = "1";
        sectionOneRef.current.style.transform = "translateY(0)";
      }
      if (sectionTwoRef.current && windowPos > 800) {
        sectionTwoRef.current.style.opacity = "1";
        sectionTwoRef.current.style.transform = "translateY(0)";
      }
      if (sectionThreeRef.current && windowPos > 1300) {
        sectionThreeRef.current.style.opacity = "1";
        sectionThreeRef.current.style.transform = "translateY(0)";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Demo 登入函數
  const handleDemoLogin = () => {
    const demoEmail = "demo@example.com"; // 預設的測試帳號電子郵件
    const demoPassword = "demoPassword"; // 預設的測試帳號密碼

    handleLogin(demoEmail, demoPassword);
  };

  // 使用login函數時需要傳入setError
  const handleLogin = (email: string, password: string) =>
    login(email, password, setShowSignup);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="flex flex-col bg-primary-color h-screen  text-secondary-color">
        <Head>
          <title>Taiwan Concert Venues Map</title>
          <meta name="description" content="Welcome to Taiwan" />
        </Head>
        {/* 設置背景圖片 */}
        <div className="absolute w-full h-full bg-center bg-cover bg-no-repeat z-0">
          <Image
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYW7fHx8fGVufDB8fHx8fA%3D%3D"
            alt="Background Image"
            fill
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
        </div>

        {/* 歡迎訊息部分 */}
        {/* 欢迎信息部分 */}
        <div className="pt-32 pl-16 md:pl-16 sm:pl-4 text-tertiary-color z-20 relative">
          <p className="text-[60px] font-bold leading-[0.8]">Discover</p>
          <p className="text-[38px] mt-2">Taiwan's Concert Venues</p>
        </div>
        <div className="pt-60 pr-8 text-right text-white z-20 relative">
          <p className="text-[60px] font-bold leading-[0.8]">Share </p>
          <p className="text-[38px] mt-2">your experiences, </p>
          <p className="text-[38px] mt-2">
            and build friendships through reviews.
          </p>
        </div>

        {/* Demo 登入按鈕 */}
        <Link href="/concert">
          <button
            // onClick={handleDemoLogin}
            className="absolute top-[380px] left-[200px] px-6 py-3 border-2 border-white text-white bg-opacity-100 bg-primary-color hover:bg-opacity-100 hover:bg-show-color hover:text-white transition duration-300 ease-in-out rounded-full shadow-lg z-20"
          >
            Quick Start
          </button>
        </Link>
        <div className="welcome"></div>

        {/* <div className="absolute bottom-[-100px] left-0 z-10 overflow-visible max-w-3xl max-h-3xl">
          <Image
            src="/section_1.png"
            layout="responsive"
            width={700}
            height={500}
            objectFit="contain"
            alt="Dynamic Image"
          />
        </div> */}
        <Joyride
          steps={joyrideSteps}
          run={runJoyride}
          callback={(data) => {
            if (data.status === "finished" || data.status === "skipped") {
              stopJoyride();
            }
          }}
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

      {/* Section One */}
      {/* <div ref={sectionOneRef} className="bg-primary-color p-8">
        <h2 className="text-3xl font-bold text-secondary-color">
          Discover Performance Spaces
        </h2>
        <p className="mt-4 text-gray-300">
          Embark on a journey through Taiwan's vibrant performance scene. From
          underground band venues to established stages, find your next cultural
          adventure.
        </p>
      </div> */}

      {/* Section Two */}
      {/* <div ref={sectionTwoRef} className="bg-primary-color p-8">
        <h2 className="text-3xl font-bold text-secondary-color">
          Share Your Reviews
        </h2>
        <p className="mt-4 text-gray-300">
          Got thoughts about a recent show? Share your reviews and insights with
          fellow art enthusiasts. Your voice could be the start of a new
          artistic friendship!
        </p>
      </div> */}

      {/* Section Three */}
      {/* <div ref={sectionThreeRef} className="bg-primary-color p-8">
        <h2 className="text-3xl font-bold text-secondary-color">
          Performance Art Enthusiasts Unite
        </h2>
        <p className="mt-4 text-gray-300">
          In this space, engage, discuss, and connect – it's more than just a
          map, it's a platform where Taiwan's performance art enthusiasts come
          together to exchange and interact.
        </p>
      </div>*/}
    </div>
  );
};

export default LandingPage;
