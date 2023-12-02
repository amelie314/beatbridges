/** @format */

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";

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

  // 統一的間距樣式
  const inputClass =
    "text-black border border-gray-300 text-sm rounded-lg block w-full p-2.5 mb-4";
  const labelClass = "block mb-2 text-sm font-medium text-white";

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="performanceName" className={labelClass}>
        表演名稱
      </label>
      <input
        id="performanceName"
        className={inputClass}
        type="text"
        value={performanceName}
        onChange={(e) => setPerformanceName(e.target.value)}
        placeholder="請輸入表演名稱"
        required
      />

      <div>
        <label htmlFor="date" className={labelClass}>
          日期
        </label>
        <input
          id="date"
          className={inputClass}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]} // 限制为今天之前
          required
        />
      </div>

      <div>
        <label htmlFor="reviewText" className={labelClass}>
          評論
        </label>
        <textarea
          id="reviewText"
          className={inputClass}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="請輸入評論"
          required
        />
      </div>
      <div className="flex justify-end">
        {" "}
        {/* 這將按鈕放到右邊 */}
        <button
          type="submit"
          className="mt-2 mb-4 bg-secondary-color text-white font-medium rounded-lg text-sm px-4 py-2 flex items-center justify-center" // flex和items-center使圖標和文本垂直居中
        >
          Submit {/* 直接寫入Submit文字 */}
          <FontAwesomeIcon icon={faMessage} className="ml-2" />{" "}
          {/* ml-2給圖標和文本之間一些間隔 */}
        </button>
      </div>
    </form>
  );
};
export default ReviewForm;
