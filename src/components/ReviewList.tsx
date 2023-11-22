/** @format */

// ReviewList.js 或 .tsx
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ReviewList = ({ reviews, currentUserId, onDelete, onToggleFavorite }) => {
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const loadUserDetails = async () => {
      const newDetails = {};
      for (const review of reviews) {
        const userDoc = await getDoc(doc(db, "users", review.userId));
        newDetails[review.userId] = {
          photoURL: userDoc.data()?.photoURL || "default-avatar.png",
          userName: userDoc.data()?.username || "匿名用戶",
        };
      }
      setUserDetails(newDetails);
    };
    loadUserDetails();
  }, [reviews]);

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="flex flex-col bg-secondary-color p-4 rounded-lg"
        >
          {/* 用户照片、用户名、日期和性能名称在同一行 */}
          <div className="flex items-center space-x-4">
            <img
              src={userDetails[review.userId]?.photoURL}
              alt={userDetails[review.userId]?.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center w-full">
                {/* 用户名字体放大 */}
                <h4 className="text-base font-semibold text-white truncate">
                  {userDetails[review.userId]?.userName}
                </h4>
                <span className="text-xs text-gray-400">
                  {review.date
                    ? new Date(review.date).toLocaleDateString("zh-TW")
                    : "未知日期"}
                </span>
              </div>
              {/* 性能名称字体放大 */}
              <p className="text-sm text-white mt-1 truncate">
                {review.performanceName}
              </p>
            </div>
          </div>
          {/* 评论文本 */}
          <div className="mt-1">
            <p className="text-sm text-white whitespace-pre-line">
              {review.text}
            </p>
          </div>
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 mt-2">
            {currentUserId === review.userId && (
              <button
                onClick={() => onDelete(review.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                🗑️ 刪除
              </button>
            )}
            <button
              onClick={() => onToggleFavorite(review.id)}
              className={`text-xs ${
                review.isFavorite ? "text-yellow-500" : "text-gray-500"
              } hover:text-yellow-300`}
            >
              {review.isFavorite ? "☆ 取消收藏" : "★ 收藏"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
