/** @format */

// JoyrideContext.tsx

import React, { createContext, useState, useContext } from "react";
// 假設這是您的 JoyrideContext 類型定義
import { JoyrideStep } from "../types/types"; // 請根據實際路徑導入

interface JoyrideContextType {
  runJoyride: boolean;
  startJoyride: () => void;
  stopJoyride: () => void;
  joyrideSteps: JoyrideStep[]; // 使用 JoyrideStep[] 代替 never[]
  updateJoyrideSteps: (isLoggedIn: boolean) => void;
}
// 定義兩組不同的步驟
/* 登錄用戶的步驟 */
const loggedInJoyrideSteps = [
  {
    target: ".map-step",
    content:
      "Discover where the magic happens! Pinpoint cool venues and events. 📍🎶",
    disableBeacon: true,
    styles: {
      options: {
        backgroundColor: "black",
        borderRadius: "8px",
        width: "250px",
        padding: "10px",
        borderWidth: "2px",
        borderColor: "white",
        color: "white",
      },
    },
  },
  {
    target: ".member-step",
    content:
      "Personalize your journey! Tailor your profile and revisit your treasured reviews. ✨📝",
    disableBeacon: true,
    styles: {
      options: {
        backgroundColor: "black",
        borderRadius: "8px",
        width: "250px",
        padding: "10px",
        borderWidth: "2px",
        borderColor: "white",
        color: "white",
      },
    },
  },
  {
    target: ".logout-step",
    content:
      "Signing off? Your musical journey pauses here. Can't wait to see you back soon! 🎵👋",
    disableBeacon: true,
    styles: {
      options: {
        backgroundColor: "black",
        borderRadius: "8px",
        width: "250px",
        padding: "10px",
        borderWidth: "2px",
        borderColor: "white",
        color: "white",
      },
    },
  },
];
// 一組是未登錄用戶的步驟
const defaultJoyrideSteps = [
  {
    target: ".guide-step",
    content:
      'Welcome to rock the Taiwan Concert Map! 🎸 Click "Next" to check the guide',
    disableBeacon: true, // 禁用此步驟的 Beacon,
    styles: {
      options: {
        backgroundColor: "black",
        borderRadius: "8px",
        width: "250px",
        padding: "10px",
        borderWidth: "2px",
        borderColor: "white",
        color: "white",
      },
    },
  },
  {
    target: ".login-step",
    content: "Join the crew! Sign in to connect and share your vibe. 🌟",
    disableBeacon: true,
    styles: {
      options: {
        backgroundColor: "black",
        borderRadius: "8px",
        width: "250px",
        padding: "10px",
        borderWidth: "2px",
        borderColor: "white",
        color: "white",
      },
    },
  },
  {
    target: ".map-step",
    content:
      "Discover where the magic happens! Pinpoint cool venues and events. 📍🎶",
    disableBeacon: true,
    styles: {
      options: {
        backgroundColor: "black",
        borderRadius: "8px",
        width: "250px",
        padding: "10px",
        borderWidth: "2px",
        borderColor: "white",
        color: "white",
      },
    },
  },
  // Additional steps can be added based on other features of your site
];

const JoyrideContext = createContext<JoyrideContextType>({
  runJoyride: false,
  startJoyride: () => {},
  stopJoyride: () => {},
  joyrideSteps: [],
  updateJoyrideSteps: (isLoggedIn) => {},
});
export const JoyrideProvider = ({ children }) => {
  const [runJoyride, setRunJoyride] = useState(false);
  const [joyrideSteps, setJoyrideSteps] = useState(defaultJoyrideSteps);

  const startJoyride = () => setRunJoyride(true);
  const stopJoyride = () => setRunJoyride(false);

  const updateJoyrideSteps = (isLoggedIn) => {
    setJoyrideSteps(isLoggedIn ? loggedInJoyrideSteps : defaultJoyrideSteps);
  };

  return (
    <JoyrideContext.Provider
      value={{
        runJoyride,
        startJoyride,
        stopJoyride,
        updateJoyrideSteps,
        joyrideSteps,
      }}
    >
      {children}
    </JoyrideContext.Provider>
  );
};

export const useJoyride = () => useContext(JoyrideContext);
