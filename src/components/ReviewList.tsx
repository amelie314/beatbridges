/** @format */

// src/components/ReviewList.tsx
import React from "react";

const ReviewList = ({ reviews, onDeleteReview }) => {
  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>
          {review.text}
          <button onClick={() => onDeleteReview(review.id)}>刪除</button>
        </li>
      ))}
    </ul>
  );
};

export default ReviewList;
