/** @format */

import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ReviewForm = ({ venueId, userId, onAddReview }) => {
  const [reviewText, setReviewText] = useState("");
  const [performanceName, setPerformanceName] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reviewText.trim() || !venueId) {
      alert("請選擇一個展演空間並填寫評論。");
      console.log(reviewText, venueId);
      return;
    }
    //驗證日期是否已選擇且不是未來的日期
    if (!date || new Date(date) > new Date()) {
      alert("請選擇日期");
      return;
    }

    //調用父組件傳遞的 onAddReview 函數
    onAddReview(reviewText, venueId, userId, performanceName, date);
    setReviewText(""); // 清空输入框
    setPerformanceName(""); // 清空表演名稱輸入
    setDate(""); // 清空日期输入
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label
        htmlFor="performanceName"
        className="block text-sm font-medium text-white"
      >
        表演名稱
      </label>
      <input
        id="performanceName"
        className="text-black border border-gray-300 text-sm rounded-lg block w-full p-2.5"
        type="text"
        value={performanceName}
        onChange={(e) => setPerformanceName(e.target.value)}
        placeholder="請輸入表演名稱"
        required
      />

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-white">
          日期
        </label>
        <input
          id="date"
          className="text-black border border-gray-300 text-sm rounded-lg block w-full p-2.5"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]} // 限制为今天之前
          required
        />
      </div>

      <div>
        <label
          htmlFor="reviewText"
          className="block mb-2 text-sm font-medium text-white "
        >
          評論
        </label>
        <textarea
          id="reviewText"
          className="text-black border border-gray-300 text-sm rounded-lg block w-full p-2.5"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="請輸入評論"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-white hover:bg-green-500 text-black font-medium rounded-lg text-sm px-4 py-2"
      >
        提交評論
      </button>
    </form>
  );
};

export default ReviewForm;
