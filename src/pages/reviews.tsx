/** @format */

// src/pages/Reviews.tsx
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

const Reviews = () => {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};

    if (user) {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid)
      );
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
      });
    }

    // 清除订阅
    return () => unsubscribe();
  }, [user]);

  const handleAddReview = async (text) => {
    if (!user) return;

    await addDoc(collection(db, "reviews"), {
      userId: user.uid,
      text: text,
      createdAt: new Date(),
    });
  };

  const handleDeleteReview = async (reviewId) => {
    // 实现删除 Firestore 评论的逻辑
    if (!user) return;

    await deleteDoc(doc(db, "reviews", reviewId));
    // 更新评论列表，移除已删除的评论
    setReviews(reviews.filter((review) => review.id !== reviewId));
  };

  return (
    <div>
      <h1>评论</h1>
      {user && <ReviewForm onAddReview={handleAddReview} />}
      <ReviewList reviews={reviews} onDeleteReview={handleDeleteReview} />
    </div>
  );
};

export default Reviews;
