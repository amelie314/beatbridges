/** @format */
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
//
import { Venue } from "../types/types";
import { Review } from "../types/types";

import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../firebaseConfig";
import Map from "../components/Map";
import LocationInfo from "../components/LocationInfo";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data: Venue[] = [];
  const querySnapshot = await getDocs(collection(db, "venues"));
  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    // 确保 docData 包含 Venue 接口所需的所有字段
    const venue: Venue = {
      id: doc.id,
      Address: docData.Address,
      City: docData.City,
      District: docData.District,
      Name: docData.Name,
      // ...其他字段
    };
    data.push(venue);
  });

  return {
    props: { venues: data },
  };
};

function ConcertPage({ venues }) {
  const [user, loading, error] = useAuthState(auth); // 這裡使用 useAuthState 鉤子來獲取用戶狀態
  // 在你的組件中使用 useState 定義 reviews 狀態
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCounty, setActiveCounty] = useState(null);
  const [localVenues, setLocalVenues] = useState<Venue[]>([]);
  const router = useRouter();
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // 如果不在加載過程中，且用戶未登錄，則導向至登錄頁面
    }
  }, [user, loading, router]); // 確保依賴項中包含用戶和加載狀態

  // 确保定義了 handleVenueSelected 函數来更新 selectedVenueId 狀態
  const handleVenueSelected = (venueId) => {
    setSelectedVenueId(venueId); // 設置選中的 venueId
  };

  // 當用戶提交評論時，確保 venueId 被傳遞给 handleAddReview
  const handleAddReview = async (
    text,
    venueId,
    userId,
    performanceName,
    date
  ) => {
    if (!user || !venueId) {
      console.error("User is not logged in or venueId is not selected.");
      return;
    }

    try {
      // 創建新評論對象
      const newReview = {
        userId: user.uid,
        userName: user.displayName || "匿名用戶",
        venueId: venueId,
        text: text,
        performanceName: performanceName,
        date: date,
        createdAt: serverTimestamp(),
      };

      // 將新評論添加到 Firestore
      const docRef = await addDoc(collection(db, "reviews"), newReview);

      // 添加成功後，更新評論列表狀態
      setReviews((prevReviews) => [
        ...prevReviews,
        {
          id: docRef.id,
          ...newReview,
          createdAt: new Date(), // 因為 serverTimestamp() 需要從服務器同步，這裡只能先用客戶端時間
        },
      ]);
      alert("評論已成功提交！");
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  //

  useEffect(() => {
    const fetchVenues = async () => {
      if (activeCounty) {
        const q = query(
          collection(db, "venues"),
          where("City", "==", activeCounty)
        );
        const querySnapshot = await getDocs(q);
        const newVenues: Venue[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const venue: Venue = {
            id: doc.id,
            Address: docData.Address,
            City: docData.City,
            District: docData.District,
            Name: docData.Name,
            // ...其他字段
          };
          newVenues.push(venue);
        });
        setLocalVenues(newVenues);
        setSelectedVenueId(null);
      }
    };
    fetchVenues();
  }, [activeCounty]);

  useEffect(() => {
    // 當activeCounty更新時，調用這個effect
    if (activeCounty) {
      const filteredVenues = venues.filter(
        (venue) => venue.City === activeCounty
      );
      const districtSet = new Set(
        filteredVenues.map((venue) => venue.District)
      );
      setDistricts(Array.from(districtSet) as string[]); // 將 districtSet 轉換為 string[]
    }
  }, [activeCounty, venues]);

  useEffect(() => {
    // 清空評論列表
    setReviews([]);
    // 僅在當選中了展演空間時才獲取評論資料
    if (selectedVenueId) {
      const fetchReviews = async () => {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("venueId", "==", selectedVenueId));
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          userName: doc.data().userName,
          text: doc.data().text,
          userId: doc.data().userId,
          createdAt: doc.data().createdAt,
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          date: doc.data().date,
        }));
        setReviews(fetchedReviews as Review[]); // 使用类型断言
      };
      fetchReviews().catch(console.error);
    }
  }, [selectedVenueId]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("確定要刪除這則評論嗎？")) {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(reviews.filter((review) => review.id !== reviewId));
    }
  };
  useEffect(() => {
    const fetchReviewsAndFavorites = async () => {
      // 清空评论列表
      setReviews([]);

      if (selectedVenueId && user) {
        // 获取评论数据
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("venueId", "==", selectedVenueId));
        const querySnapshot = await getDocs(q);

        // 获取收藏状态
        const favoritesRef = collection(db, "userFavorites");
        const favQuery = query(favoritesRef, where("userId", "==", user.uid));
        const favQuerySnapshot = await getDocs(favQuery);
        const favoriteIds = new Set(
          favQuerySnapshot.docs.map((doc) => doc.data().reviewId)
        );

        // 组合评论数据和收藏状态
        const fetchedReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          userName: doc.data().userName,
          text: doc.data().text,
          userId: doc.data().userId,
          isFavorite: favoriteIds.has(doc.id),
          id: doc.id,
          createdAt: doc.data().createdAt,
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          date: doc.data().date,
        }));

        setReviews(fetchedReviews);
      }
    };

    fetchReviewsAndFavorites().catch(console.error);
  }, [selectedVenueId, user]);

  // const handleToggleFavorite = async (reviewId) => {
  //   // 检查评论是否已被当前用户收藏
  //   const favoritesRef = collection(db, "userFavorites");
  //   const q = query(
  //     favoritesRef,
  //     where("userId", "==", user.uid),
  //     where("reviewId", "==", reviewId)
  //   );

  //   const querySnapshot = await getDocs(q);
  //   if (querySnapshot.empty) {
  //     // 如果没有收藏，则添加收藏
  //     await addDoc(favoritesRef, {
  //       userId: user.uid,
  //       reviewId: reviewId,
  //     });
  //   } else {
  //     // 如果已经收藏，取消收藏（删除对应的文档）
  //     for (const docSnapshot of querySnapshot.docs) {
  //       await deleteDoc(docSnapshot.ref);
  //     }
  //   }
  // };
  const handleToggleFavorite = async (reviewId) => {
    // 检查评论是否已被当前用户收藏
    const favoritesRef = collection(db, "userFavorites");
    const q = query(
      favoritesRef,
      where("userId", "==", user.uid),
      where("reviewId", "==", reviewId)
    );

    const querySnapshot = await getDocs(q);
    let isCurrentlyFavorite = !querySnapshot.empty;

    if (isCurrentlyFavorite) {
      // 如果已经收藏，取消收藏（删除对应的文档）
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
    } else {
      // 如果没有收藏，则添加收藏
      await addDoc(favoritesRef, {
        userId: user.uid,
        reviewId: reviewId,
      });
    }

    // 更新评论的 isFavorite 状态
    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          return { ...review, isFavorite: !isCurrentlyFavorite };
        }
        return review;
      })
    );
  };

  return (
    <div className="min-h-screen flex bg-primary-color">
      {/* Flex container */}
      <div className="flex w-full max-w-5xl mx-auto">
        {/* Left side: Map component */}
        <div className="w-full md:w-1/2 p-6">
          <Map activeCounty={activeCounty} setActiveCounty={setActiveCounty} />
          <Link href="/">
            <div className="inline-block px-3 py-1 bg-green-500 text-white rounded hover:bg-tertiary-color">
              返回首頁
            </div>
          </Link>
        </div>

        {/* Right side: Selection and ReviewForm */}
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          {/* Selection menus */}
          <div className="flex flex-col space-y-4">
            {/* 展演空間選擇菜單的組件 */}
            <LocationInfo
              venues={localVenues}
              districts={districts}
              activeCounty={activeCounty}
              onVenueSelected={handleVenueSelected}
            />

            {/* 僅當選中展演空間時才顯示評論填寫表單 */}
            {selectedVenueId && user && (
              <ReviewForm
                venueId={selectedVenueId}
                userId={user.uid}
                onAddReview={handleAddReview}
              />
            )}
            <ReviewList
              reviews={reviews}
              currentUserId={user?.uid}
              onDelete={handleDeleteReview}
              onToggleFavorite={handleToggleFavorite} // 确保传递了这个函数
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
