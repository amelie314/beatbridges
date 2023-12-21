/** @format */

/** @format */

// src/pages/_app.tsx
import React, { ReactElement } from "react";
import { AppProps } from "next/app";
import Layout from "../app/layout";
import Navbar from "../components/Navbar";
import { UserProvider } from "../contexts/UserContext";
import { JoyrideProvider } from "../contexts/JoyrideContext"; // 確保正確引入 JoyrideProvider

interface MyAppProps extends AppProps {
  Component: AppProps["Component"] & {
    getLayout?: (page: ReactElement) => ReactElement;
  };
}

function MyApp({ Component, pageProps }: MyAppProps) {
  const getLayout =
    Component.getLayout || ((page: ReactElement) => <Layout>{page}</Layout>);

  return (
    <UserProvider>
      <JoyrideProvider>
        {" "}
        {getLayout(
          <>
            <Navbar />
            <Component {...pageProps} />
          </>
        )}
      </JoyrideProvider>
    </UserProvider>
  );
}

export default MyApp;
