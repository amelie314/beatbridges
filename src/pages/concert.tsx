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
import LoginModal from "../components/LoginModal";
import { increment, updateDoc } from "firebase/firestore";

import {
  collection,
  getDocs,
  doc,
  getDoc,
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
    // 確保 docData 包含 Venue 接口所需的所有字段
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
  // 在組件中使用 useState 定義狀態
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCounty, setActiveCounty] = useState(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [localVenues, setLocalVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true); // 加載狀態

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
      const newReview = {
        userId: user.uid,
        venueId: venueId,
        text: text,
        performanceName: performanceName,
        date: date,
        createdAt: serverTimestamp(),
        likes: 0,
      };

      const docRef = await addDoc(collection(db, "reviews"), newReview);
      setReviews([...reviews, { id: docRef.id, ...newReview }]);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  // 加載評論
  useEffect(() => {
    if (selectedVenueId) {
      setReviewsLoading(true);
      const fetchReviews = async () => {
        const q = query(
          collection(db, "reviews"),
          where("venueId", "==", selectedVenueId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(fetchedReviews as Review[]); // 使用類型斷言，假設所有必要的字段都存在
        setReviewsLoading(false);
      };
      fetchReviews();
    }
  }, [selectedVenueId]);

  // 處理點讚
  const handleLike = async (reviewId) => {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, { likes: increment(1) });

    const updatedReviewDoc = await getDoc(reviewRef);
    const updatedLikes = updatedReviewDoc.data()?.likes;

    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, likes: updatedLikes } : review
      )
    );
  };
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
          text: doc.data().text,
          userId: doc.data().userId,
          createdAt: doc.data().createdAt,
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          date: doc.data().date,
          likes: doc.data().likes,
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
      // 清空評論列表
      setReviews([]);

      if (selectedVenueId && user) {
        // 獲取評論數據
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("venueId", "==", selectedVenueId));
        const querySnapshot = await getDocs(q);

        // 獲取收藏狀態
        const favoritesRef = collection(db, "userFavorites");
        const favQuery = query(favoritesRef, where("userId", "==", user.uid));
        const favQuerySnapshot = await getDocs(favQuery);
        const favoriteIds = new Set(
          favQuerySnapshot.docs.map((doc) => doc.data().reviewId)
        );

        // 組合評論數據和收藏狀態
        const fetchedReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          userId: doc.data().userId,
          isFavorite: favoriteIds.has(doc.id),
          createdAt: doc.data().createdAt,
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          date: doc.data().date,
          likes: doc.data().likes,
        }));

        setReviews(fetchedReviews);
      }
    };

    fetchReviewsAndFavorites().catch(console.error);
  }, [selectedVenueId, user]);

  const handleToggleFavorite = async (reviewId) => {
    if (!user) {
      setShowLoginModal(true); // 如果用户未登錄，顯示登錄對話框
      console.error("User is not logged in.");
      return;
    }
    // 檢查評論是否已經被當前用戶收藏
    const favoritesRef = collection(db, "userFavorites");
    const q = query(
      favoritesRef,
      where("userId", "==", user.uid),
      where("reviewId", "==", reviewId)
    );

    const querySnapshot = await getDocs(q);
    let isCurrentlyFavorite = !querySnapshot.empty;

    if (isCurrentlyFavorite) {
      // 如果已经收藏，取消收藏（刪除對應的文檔）
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
    } else {
      // 如果没有收藏，則添加收藏（添加新文檔）
      await addDoc(favoritesRef, {
        userId: user.uid,
        reviewId: reviewId,
      });
    }

    // 更新評論的 isFavorite 狀態
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
      <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        {/* Left side: Map component */}
        <div className="w-full md:w-1/2 p-10">
          <Map activeCounty={activeCounty} setActiveCounty={setActiveCounty} />
        </div>

        {/* Right side: Selection and ReviewForm */}
        <div className="w-full  md:w-1/3 p-5 flex flex-col">
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
              onToggleFavorite={handleToggleFavorite}
              onLike={handleLike}
            />

            {showLoginModal && (
              <LoginModal
                show={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onShowSignup={() => {
                  /* 如果你需要处理注册逻辑 */
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
