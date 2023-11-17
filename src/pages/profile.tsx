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
// /** @format */

// import React, { useState, useEffect } from "react";
// import { db, auth } from "../firebaseConfig";
// import { updateProfile } from "firebase/auth";
// import ReviewList from "../components/ReviewList";
// import { doc, collection, query, where, getDocs } from "firebase/firestore";

// const ProfilePage = () => {
//   const [newDisplayName, setNewDisplayName] = useState("");
//   const [favoriteReviews, setFavoriteReviews] = useState([]);

//   useEffect(() => {
//     const fetchFavoriteReviews = async () => {
//       if (auth.currentUser) {
//         // 获取用户收藏的评论 ID
//         const favoritesRef = collection(db, "userFavorites");
//         const favoritesQuery = query(
//           favoritesRef,
//           where("userId", "==", auth.currentUser.uid)
//         );
//         const favoritesSnapshot = await getDocs(favoritesQuery);
//         const favoriteReviewIds = favoritesSnapshot.docs.map(
//           (doc) => doc.data().reviewId
//         );

//         // 根据收藏的评论 ID 获取评论详情
//         const reviewsRef = collection(db, "reviews");
//         const reviewsPromises = favoriteReviewIds.map((reviewId) =>
//           getDocs(doc(reviewsRef, reviewId))
//         );
//         const reviewsDocs = await Promise.all(reviewsPromises);
//         const reviews = reviewsDocs
//           .map((docSnapshot) => {
//             if (docSnapshot.exists()) {
//               return { id: docSnapshot.id, ...docSnapshot.data() };
//             }
//             return null;
//           })
//           .filter((review) => review !== null);

//         setFavoriteReviews(reviews);
//       }
//     };

//     fetchFavoriteReviews();
//   }, []);

//   const handleUpdate = async (event) => {
//     event.preventDefault();
//     try {
//       await updateProfile(auth.currentUser, {
//         displayName: newDisplayName,
//       });
//       alert("昵称更新成功！");
//       // 可以在这里处理路由跳转或其他逻辑
//     } catch (error) {
//       alert(`昵称更新失败：${error.message}`);
//       console.error("昵称更新错误：", error);
//     }
//   };

//   return (
//     <div>
//       <h1>个人中心</h1>
//       {/* 昵称更新表单 */}
//       <form onSubmit={handleUpdate} className="space-y-4">
//         <input
//           className="text-black border border-gray-300 rounded-lg p-2"
//           type="text"
//           value={newDisplayName}
//           onChange={(e) => setNewDisplayName(e.target.value)}
//           placeholder="新的昵称"
//           required
//         />
//         <button className="bg-blue-500 text-white p-2 rounded-lg" type="submit">
//           更新昵称
//         </button>
//       </form>

//       {/* 收藏的评论列表 */}
//       <div className="mt-8">
//         <h2>我收藏的评论</h2>
//         <ReviewList
//           reviews={favoriteReviews}
//           showFavorites={false}
//           /* 其他 props */
//         />
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
