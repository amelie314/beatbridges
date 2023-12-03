/** @format */

// pages/profile/[username].tsx
import { useUserContext } from "../../contexts/UserContext";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  query,
  collection,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Modal from "../../components/Modal";
import FavoriteReviews from "../../components/FavoriteReviews";
import { UserData } from "../../types/types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCircleChevronDown,
  faCircleChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const UserProfile = () => {
  const router = useRouter();
  const { username } = router.query;
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { userInfo, setUserInfo } = useUserContext();
  const [isCurrentUser, setIsCurrentUser] = useState(false); // 添加這行來定義 isCurrentUser

  const [displayName, setDisplayName] = useState("");
  const [editableUsername, setEditableUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState(null);
  const [userReviews, setUserReviews] = useState([]); // 用於存儲用戶評論的狀態
  const [venues, setVenues] = useState({}); // 用於存儲場地資訊的狀態
  const [isUpdating, setIsUpdating] = useState(false); // 新增狀態來追蹤更新狀態

  // 用於控制顯示的評論數量
  const [isExpanded, setIsExpanded] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(
    user?.photoURL || "default-profile.png"
  );

  const toggleReviews = () => {
    console.log("Toggling reviews");
    setIsExpanded(!isExpanded);
  };

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("useEffect 開始執行- fetchUserData", { username, user });
      if (username) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const fetchedUserData = querySnapshot.docs[0].data() as UserData; // 使用類型斷言
            setUserData(fetchedUserData);
            setIsCurrentUser(user?.uid === fetchedUserData.uid);
            console.log("userData", fetchedUserData);
          } else {
            console.log("No user found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (isCurrentUser && userData) {
      setDisplayName(userData.displayName || "");
      setBio(userData.bio || "");
      setProfilePicUrl(userData.photoURL || "default-profile.png");
      setEditableUsername(userData.username || ""); // 設計 editableUsername 的初始值
    }
  }, [isCurrentUser, userData, user]);

  useEffect(() => {
    if (user && isCurrentUser) {
      // 假設您的用戶收藏資料存儲在 'userFavorites' 集合中
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, "userFavorites");
        const q = query(favoritesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const newFavorites: string[] = [];
        querySnapshot.forEach((doc) => {
          newFavorites.push(doc.data().reviewId);
        });
        setFavorites(newFavorites);
      };
      fetchFavorites();
    }
  }, [user, isCurrentUser]);

  // 正規表達式來驗證用戶名是否符合規則
  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9.\-_]+$/;
    return regex.test(username);
  };

  const handleUpdate = useCallback(
    async (event) => {
      event.preventDefault();
      setIsUpdating(true); // 開始更新，禁用保存按鈕

      if (!user) {
        alert("用戶未登錄，無法更新個人資料。");
        setIsUpdating(false); // 更新失敗，啟用保存按鈕
        return;
      }

      // 檢查用戶名是否符合規則
      if (!validateUsername(editableUsername)) {
        alert(
          "用戶名格式不正確，請確保它只包含字母、數字以及標點符號（例如：username.123）。"
        );
        setIsUpdating(false); // 更新失敗，啟用保存按鈕
        return;
      }

      // 如果有選擇圖片，則先上傳圖片
      let profileUrl = user.photoURL; // 使用已經存在的 photoURL 作為預設值
      if (selectedFile) {
        try {
          const storageRef = ref(storage, `profilePics/${user.uid}`);
          const uploadTaskSnapshot = await uploadBytes(
            storageRef,
            selectedFile
          );
          const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
          profileUrl = downloadURL; // 更新為新上傳的圖片 URL
          await updateProfile(user, { photoURL: downloadURL });
        } catch (error) {
          console.error("圖片上傳錯誤：", error);
          alert("圖片上傳失敗：" + error.message);
          setIsUpdating(false); // 上傳失敗，啟用保存按鈕
          return;
        }
      }

      // 更新其他用戶資料
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          username: editableUsername,
          bio,
          displayName,
          photoURL: profileUrl, // 使用最新的圖片 URL 或者原有的 URL
        });

        // 更新本地狀態和 Context
        setUserData({
          ...userData,
          displayName,
          username: editableUsername,
          bio,
          photoURL: profileUrl,
        });
        setUserInfo({
          ...userInfo,
          displayName,
          username: editableUsername,
          bio,
          photoURL: profileUrl,
        });

        alert("個人資料更新成功");
        if (editableUsername !== username) {
          router.push(`/profile/${editableUsername}`);
        }
      } catch (error) {
        console.error("更新用戶資料錯誤：", error);
        alert("更新用戶資料失敗：" + error.message);
      }

      setIsUpdating(false); // 更新完成，啟用保存按鈕
      setShowModal(false); // 關閉 Modal
    },
    [router, setUserInfo, userData, username]
  );
  // 加載用戶的評論和相關場地資訊
  useEffect(() => {
    const fetchUserReviewsAndVenues = async () => {
      // 確保 userData 有效
      if (!userData || !userData.uid) return;

      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("userId", "==", userData.uid));
        const querySnapshot = await getDocs(q);

        const venuesData = {}; // 暫存場地資訊
        const reviewsData = await Promise.all(
          querySnapshot.docs.map(async (reviewDoc) => {
            const reviewData = reviewDoc.data();
            const venueRef = doc(db, "venues", reviewData.venueId); // 這裡使用不同的名稱來避免衝突
            const venueSnap = await getDoc(venueRef);

            // 如果場地資訊還未加載，則加載並保存到 venuesData
            if (!venuesData[reviewData.venueId] && venueSnap.exists()) {
              venuesData[reviewData.venueId] = venueSnap.data().Name; // 假設場地集合中有 "Name" 欄位
            }

            return {
              id: reviewDoc.id,
              ...reviewData,
              venueName: venuesData[reviewData.venueId],
            };
          })
        );

        setUserReviews(reviewsData); // 設置評論
        setVenues(venuesData); // 設置場地資訊
      } catch (error) {
        console.error("Error fetching user reviews and venues:", error);
      }
    };

    fetchUserReviewsAndVenues();
  }, [userData]);

  // 取消收藏的處理函數
  const handleRemoveFavorite = async (reviewId) => {
    // 根据 reviewId 来定位 Firestore 中的记录
    const favoriteRef = doc(db, "userFavorites", reviewId);

    try {
      // 刪除紀錄
      await deleteDoc(favoriteRef);
      // 更新组件狀態以移除取消收藏的評論
      setFavorites((prevFavorites) =>
        prevFavorites.filter(
          (favoriteReviewId) => favoriteReviewId !== reviewId
        )
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const userProfileInfo = userData ? (
    // <div className="relative mx-auto mt-12 p-5 w-80 shadow-lg rounded-md  bg-[#F6F1E6]">
    <div className="relative mx-auto mt-12 p-5 w-4/5 sm:w-96 lg:w-80 shadow-lg rounded-md bg-[#F6F1E6]">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-500">
          User Profile
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Personal details and application.
        </p>
      </div>
      <div className="border-t border-gray-200 border rounded-md">
        <dl>
          {/* Username  */}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-t-md">
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd className="mt-1 text-sm text-gray-800 sm:col-span-2 sm:mt-0">
              {userData.username || "No username"}
            </dd>
          </div>
          {/* Full name 栏目 */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-800 sm:col-span-2 sm:mt-0">
              {userData.displayName}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Profile picture
            </dt>
            <dd className="mt-1 text-sm text-gray-800 sm:col-span-2 sm:mt-0">
              <img
                src={`${
                  userData.photoURL || "default-profile.png"
                }?${new Date().getTime()}`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-b-md">
            <dt className="text-sm font-medium text-gray-500">Bio</dt>
            <dd className="mt-1 text-sm text-gray-800 sm:col-span-2 sm:mt-0">
              {userData.bio || "No bio available"}
            </dd>
          </div>
        </dl>
      </div>
      {/* 編輯個人資料按鈕 */}
      {isCurrentUser && (
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <button
            className="px-3 py-2 bg-purple-color text-white text-base font-medium rounded-md shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </div>
      )}
    </div>
  ) : (
    <div>Loading...</div>
  );

  return (
    <div className="w-4/5  mx-auto mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* UserProfile 組件容器 */}
        <div className="lg:col-span-2">{userProfileInfo}</div>
        {/* User Reviews */}
        {!isCurrentUser && userReviews.length > 0 && (
          <div className="lg:col-span-3">
            <div className="w-4/5 mx-auto">
              <h2 className="text-xl font-bold text-gray-300 mb-4 text-center mt-12">
                Echoes from the Past &nbsp; 🔊
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {userReviews
                  .slice(0, isExpanded ? userReviews.length : 3)
                  .map((review) => (
                    <div
                      key={review.id}
                      className="favorite-review-card border border-gray-500 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between p-4 transition duration-300 ease-in-out"
                    >
                      <div className="min-w-0 ml-1">
                        <p className="text-xs mb-1 text-gray-500 truncate">
                          {review.date
                            ? new Date(review.date).toLocaleDateString("zh-TW")
                            : "未知日期"}
                        </p>
                        <p className="text-sm text-secondary-color font-bold truncate">
                          {review.venueName}
                        </p>
                        <p className="text-sm text-gray-300 mt-1 truncate">
                          {review.performanceName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {userReviews.length > 3 && (
                <button
                  onClick={toggleReviews}
                  className="favorite-review-card-slide-in mt-4 ml-1 p-2 text-purple-color rounded-lg hover:text-purple-500 flex items-center justify-center"
                >
                  {isExpanded ? "Less" : "More"}
                  <FontAwesomeIcon
                    icon={isExpanded ? faCircleChevronUp : faCircleChevronDown}
                    className="ml-2"
                  />
                </button>
              )}
            </div>
          </div>
        )}

        {/* FavoriteReviews 組件容器 */}
        {isCurrentUser && (
          <div className="lg:col-span-3">
            {/* 收藏的評論列表 */}
            <FavoriteReviews
              favoriteReviewIds={favorites}
              currentUserId={user?.uid}
              updatedUserData={updatedUserData}
              venuesData={venues}
            />
          </div>
        )}
      </div>

      {/* 編輯用戶資料的 Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {/* Modal 中的表單內容 */}
          <form onSubmit={handleUpdate}>
            {/* 用户名输入 */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Username"
                value={editableUsername}
                onChange={(e) => setEditableUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="displayName"
              >
                Display Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="displayName"
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            {/* 頭貼上傳 */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="profilePicture"
              >
                Profile Picture
              </label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={(e) => {
                  // 如果選擇了檔案，則設置 selectedFile 狀態；否則設置為 null
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* 個人簡介輸入 */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="bio"
              >
                Bio
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="bio"
                placeholder="Your bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="absolute top-0 right-0 text-primary-color p-2"
                onClick={() => setShowModal(false)}
              >
                X
              </button>
            </div>
            <button
              className="bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isUpdating}
            >
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserProfile;
