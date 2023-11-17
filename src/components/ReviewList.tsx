/** @format */

// ReviewList.js 或 .tsx
import React from "react";

const ReviewList = ({ reviews, currentUserId, onDelete }) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex items-start space-x-3">
          <img
            src={review.userPhoto}
            alt={review.userName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {review.userName}
              </h4>
            </div>
            <p className="mt-1 text-sm text-white">{review.text}</p>
            {currentUserId === review.userId && (
              <button
                onClick={() => onDelete(review.id)}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                删除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
