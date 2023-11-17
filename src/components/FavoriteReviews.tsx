/** @format */

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { Review } from "../types/types";

// const FavoriteReviews = ({ favoriteReviewIds, currentUserId }) => {
//   const [favoriteReviews, setFavoriteReviews] = useState([]);

//   useEffect(() => {
//     const fetchFavoriteReviews = async () => {
//       const reviews = [];
//       for (const reviewId of favoriteReviewIds) {
//         const reviewRef = doc(db, "reviews", reviewId);
//         const reviewSnap = await getDoc(reviewRef);
//         if (reviewSnap.exists()) {
//           reviews.push({ id: reviewSnap.id, ...reviewSnap.data() });
//         }
//       }
//       setFavoriteReviews(reviews);
//     };

//     if (favoriteReviewIds && favoriteReviewIds.length > 0) {
//       fetchFavoriteReviews();
//     }
//   }, [favoriteReviewIds]);
const FavoriteReviews = ({ favoriteReviewIds, currentUserId }) => {
  const [favoriteReviews, setFavoriteReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchFavoriteReviews = async () => {
      const reviews: Review[] = [];
      for (const reviewId of favoriteReviewIds) {
        const reviewRef = doc(db, "reviews", reviewId);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          reviews.push({ id: reviewSnap.id, ...(reviewSnap.data() as any) });
        }
      }
      setFavoriteReviews(reviews);
    };

    if (favoriteReviewIds && favoriteReviewIds.length > 0) {
      fetchFavoriteReviews();
    }
  }, [favoriteReviewIds]);

  const handleRemoveFavorite = async (reviewId) => {
    if (!auth.currentUser) return; // 确保用户已登录

    // 在 userFavorites 集合中查找与当前用户和评论 ID 匹配的文档
    const favoritesRef = collection(db, "userFavorites");
    const q = query(
      favoritesRef,
      where("userId", "==", auth.currentUser.uid),
      where("reviewId", "==", reviewId)
    );

    const querySnapshot = await getDocs(q);
    // 如果找到了匹配的文档，则删除它们
    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(docSnapshot.ref);
    });

    // 更新状态以移除 UI 上的收藏评论
    setFavoriteReviews((prev) =>
      prev.filter((review) => review.id !== reviewId)
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">我收藏的评论</h2>
      <ul>
        {favoriteReviews.map((review) => (
          <li
            key={review.id}
            className="bg-gray-800 text-white p-4 rounded-lg mb-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{review.userName || "匿名用户"}</div>
                <p className="text-gray-400">{review.text}</p>
                {/* 其他评论数据如日期等 */}
              </div>
              <button
                onClick={() => handleRemoveFavorite(review.id)}
                className="text-red-500 hover:text-red-700"
              >
                取消收藏
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoriteReviews;
