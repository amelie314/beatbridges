/** @format */

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useUserContext } from "../contexts/UserContext";
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
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

const FavoriteReviews = ({ favoriteReviewIds, venuesData }) => {
  const [favoriteReviews, setFavoriteReviews] = useState<Review[]>([]);
  const [userDetails, setUserDetails] = useState({});
  const { userInfo } = useUserContext();

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

          // 加載每個評論的用戶詳細信息
          const userRef = doc(db, "users", reviewData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            details[reviewData.userId] = {
              photoURL: userSnap.data()?.photoURL || "default-avatar.png",
              userName: userSnap.data()?.username || "匿名用户",
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
  }, [favoriteReviewIds, userInfo]); // 添加 userInfo 作為依賴

  const handleRemoveFavorite = async (reviewId) => {
    if (!auth.currentUser) return; // 确保用户已登录

    // 在 userFavorites 集合中查找与当前用户和评论ID相符的文档
    const favoritesRef = collection(db, "userFavorites");
    const q = query(
      favoritesRef,
      where("userId", "==", auth.currentUser.uid),
      where("reviewId", "==", reviewId)
    );

    const querySnapshot = await getDocs(q);
    // 如果找到了相符的文档，则删除它们
    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(docSnapshot.ref);
    });

    // 更新状态以移除UI上的收藏评论
    setFavoriteReviews((prev) =>
      prev.filter((review) => review.id !== reviewId)
    );
  };

  return (
    <div className="p-5 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        我收藏的評論
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteReviews.map((review) => (
          <div
            key={review.id}
            className="bg-primary-color  rounded-lg shadow-lg flex flex-col justify-between p-4 h-full "
          >
            <div>
              {/* 使用 Link 包裹用戶名和大頭貼 */}
              <Link
                href={`/profile/${userDetails[review.userId]?.userName}`}
                passHref
              >
                <div className="flex items-center space-x-3">
                  {/* 顯示場地名稱 */}
                  <img
                    src={userDetails[review.userId]?.photoURL}
                    alt={userDetails[review.userId]?.userName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white text-lg font-semibold">
                      {userDetails[review.userId]?.userName}
                    </h4>
                    <p className="text-xs text-white mt-1">
                      {review.date
                        ? new Date(review.date).toLocaleDateString("zh-TW")
                        : "未知日期"}
                    </p>
                    <span>{venuesData[review.venueId]}</span>
                    {review.performanceName && (
                      <p className="text-sm text-white mt-1 truncate">
                        {review.performanceName}
                      </p>
                    )}

                    <p className="text-sm">{review.text}</p>
                    {/* 其他评论数据如日期等 */}
                  </div>
                </div>
              </Link>
            </div>
            {/* 按钮放在这里，确保它总是在底部 */}
            <button
              onClick={() => handleRemoveFavorite(review.id)}
              className="mt-4 text-sm py-2 px-4 rounded transition duration-300 self-end"
            >
              <FontAwesomeIcon
                icon={faFolder}
                className="text-xs hover:text-red-700 text-[#FF2F40]"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteReviews;
