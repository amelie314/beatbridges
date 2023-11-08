/** @format */

// export default Accounting;
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";

import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
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

// interface RecordItem {
//   id: string;
//   amount: number;
//   detail: string;
// }
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

  // 检查用户登录状态
  useEffect(() => {
    if (user) {
      fetchComments(user.uid);
    } else {
      router.push("/login");
    }
  }, [user, router]);

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

  // 添加评论到Firestore
  const addCommentToFirestore = async (newComment: { text: string }) => {
    if (!user) return;
    const commentsColRef = collection(db, "users", user.uid, "comments");
    await addDoc(commentsColRef, newComment);
    fetchComments(user.uid); // 重新获取评论数据
  };

  // 从Firestore删除评论
  const deleteCommentFromFirestore = async (commentId: string) => {
    if (!user || !commentId) return;
    const commentRef = doc(db, "users", user.uid, "comments", commentId);
    await deleteDoc(commentRef);
    fetchComments(user.uid); // 重新获取评论数据
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
          <LocationInfo venues={localVenues} />
        </div>
      </div>
    </div>
  );
}

export default ConcertPage;
