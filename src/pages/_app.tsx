/** @format */

// src/pages/_app.tsx
import React, { ReactElement } from "react";
import { AppProps } from "next/app";
import Layout from "../app/layout";
import Navbar from "../components/Navbar";
import { UserProvider } from "../contexts/UserContext";

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
      {getLayout(
        <>
          <Navbar />
          <Component {...pageProps} />
        </>
      )}
    </UserProvider>
  );
}

export default MyApp;
