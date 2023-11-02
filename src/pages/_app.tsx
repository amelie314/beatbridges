/** @format */

import React, { useEffect, useState, ReactNode, ReactElement } from "react";
import { AppProps } from "next/app"; // 從 next/app 中導入 AppProps 類型
import { auth } from "../firebaseConfig";
import Layout from "../app/layout";
import Navbar from "../components/Navbar";

import { User } from "firebase/auth";

// 使用 AppProps 並擴展它來包括類型為 ReactNode 的 getLayout 屬性
interface MyAppProps extends AppProps {
  Component: AppProps["Component"] & {
    getLayout?: (page: ReactElement) => ReactNode;
  };
}

function MyApp({ Component, pageProps }: MyAppProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  // 確保 getLayout 能接收 ReactElement 並返回 ReactNode
  const getLayout =
    Component.getLayout || ((page: ReactElement) => <Layout>{page}</Layout>);

  return getLayout(
    <>
      {/* <Navbar /> */}
      <Navbar currentUser={currentUser} />
      <Component {...pageProps} currentUser={currentUser} />
    </>
  );
}

export default MyApp;
