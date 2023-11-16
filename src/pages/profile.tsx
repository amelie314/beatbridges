/** @format */

import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import UserInfoForm from "../components/UserInfoForm";
import FavoriteReviews from "../components/FavoriteReviews";
import { auth, db } from "../firebaseConfig";

const Profile = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);

  // profile.tsx 页面
  useEffect(() => {
    if (user) {
      // 获取用户收藏的评论
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, "userFavorites");
        const q = query(favoritesRef, where("userId", "==", user.uid));

        const querySnapshot = await getDocs(q);
        const favoritesData = [];
        querySnapshot.forEach((doc) => {
          favoritesData.push(doc.data().reviewId); // 存储收藏的评论 ID
        });

        // 你还需要根据这些 ID 获取实际的评论数据，并更新 favorites 状态
        setFavorites(favoritesData);
      };

      fetchFavorites();
    }
  }, [user]);

  // 取消收藏的处理函数
  const handleRemoveFavorite = async (reviewId) => {
    // 根据 reviewId 和 userId 来定位 Firestore 中的记录
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
    <div className="profile-page">
      {user && (
        <>
          {/* ...其他组件 */}
          <FavoriteReviews
            favoriteReviewIds={favorites}
            currentUserId={user?.uid} // 确保这里传递了当前用户的 ID
          />
        </>
      )}
    </div>
  );
};

export default Profile;
