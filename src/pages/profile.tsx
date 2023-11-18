/** @format */
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import FavoriteReviews from "../components/FavoriteReviews";
import { auth, db } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";

// profile.tsx 页面
const ProfilePage = () => {
  const [newDisplayName, setNewDisplayName] = useState("");
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState<string[]>([]); // Define favorites as an array of strings

  const handleUpdate = async (event) => {
    event.preventDefault();
    // Check if currentUser exists before updating the profile
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: newDisplayName,
        });
        alert("暱稱更新成功！");
        // 可以在這裡處理路由跳轉或其他邏輯
      } catch (error) {
        alert(`暱稱更新失敗：${error.message}`);
        console.error("暱稱更新錯誤：", error);
      }
    } else {
      alert("用戶未登錄，無法更新暱稱。");
    }
  };

  // profile.tsx 页面
  useEffect(() => {
    if (user) {
      // 獲取用戶收藏的評論
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, "userFavorites");
        const q = query(favoritesRef, where("userId", "==", user.uid));

        const querySnapshot = await getDocs(q);
        const favoritesData: string[] = [];
        querySnapshot.forEach((doc) => {
          favoritesData.push(doc.data().reviewId); // 儲存收藏的評論ID
        });

        // 更新 favorites 狀態
        setFavorites(favoritesData);
      };

      fetchFavorites();
    }
  }, [user]);

  // 取消收藏的处理函数
  const handleRemoveFavorite = async (reviewId) => {
    // 根据 reviewId 来定位 Firestore 中的记录
    const favoriteRef = doc(db, "userFavorites", reviewId);

    try {
      // 刪除紀錄
      await deleteDoc(favoriteRef);
      // 更新组件状态以移除取消收藏的评论
      setFavorites((prevFavorites) =>
        prevFavorites.filter(
          (favoriteReviewId) => favoriteReviewId !== reviewId
        )
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
    <div className="profile-page">
      <h1>個人中心</h1>

      {/* 暱稱更新表單 */}
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          className="text-black border border-gray-300 rounded-lg p-2"
          type="text"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          placeholder="新的暱稱"
          required
        />
        <button className="bg-blue-500 text-white p-2 rounded-lg" type="submit">
          更新暱稱
        </button>
      </form>

      {/* 收藏的评论列表 */}
      <div className="mt-8">
        <h2>我收藏的評論</h2>
        {user && (
          <>
            {/* ...其他组件 */}
            <FavoriteReviews
              favoriteReviewIds={favorites}
              currentUserId={user?.uid} // 確保這裡傳遞了當前用戶的ID
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
