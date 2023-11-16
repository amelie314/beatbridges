/** @format */

// FavoriteReviews.js 或 .tsx
import React, { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const FavoriteReviews = ({ favoriteReviewIds, currentUserId }) => {
  const [favoriteReviews, setFavoriteReviews] = useState([]); // 状态变量来存储收藏的评论详情

  useEffect(() => {
    // 异步函数来获取每个评论的详细信息
    const fetchFavoriteReviews = async () => {
      const reviews = [];
      for (const reviewId of favoriteReviewIds) {
        const reviewRef = doc(db, "reviews", reviewId);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          reviews.push({ id: reviewSnap.id, ...reviewSnap.data() });
        }
      }
      setFavoriteReviews(reviews); // 存储评论详情
    };

    // 检查 favoriteReviewIds 是否已定义并且有内容
    if (favoriteReviewIds && favoriteReviewIds.length > 0) {
      fetchFavoriteReviews();
    }
  }, [favoriteReviewIds]); // 监听传入的 favoriteReviewIds prop 的变化

  const handleRemoveFavorite = async (reviewId) => {
    // 使用 currentUserId 来定位 Firestore 中的记录
    const favoriteRef = doc(
      db,
      "userFavorites",
      currentUserId,
      "favorites",
      reviewId
    );

    try {
      // 删除记录
      await deleteDoc(favoriteRef);
      // 更新组件状态以移除取消收藏的评论
      setFavoriteReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
    <div>
      <h2>我收藏的评论</h2>
      <ul>
        {favoriteReviews.map((review) => (
          <li key={review.id}>
            <article>
              <h3>{review.performanceName}</h3>
              <p>{review.text}</p>
              <button onClick={() => handleRemoveFavorite(review.id)}>
                取消收藏
              </button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoriteReviews;
