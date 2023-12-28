/** @format */

// /src/components/LoginModal.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onShowSignup: () => void; // 新增一個函數來處理顯示註冊Modal的邏輯
}

const LoginModal: React.FC<LoginModalProps> = ({
  show,
  onClose,
  onShowSignup,
}) => {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demoPassword");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError(""); // Reset error message before attempting to log in

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // If the login is successful, close the modal and redirect
      setEmail("demo@example.com");
      setPassword("demoPassword");
      onClose(); // Close the modal before redirecting
      router.push("/map"); // Redirect to the map page
    } catch (error) {
      console.error("Login process error:", error);
      // Set a user-friendly error message
      setLoginError("Invalid login credentials, please try again.");
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg z-50 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-4 text-lg text-primary-color"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-2xl text-gray-500 mb-4 text-center">
          Welcome back.
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            className="p-2 rounded-md text-primary-color"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="p-2 rounded-md text-primary-color"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            className="p-2 bg-tertiary-color font-bold text-white rounded-md hover:bg-green-500 transition duration-300"
            type="submit"
          >
            Login
          </button>
          {loginError && (
            <p className="text-red-500 text-center">{loginError}</p>
          )}
        </form>
        <p className="text-center mt-4 text-gray-500">
          No account?{" "}
          <button onClick={onShowSignup} className="text-green-500 underline">
            Create one
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
