/** @format */

// src/components/ReviewForm.tsx
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ReviewForm = ({ venueId, userId, onAddReview }) => {
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reviewText.trim() || !venueId) {
      // 如果评论为空或没有选择场馆，显示错误并返回
      alert("请填写评论并选择一个展演空间。");
      return;
    }

    // 调用父组件传递的 onAddReview 函数
    onAddReview(reviewText, venueId, userId);
    setReviewText(""); // 清空输入框
  };

  //   try {
  //     await addDoc(collection(db, "reviews"), {
  //       venueId: venueId, // 展演空间的 ID
  //       userId: userId, // 用户的 ID
  //       text: reviewText, // 评论文本
  //       createdAt: serverTimestamp(), // 创建时间戳
  //     });
  //     setReviewText(""); // 清空文本框
  //   } catch (error) {
  //     console.error("Error adding document: ", error);
  //   }
  // };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        className="text-black"
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="请输入评论"
        required
      />
      <button type="submit">提交评论</button>
    </form>
  );
};

export default ReviewForm;
