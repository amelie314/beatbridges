/** @format */

// ReviewList.js 或 .tsx
import React from "react";

const ReviewList = ({ reviews, currentUserId, onDelete }) => {
  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>
          <p>
            {review.userName}: {review.text}
          </p>{" "}
          {currentUserId === review.userId && (
            <button onClick={() => onDelete(review.id)}>删除</button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ReviewList;
