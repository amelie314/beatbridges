/** @format */
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
// Concert.tsx 和 LocationInfo.tsx
import { Venue } from "../types/types";
// ...组件的其余代码

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

// 假設 Review 的類型如下
interface Review {
  id: string;
  createdAt: Date;
  userId: string;
  userName: string;
  venueId: string;
  text: string;
  performanceName: string;
  date: string;
}

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
          // 确保这里包含了所有 Review 类型所需的属性
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

  return (
    <div className="min-h-screen flex bg-primary-color">
      {/* Flex container */}
      <div className="flex w-full max-w-5xl mx-auto">
        {/* Left side: Map component */}
        <div className="w-full md:w-1/2 p-6">
          <Map activeCounty={activeCounty} setActiveCounty={setActiveCounty} />
          <Link href="/">
            <div className="inline-block px-3 py-1 bg-light-purple text-gray-700 rounded hover:bg-purple-300">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
