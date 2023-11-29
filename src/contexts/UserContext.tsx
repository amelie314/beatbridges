/** @format */

import React, { createContext, useState, useContext } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    user: null,
    username: null,
  });

  const resetUserInfo = () => {
    setUserInfo({
      user: null,
      username: null,
    });
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, resetUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
