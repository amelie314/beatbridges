/** @format */
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { GetServerSideProps } from "next";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
//
import { Venue } from "../types/types";
import { Review } from "../types/types";
import LoginModal from "../components/LoginModal";
import { increment, updateDoc } from "firebase/firestore";
import { useJoyride } from "../contexts/JoyrideContext";
import dynamic from "next/dynamic";
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  setDoc,
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {
    runJoyride,
    joyrideSteps,
    startJoyride,
    stopJoyride,
    updateJoyrideSteps,
  } = useJoyride();

  // 确保定義了 handleVenueSelected 函數来更新 selectedVenueId 狀態
  const handleVenueSelected = (venueId) => {
    setSelectedVenueId(venueId); // 設置選中的 venueId
  };
  //排序函數
  const sortReviews = (reviews: Review[]) => {
    return reviews.sort((a, b) => b.createdAt - a.createdAt); // 降序排序
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
      const currentTime = new Date().getTime(); // 獲取客戶端當前時間
      const newReview = {
        userId: user.uid,
        venueId: venueId,
        text: text,
        performanceName: performanceName,
        date: date,
        createdAt: currentTime, // 使用客戶端時間而不是 serverTimestamp()
        likes: 0,
      };

      //   const docRef = await addDoc(collection(db, "reviews"), newReview);
      //   setReviews([...reviews, { id: docRef.id, ...newReview }]);
      // } catch (error) {
      //   console.error("Error adding review:", error);
      // }
      const docRef = await addDoc(collection(db, "reviews"), {
        ...newReview,
        createdAt: serverTimestamp(), // 確保 Firestore 中的記錄使用服務器時間戳
      });

      // 將新評論添加到評論陣列，並根據 createdAt 進行排序
      setReviews(sortReviews([...reviews, { ...newReview, id: docRef.id }]));
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  // 處理點讚
  const handleLike = async (reviewId) => {
    if (!user) {
      setShowLoginModal(true); // 如果用户未登錄，顯示登錄對話框
      return;
    }

    const reviewRef = doc(db, "reviews", reviewId);
    const userLikeRef = doc(db, "userLikes", `${user.uid}_${reviewId}`);
    const userLikeDoc = await getDoc(userLikeRef);

    if (userLikeDoc.exists()) {
      // 如果已點讚，取消讚
      await deleteDoc(userLikeRef);
      await updateDoc(reviewRef, { likes: increment(-1) });
    } else {
      // 如果未點讚，增加讚
      await setDoc(userLikeRef, {
        userId: user.uid,
        reviewId: reviewId,
      });
      await updateDoc(reviewRef, { likes: increment(1) });
    }

    // 更新 reviews 狀態
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
        let fetchedReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          userId: doc.data().userId,
          createdAt: doc.data().createdAt.toDate().getTime(), // 將 Timestamp 轉換為毫秒時間戳
          // favoritedAt: doc.data().favoritedAt
          //   ? doc.data().favoritedAt.toDate().getTime()
          //   : undefined, // 可選，同樣轉換
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          date: doc.data().date,
          likes: doc.data().likes,
        }));

        // 對評論按日期進行降序排序
        setReviews(sortReviews(fetchedReviews as Review[]));
      };
      fetchReviews().catch(console.error);
    }
  }, [selectedVenueId]);

  useEffect(() => {
    const fetchAndProcessReviews = async () => {
      if (selectedVenueId) {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("venueId", "==", selectedVenueId));
        const querySnapshot = await getDocs(q);
        let fetchedReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          userId: doc.data().userId,
          createdAt: doc.data().createdAt.toDate().getTime(), // 將 Timestamp 轉換為毫秒時間戳
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          date: doc.data().date,
          likes: doc.data().likes,
        }));

        // 如果用户已登錄，檢查評論的點讚狀態
        if (user) {
          const userLikesRef = collection(db, "userLikes");
          const userLikesQuery = query(
            userLikesRef,
            where("userId", "==", user.uid)
          );
          const userLikesSnapshot = await getDocs(userLikesQuery);
          const likedReviewIds = new Set(
            userLikesSnapshot.docs.map((doc) => doc.data().reviewId)
          );

          fetchedReviews = fetchedReviews.map((review) => ({
            ...review,
            isLikedByCurrentUser: likedReviewIds.has(review.id),
          }));
        }

        // 使用排序函數並更新評論狀態
        setReviews(sortReviews(fetchedReviews as Review[]));
      }
    };

    fetchAndProcessReviews().catch(console.error);
  }, [selectedVenueId, user]);

  //刪除評
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("確定要刪除這則評論嗎？")) {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(reviews.filter((review) => review.id !== reviewId));
    }
  };
  //
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
          date: doc.data().date,
          createdAt: doc.data().createdAt.toDate().getTime(), // 將 Timestamp 轉換為毫秒時間戳
          venueId: doc.data().venueId,
          performanceName: doc.data().performanceName,
          likes: doc.data().likes,
        }));

        // 使用排序函數
        setReviews(sortReviews(fetchedReviews));
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
        favoritedAt: serverTimestamp(), // 儲存收藏的時間戳
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
            <Joyride
              steps={joyrideSteps}
              run={runJoyride}
              callback={(data) => {
                if (data.status === "finished" || data.status === "skipped") {
                  stopJoyride();
                }
              }}
              locale={{
                last: "Finish", // 最後一步的按鈕文本
                next: "Next", // 下一步的按鈕文本
                skip: "Skip", // 跳過按鈕文本
                close: "Close", // 關閉按鈕文本
              }}
              showSkipButton={true}
              showProgress={true}
              continuous={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
