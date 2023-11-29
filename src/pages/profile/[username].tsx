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
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from "../../components/Modal"; // 确保路径正确
import FavoriteReviews from "../../components/FavoriteReviews";

const UserProfile = () => {
  const { setUserInfo } = useUserContext();

  const router = useRouter();

  const { username } = router.query;

  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [editableUsername, setEditableUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState(null);

  const [profilePicUrl, setProfilePicUrl] = useState(
    user?.photoURL || "default-profile.png"
  );
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("useEffect 開始執行- fetchUserData", { username, user });
      if (username) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fetchedUserData = querySnapshot.docs[0].data();
          setUserData(fetchedUserData);
          setIsCurrentUser(user && user.uid === fetchedUserData.uid);
          console.log("Fetched User Data:", fetchedUserData);
        } else {
          console.log("No such user!");
        }
      }
    };

    fetchUserData();
    console.log("useEffect 結束執行 - fetchUserData");
  }, [username, user]);

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

      if (!user) {
        alert("用户未登录，无法更新个人资料。");
        return;
      }

      // 检查用户名是否符合规则
      if (!validateUsername(editableUsername)) {
        alert(
          "用户名格式不正确，请确保它只包含字母、数字以及标点符号（例如：username.123）。"
        );
        return;
        // 假設 userData 是更新後的用户資料
        setUpdatedUserData(userData); // 新增一個狀態来保存更新后的數據
      }

      try {
        // 更新 Firebase Authentication 中的 displayName
        await updateProfile(user, { displayName });

        // 更新 Firestore 中的用戶資料
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          username: editableUsername,
          bio,
          displayName,
        });

        // 更新本地状态
        setUserData({
          displayName,
          username: editableUsername,
          bio,
        });

        alert("個人資料更新成功");

        // 关闭 Modal 并重定向（如果需要）
        setShowModal(false);

        // context
        setUserInfo({ user, username: editableUsername });

        if (editableUsername !== username) {
          router.push(`/profile/${editableUsername}`);
        }
      } catch (error) {
        console.error("更新錯誤：", error);
        alert(`更新失敗：${error.message}`);
      }
    },
    [user, displayName, editableUsername, bio, username, router]
  );

  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      return;
    }
    try {
      if (user) {
        const storageRef = ref(storage, `profilePics/${user.uid}`);
        const uploadTask = await uploadBytes(storageRef, selectedFile);

        // 獲取圖片的下載 URL
        const downloadURL = await getDownloadURL(uploadTask.ref);
        setProfilePicUrl(downloadURL); // 更新頭像的 URL

        // 更新 Firebase auth 中的 photoURL
        await updateProfile(user, { photoURL: downloadURL });

        // 更新 Firestore 中的用戶資料
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          photoURL: downloadURL, // 更新 Firestore 中的 photoURL 欄位
        });
      } else {
        console.error("User is not authenticated.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }

    setSelectedFile(null); // 清除已選擇的檔案
  };

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
    <div className="mx-auto mt-8 p-5 border w-96 shadow-lg rounded-md bg-white">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          User Profile
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Personal details and application.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {/* Username  */}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {userData.username || "No username"}
            </dd>
          </div>
          {/* Full name 栏目 */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {userData.displayName}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Profile picture
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <img
                src={user?.photoURL ? user.photoURL : profilePicUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Bio</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {userData.bio || "No bio available"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );

  return (
    <div>
      {/* 用戶資料展示 */}
      {/* ... */}
      {userProfileInfo}

      {/* 編輯個人資料按鈕 */}

      {isCurrentUser && (
        <div className="flex justify-center items-center">
          <button
            className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onClick={() => setShowModal(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
      <div className="mt-8 bg-primary-color">
        {isCurrentUser && (
          <>
            {/* 其他組件 */}
            <FavoriteReviews
              favoriteReviewIds={favorites}
              currentUserId={user?.uid}
              updatedUserData={updatedUserData} // 將更新後的用户數據傳遞給子组件
            />
          </>
        )}
      </div>

      {/* 編輯用户資料的Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {/* 模态框内容 */}
          <form onSubmit={handleUpdate}>
            {/* 显示名称输入 */}
            {/* ... */}
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
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="mt-2 inline-flex items-center px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Upload Image
                </button>
              )}
            </div>
            {/* 頭貼上傳 */}
            {/* ... */}
            <div className="flex items-center justify-between">
              <button
                className="absolute top-0 right-0 text-primary-color p-2"
                onClick={() => setShowModal(false)}
              >
                X
              </button>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
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
