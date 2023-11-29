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
          className={`bg-primary-color p-4  ${
            index === 0
              ? "border-y border-[#525252]"
              : "border-b border-[#525252]"
          }`}
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
          <div className="flex flex-col items-end space-y-1 mt-2">
            {/* Icon Row */}
            <div className="flex space-x-2">
              {/* Like Button */}
              <button onClick={() => onLike(review.id)}>
                <FontAwesomeIcon
                  icon={faHeart}
                  className={`text-xs ${
                    review.likes > 0 ? "text-red-500" : "text-gray-500"
                  }`}
                />
              </button>

              {/* Favorite Button */}
              <button onClick={() => onToggleFavorite(review.id)}>
                <FontAwesomeIcon
                  icon={faFolder}
                  className={`text-xs ${
                    review.isFavorite ? "text-[#FF2F40]" : "text-gray-500"
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
            <span className="text-gray-500 text-sm">
              {review.likes > 0 ? `${review.likes} 個讚` : "0 個讚"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
