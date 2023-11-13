/** @format */
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import ReviewForm from "../components/ReviewForm";

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

// 这里获取服务器端数据
export const getServerSideProps: GetServerSideProps = async (context) => {
  let data = [];

  // 在服务器端从 Firebase 获取数据
  const querySnapshot = await getDocs(collection(db, "venues"));

  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  // 将 venues 数据作为 props 传递给页面
  return {
    props: { venues: data },
  };
};

interface CommentItem {
  id: string;
  text: string;
  // 可根据需要添加其他属性
}

function ConcertPage({ venues }) {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activeCounty, setActiveCounty] = useState(null);
  const [localVenues, setLocalVenues] = useState([]); // 使用从服务器获取的venues初始化
  const router = useRouter();
  const [districts, setDistricts] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  console.log("Rendering ReviewForm with venueId: ", selectedVenueId);

  // 检查用户登录状态
  useEffect(() => {
    if (user) {
      fetchComments(user.uid);
    } else {
      router.push("/login");
    }
  }, [user, router]);

  // 确保定义了 handleVenueSelected 函数来更新 selectedVenueId 状态
  const handleVenueSelected = (venueId) => {
    setSelectedVenueId(venueId); // 设置选中的 venueId
  };

  // 当用户提交评论时，确保 venueId 被传递给 handleAddReview
  const handleAddReview = async (text, venueId) => {
    if (!user || !venueId) {
      // 用户未登录或未选择场馆
      console.error("User is not logged in or venueId is not selected.");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        venueId: venueId,
        text,
        createdAt: serverTimestamp(),
      });
      // 在这里您可以添加状态更新或UI反馈，例如：
      alert("评论已成功提交！");
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  // 获取评论数据
  const fetchComments = async (userId: string) => {
    const commentsColRef = collection(db, "users", userId, "comments");
    const commentsSnapshot = await getDocs(commentsColRef);
    const commentsData = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { text: string }),
    }));
    setComments(commentsData);
  };

  useEffect(() => {
    const fetchVenues = async () => {
      if (activeCounty) {
        const q = query(
          collection(db, "venues"),
          where("City", "==", activeCounty)
        );
        const querySnapshot = await getDocs(q);
        const newVenues = [];
        querySnapshot.forEach((doc) => {
          newVenues.push({ id: doc.id, ...doc.data() });
        });
        setLocalVenues(newVenues); // 注意这里是setLocalVenues，不是setVenues
      }
    };

    fetchVenues();
  }, [activeCounty]);
  useEffect(() => {
    // 当activeCounty更新时，调用这个effect
    if (activeCounty) {
      const filteredVenues = venues.filter(
        (venue) => venue.City === activeCounty
      );
      const districtSet = new Set(
        filteredVenues.map((venue) => venue.District)
      );
      setDistricts(Array.from(districtSet));
    }
  }, [activeCounty, venues]);

  return (
    <div className="min-h-screen flex items-center pl-[150px] bg-primary-color">
      {/* Flex container with max width set */}
      <div className="flex w-full max-w-6xl mx-auto">
        {/* Left side: Map component */}
        <div className="bg-primary-color p-6 rounded-lg shadow-md w-full max-w-md">
          <Map activeCounty={activeCounty} setActiveCounty={setActiveCounty} />
          <Link href="/">
            <div className="block px-3 py-1 bg-light-purple text-gray-700 rounded hover:bg-purple-300">
              返回首页
            </div>
          </Link>
        </div>
        <div className="flex-1 p-6 rounded-lg shadow-md bg-primary-color ml-[100px]">
          <LocationInfo
            venues={localVenues}
            districts={districts}
            activeCounty={activeCounty}
            onVenueSelected={handleVenueSelected} // 这里传递了handleVenueSelected作为onVenueSelected属性
          />
        </div>
        <div className="flex flex-col space-y-4">
          <div className="venue-selector">
            {/* 展演空间选择菜单的组件或逻辑 */}
            {/* {user && (
              <ReviewForm
                venueId={selectedVenueId} // 确保这是有效的场馆 ID
                userId={user.uid} // 用户 ID
                onAddReview={handleAddReview} // 处理评论添加的函数
              />
            )} */}
            {user && (
              <ReviewForm
                venueId={selectedVenueId} // 传递选中的场馆 ID
                userId={user.uid}
                onAddReview={handleAddReview}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
