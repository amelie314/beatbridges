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

const FavoriteReviews = ({ favoriteReviewIds, currentUserId }) => {
  const [favoriteReviews, setFavoriteReviews] = useState<Review[]>([]);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchFavoriteReviews = async () => {
      const reviews: Review[] = [];
      const details = {};
      for (const reviewId of favoriteReviewIds) {
        const reviewRef = doc(db, "reviews", reviewId);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          const reviewData = reviewSnap.data() as any;
          reviews.push({ id: reviewSnap.id, ...reviewData });

          // 加載用戶詳細信息
          const userRef = doc(db, "users", reviewData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            details[reviewData.userId] = {
              photoURL: userSnap.data()?.photoURL || "default-avatar.png",
              userName: userSnap.data()?.username || "匿名用戶",
            };
          }
        }
      }
      setFavoriteReviews(reviews);
      setUserDetails(details);
    };

    if (favoriteReviewIds && favoriteReviewIds.length > 0) {
      fetchFavoriteReviews();
    }
  }, [favoriteReviewIds]);

  const handleRemoveFavorite = async (reviewId) => {
    if (!auth.currentUser) return; // 確保用戶已登錄

    // 在 userFavorites 集合中查找與當前用户和評論ID相符的文檔
    const favoritesRef = collection(db, "userFavorites");
    const q = query(
      favoritesRef,
      where("userId", "==", auth.currentUser.uid),
      where("reviewId", "==", reviewId)
    );

    const querySnapshot = await getDocs(q);
    // 如果找到了相符的文檔，則刪除他們
    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(docSnapshot.ref);
    });

    // 更新狀態以移除UI上的收藏評論
    setFavoriteReviews((prev) =>
      prev.filter((review) => review.id !== reviewId)
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">我收藏的評論</h2>
      <ul>
        {favoriteReviews.map((review) => (
          <li
            key={review.id}
            className="bg-primary-color text-white p-4 rounded-lg mb-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <img
                  src={userDetails[review.userId]?.photoURL}
                  alt={userDetails[review.userId]?.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="font-bold">
                  {userDetails[review.userId]?.userName}
                </div>
                <p className="text-gray-400">{review.text}</p>
                {/* 其他評論數據如日期等 */}
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
