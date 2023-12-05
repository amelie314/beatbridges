/** @format */

// ReviewList.js 或 .tsx
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faTrash, faHeart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ReviewList = ({
  reviews,
  currentUserId,
  onDelete,
  onToggleFavorite,
  onLike,
}) => {
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
      console.log(newDetails);

      setUserDetails(newDetails);
    };

    loadUserDetails();
  }, [reviews]);

  return (
    <div>
      {reviews.map((review, index) => (
        <div
          key={review.id}
          className={`bg-primary-color p-4 ${
            index === 0
              ? "border-y border-[#525252]"
              : "border-b border-[#525252]"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-1">
              <Link href={`/profile/${userDetails[review.userId]?.userName}`}>
                <img
                  src={userDetails[review.userId]?.photoURL}
                  alt={userDetails[review.userId]?.userName}
                  className="w-12 h-12 rounded-full object-cover glow"
                />
              </Link>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold neon-text truncate">
                  <Link
                    href={`/profile/${userDetails[review.userId]?.userName}`}
                  >
                    {userDetails[review.userId]?.userName}
                  </Link>
                </h4>
                <span className="text-xs neon-text truncate">
                  {review.date
                    ? new Date(review.date).toLocaleDateString("zh-TW")
                    : "未知日期"}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm truncate">{review.performanceName}</p>
                <p className="text-sm text-gray-300 mt-1 break-words">
                  {review.text}
                </p>
              </div>
            </div>
          </div>

          {/* Icon and Likes Count Container */}
          <div className="flex flex-col items-end mt-1">
            {/* Icon Row */}
            <div className="flex space-x-3">
              {/* Like Button */}
              <button onClick={() => onLike(review.id)}>
                <FontAwesomeIcon
                  icon={faHeart}
                  className={`text-xs ${
                    review.likes > 0 ? "text-[#BA3939]" : "text-gray-500"
                  }`}
                />
              </button>
              {/* Favorite Button */}
              <button onClick={() => onToggleFavorite(review.id)}>
                <FontAwesomeIcon
                  icon={faFolder}
                  className={`text-xs ${
                    review.isFavorite ? "text-[#BA3939]" : "text-gray-500"
                  }`}
                />
              </button>
              {/* Trash Button */}
              {currentUserId === review.userId && (
                <button onClick={() => onDelete(review.id)}>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-xs text-gray-500"
                  />
                </button>
              )}
            </div>

            {/* Likes Count Row */}
            <span className="text-gray-500 text-sm mt-1">
              {review.likes > 0 ? `${review.likes} 個讚` : "0 個讚"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
