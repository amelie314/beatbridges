/** @format */

// ReviewList.js 或 .tsx
import React from "react";

const ReviewList = ({ reviews, currentUserId, onDelete }) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="flex items-center space-x-4 bg-black p-4 rounded-lg"
        >
          <img
            src={review.userPhoto || "default-avatar.png"}
            alt={review.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                {review.userName}
              </h4>
              <span className="text-xs text-white">{/* 日期处理逻辑 */}</span>
            </div>
            <p className="text-sm text-white">{review.text}</p>
          </div>
          {currentUserId === review.userId && (
            <button
              onClick={() => onDelete(review.id)}
              className="ml-2 text-xs text-red-600 hover:text-red-800"
            >
              🗑️ 删除
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
