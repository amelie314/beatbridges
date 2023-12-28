/** @format */

// ReviewList.js 或 .tsx
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faTrash,
  faHeart,
  faPenToSquare,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

const ReviewList = ({
  reviews,
  currentUserId,
  onDelete,
  onToggleFavorite,
  onLike,
  onEdit,
}) => {
  const [userDetails, setUserDetails] = useState({});
  const [editingId, setEditingId] = useState(null); // 正在編輯評論的ID
  const [editingText, setEditingText] = useState(""); // 編輯中的文本

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

  // 編輯按鈕的點擊事件處理函數
  const handleEditClick = (review) => {
    setEditingId(review.id);
    setEditingText(review.text);
  };

  const handleUpdateReview = async (event, reviewId) => {
    event.preventDefault();
    await onEdit(reviewId, editingText);
    setEditingId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
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
                {/* <img
                  src={userDetails[review.userId]?.photoURL}
                  alt={userDetails[review.userId]?.userName}
                  className="w-12 h-12 rounded-full object-cover glow"
                /> */}
                <div className="relative rounded-full w-[56px] h-[56px] overflow-hidden ">
                  <Image
                    src={userDetails[review.userId]?.photoURL}
                    alt={userDetails[review.userId]?.userName}
                    className="min-w-full min-h-full glow"
                    fill
                    objectFit="cover"
                  />
                </div>
              </Link>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-300 font-semibold neon-text truncate">
                  <Link
                    href={`/profile/${userDetails[review.userId]?.userName}`}
                  >
                    {userDetails[review.userId]?.userName}
                  </Link>
                </h4>
                <span className="text-xs text-gray-300 neon-text truncate">
                  {review.date
                    ? new Date(review.date).toLocaleDateString("zh-TW")
                    : "未知日期"}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm truncate mb-1 text-gray-300">
                  {review.performanceName}
                </p>

                {editingId === review.id ? (
                  <div className="mt-2">
                    {editingId === review.id ? (
                      <form onSubmit={(e) => handleUpdateReview(e, review.id)}>
                        <div className="relative">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full mt-2 mb-2 text-sm p-4 pr-16 pt-4 border border-gray-300 rounded text-gray-700"
                          />
                          <div className="absolute top-4 right-4 flex space-x-1">
                            <button
                              type="submit"
                              className="p-1 text-white bg-blue-500 hover:bg-blue-700 rounded text-xs"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="text-xs"
                              />{" "}
                              {/* Update Icon */}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-white bg-red-500 hover:bg-red-700 rounded text-xs"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="text-xs"
                              />{" "}
                              {/* Cancel Icon */}
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-[12px] text-gray-300 break-words">
                        {review.text}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 break-words">
                    {review.text}
                  </p>
                )}
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
              {/* Edit Button */}
              {currentUserId === review.userId && (
                <button onClick={() => handleEditClick(review)}>
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="text-xs text-gray-500"
                  />
                </button>
              )}
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
