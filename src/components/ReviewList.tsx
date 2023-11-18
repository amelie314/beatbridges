/** @format */

// ReviewList.js 或 .tsx
import React from "react";

const ReviewList = ({ reviews, currentUserId, onDelete, onToggleFavorite }) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col bg-black p-4 rounded-lg">
          <div className="flex items-center space-x-4">
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
              </div>
              <p className="text-xs text-white mt-1">
                {review.performanceName}
              </p>
              <p className="text-sm text-white">{review.text}</p>
            </div>
            <div className="flex flex-col items-end">
              {currentUserId === review.userId && (
                <button
                  onClick={() => onDelete(review.id)}
                  className="text-xs text-red-600 hover:text-red-800 mb-2"
                >
                  🗑️ 刪除
                </button>
              )}
              <button
                onClick={() => {
                  console.log("Toggling favorite for review ID:", review.id);
                  console.log(
                    "Current isFavorite status before toggle:",
                    review.isFavorite
                  );
                  onToggleFavorite(review.id);
                }}
                className={`text-xs ${
                  review.isFavorite ? "text-yellow-500" : "text-gray-500"
                } hover:text-yellow-300`}
              >
                {review.isFavorite ? "☆ 取消收藏" : "★ 收藏"}
              </button>
            </div>
          </div>
          {/* 日期顯示在這裡 */}
          <div className="text-right">
            <span className="text-xs text-green-500">
              {review.date
                ? new Date(review.date).toLocaleDateString("zh-TW")
                : "未知日期"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ReviewList;
