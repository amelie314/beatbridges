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

const FavoriteReviews = ({ favoriteReviewIds }) => {
  const [favoriteReviews, setFavoriteReviews] = useState<Review[]>([]);
  const [userDetails, setUserDetails] = useState({});
  const { userInfo } = useUserContext();

  //   useEffect(() => {
  //     const fetchFavoriteReviews = async () => {
  //       try {
  //         const reviews: Review[] = [];
  //         const details = {};
  //         for (const reviewId of favoriteReviewIds) {
  //           const reviewRef = doc(db, "reviews", reviewId);
  //           const reviewSnap = await getDoc(reviewRef);
  //           if (reviewSnap.exists()) {
  //             const reviewData = reviewSnap.data() as any;
  //             reviews.push({ id: reviewSnap.id, ...reviewData });

  //             // 加載用戶詳細信息
  //             const userRef = doc(db, "users", reviewData.userId);
  //             const userSnap = await getDoc(userRef);
  //             if (userSnap.exists()) {
  //               details[reviewData.userId] = {
  //                 photoURL: userSnap.data()?.photoURL || "default-avatar.png",
  //                 userName: userSnap.data()?.username || "匿名用戶",
  //               };
  //             }
  //           }
  //         }
  //         setFavoriteReviews(reviews);
  //         setUserDetails(details);
  //       } catch (error) {
  //         console.error("Error fetching favorite reviews:", error);
  //       }
  //     };

  //     if (favoriteReviewIds && favoriteReviewIds.length > 0) {
  //       fetchFavoriteReviews();
  //     }
  //   }, [favoriteReviewIds, updatedUserData]);

  //   const handleRemoveFavorite = async (reviewId) => {
  //     if (!auth.currentUser) return; // 確保用戶已登錄

  //     // 在 userFavorites 集合中查找與當前用户和評論ID相符的文檔
  //     const favoritesRef = collection(db, "userFavorites");
  //     const q = query(
  //       favoritesRef,
  //       where("userId", "==", auth.currentUser.uid),
  //       where("reviewId", "==", reviewId)
  //     );

  //     const querySnapshot = await getDocs(q);
  //     // 如果找到了相符的文檔，則刪除他們
  //     querySnapshot.forEach(async (docSnapshot) => {
  //       await deleteDoc(docSnapshot.ref);
  //     });

  //     // 更新狀態以移除UI上的收藏評論
  //     setFavoriteReviews((prev) =>
  //       prev.filter((review) => review.id !== reviewId)
  //     );
  //   };

  //   return (
  //     <div className="bg-black p-5 w-full max-w-2xl mx-auto shadow-lg rounded-md">
  //       <h2 className="text-xl font-bold text-white mb-4 text-center">
  //         我收藏的評論
  //       </h2>
  //       <ul className="space-y-4">
  //         {favoriteReviews.map((review) => (
  //           <li key={review.id} className="border p-4 rounded-lg text-white">
  //             <div className="flex justify-between items-center">
  //               <div className="flex items-center space-x-4">
  //                 <img
  //                   src={userDetails[review.userId]?.photoURL}
  //                   alt={userDetails[review.userId]?.userName}
  //                   className="w-10 h-10 rounded-full object-cover"
  //                 />
  //                 <div className="flex flex-col">
  //                   <span className="font-bold">
  //                     {usernameNew
  //                       ? usernameNew
  //                       : userDetails[review.userId]?.userName}
  //                   </span>
  //                   <p className="text-sm">{review.text}</p>
  //                   {/* 其他评论数据如日期等 */}
  //                 </div>
  //               </div>
  //               <button
  //                 onClick={() => handleRemoveFavorite(review.id)}
  //                 className="px-4 py-2 bg-red-500 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 transition duration-150 ease-in-out"
  //               >
  //                 取消收藏
  //               </button>
  //             </div>
  //           </li>
  //         ))}
  //       </ul>
  //       {/* 可以添加一个关闭按钮或者其他元素 */}
  //     </div>
  //   );
  // };

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
    <div className="bg-black p-5 w-full max-w-2xl mx-auto shadow-lg rounded-md">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        我收藏的评论
      </h2>
      <ul className="space-y-4">
        {favoriteReviews.map((review) => (
          <li key={review.id} className="border p-4 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={userDetails[review.userId]?.photoURL}
                  alt={userDetails[review.userId]?.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-bold">
                    {userInfo?.username === review.userId
                      ? userInfo.username
                      : userDetails[review.userId]?.userName}
                  </span>
                  <p className="text-sm">{review.text}</p>
                  {/* 其他评论数据如日期等 */}
                </div>
              </div>
              <button
                onClick={() => handleRemoveFavorite(review.id)}
                className="px-4 py-2 bg-red-500 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 transition duration-150 ease-in-out"
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
