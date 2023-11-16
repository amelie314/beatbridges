/** @format */

// ReviewList.js 或 .tsx
// import React from "react";

// const ReviewList = ({ reviews, currentUserId, onDelete }) => {
//   return (
//     <ul>
//       {reviews.map((review) => (
//         <li key={review.id}>
//           <p>{review.text}</p>
//           {/* 显示刪除按钮，仅当当前登录用户是评论的发布者时 */}
//           {currentUserId === review.userId && (
//             <button onClick={() => onDelete(review.id)}>刪除</button>
//           )}
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default ReviewList;

// ReviewList.js 或 .tsx
// ReviewList 组件
import React from "react";

const ReviewList = ({ reviews, currentUserId, onDelete, onToggleFavorite }) => {
  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>
          <p>{review.text}</p>
          {/* 显示收藏按钮 */}
          <button onClick={() => onToggleFavorite(review.id)}>
            {review.isFavorited ? "取消收藏" : "收藏"}
          </button>
          {/* 显示删除按钮，仅当当前登录用户是评论的发布者时 */}
          {currentUserId === review.userId && (
            <button onClick={() => onDelete(review.id)}>删除</button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ReviewList;
