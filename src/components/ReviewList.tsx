/** @format */

// ReviewList.js 或 .tsx
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ReviewList = ({ reviews, currentUserId, onDelete, onToggleFavorite }) => {
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const loadUserDetails = async () => {
      const newDetails = {};
      for (const review of reviews) {
        const userDoc = await getDoc(doc(db, "users", review.userId));
        newDetails[review.userId] = {
          photoURL: userDoc.data()?.photoURL || "default-avatar.png",
          userName: userDoc.data()?.username || "匿名用戶",
        };
      }
      setUserDetails(newDetails);
    };
    loadUserDetails();
  }, [reviews]);

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-primary-color border border-[#585858] p-4 rounded-lg"
        >
          <div className="grid grid-cols-12 items-center gap-4 mb-2">
            <div className="col-span-2">
              <Link href={`/profile/${userDetails[review.userId]?.userName}`}>
                <img
                  src={userDetails[review.userId]?.photoURL}
                  alt={userDetails[review.userId]?.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </Link>
            </div>
            <div className="col-span-10">
              <div className="grid grid-cols-12 items-center">
                <h4 className="col-span-5 text-sm font-semibold text-white truncate">
                  <Link
                    href={`/profile/${userDetails[review.userId]?.userName}`}
                  >
                    {userDetails[review.userId]?.userName}
                  </Link>
                </h4>
                <span className="col-span-7 text-xs text-white font-bold text-right">
                  {review.date
                    ? new Date(review.date).toLocaleDateString("zh-TW")
                    : "未知日期"}
                </span>
              </div>
              <p className="text-sm text-white mt-1 truncate">
                {review.performanceName}
              </p>
              <p className="text-xs text-white mt-1">{review.text}</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => onToggleFavorite(review.id)}
              className={`text-xs ${
                review.isFavorite
                  ? "text-[#FF2F40] font-bold hover:text-[#FF2F40]"
                  : "text-white font-bold hover:text-[#FF2F40]"
              } `}
            >
              {review.isFavorite ? (
                <>
                  <FontAwesomeIcon icon={faFolder} />
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFolder} />
                </>
              )}
            </button>

            {currentUserId === review.userId && (
              <button
                onClick={() => onDelete(review.id)}
                className="text-xs text-white hover:text-red-800"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
