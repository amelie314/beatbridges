/** @format */

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
  const router = useRouter();
  const { username } = router.query;
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(
    user?.photoURL || "default-profile.png"
  );
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (username) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fetchedUserData = querySnapshot.docs[0].data();
          console.log("Fetched User Data:", fetchedUserData);
          setUserData(fetchedUserData);
          setIsCurrentUser(user && user.uid === fetchedUserData.uid);
        } else {
          console.log("No such user!");
        }
      }
    };

    fetchUserData();
  }, [username, user]);

  useEffect(() => {
    if (isCurrentUser && userData) {
      setDisplayName(userData.displayName || "");
      setBio(userData.bio || "");
      setProfilePicUrl(userData.photoURL || "default-profile.png");
    }
  }, [isCurrentUser, userData, user]);

  useEffect(() => {
    if (user && isCurrentUser) {
      // 假設您的用戶收藏資料存儲在 'userFavorites' 集合中
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, "userFavorites");
        const q = query(favoritesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const newFavorites = [];
        querySnapshot.forEach((doc) => {
          newFavorites.push(doc.data().reviewId);
        });
        setFavorites(newFavorites);
      };
      fetchFavorites();
    }
  }, [user, isCurrentUser]);

  const handleUpdate = useCallback(
    async (event) => {
      event.preventDefault();
      if (!user) {
        alert("用户未登录，无法更新个人资料。");
        return;
      }

      try {
        // 更新 Firebase Authentication 中的 displayName
        await updateProfile(user, { displayName });

        // 更新 Firestore 中的用户资料
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          username, // 更新用户名
          bio, // 更新个人简介
          displayName, // 更新显示名称
        });

        alert("个人资料更新成功！");
      } catch (error) {
        console.error("更新错误：", error);
        alert(`更新失败：${error.message}`);
      }
    },
    [user, displayName, username, bio]
  );

  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleImageUpload = useCallback(async () => {
    if (!selectedFile || !user) {
      return;
    }
    const storageRef = ref(storage, `profilePics/${user.uid}`);
    const uploadTask = await uploadBytes(storageRef, selectedFile);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    await updateProfile(user, { photoURL: downloadURL });
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { photoURL: downloadURL });

    setProfilePicUrl(downloadURL);
    setSelectedFile(null);
  }, [user, selectedFile]);

  // const userProfileInfo = userData ? (
  //   <div className="bg-white shadow overflow-hidden sm:rounded-lg">
  //     <div className="px-4 py-5 sm:px-6">
  //       <h3 className="text-lg leading-6 font-medium text-gray-900">
  //         User Profile
  //       </h3>
  //       <p className="mt-1 max-w-2xl text-sm text-gray-500">
  //         Personal details and application.
  //       </p>
  //     </div>
  //     <div className="border-t border-gray-200">
  //       <dl>
  //         <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
  //           <dt className="text-sm font-medium text-gray-500">Full name</dt>
  //           <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
  //             {userData.displayName}
  //           </dd>
  //         </div>
  //         <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
  //           <dt className="text-sm font-medium text-gray-500">
  //             Profile picture
  //           </dt>
  //           <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
  //             <img
  //               src={userData.photoURL || "default-profile.png"}
  //               alt="Profile"
  //               className="w-20 h-20 rounded-full"
  //             />
  //           </dd>
  //         </div>
  //         <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
  //           <dt className="text-sm font-medium text-gray-500">Bio</dt>
  //           <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
  //             {userData.bio || "No bio available"}
  //           </dd>
  //         </div>
  //         {/* ...其他个人信息... */}
  //       </dl>
  //     </div>
  //   </div>
  // ) : (
  //   <div>Loading...</div>
  // );

  useEffect(() => {
    if (user) {
      // 獲取用戶收藏的評論
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, "userFavorites");
        const q = query(favoritesRef, where("userId", "==", user.uid));

        const querySnapshot = await getDocs(q);
        const favoritesData: string[] = [];
        querySnapshot.forEach((doc) => {
          favoritesData.push(doc.data().reviewId); // 儲存收藏的評論ID
        });

        // 更新 favorites 狀態
        setFavorites(favoritesData);
      };

      fetchFavorites();
    }
  }, [user]);

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
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {userData.displayName}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Profile picture
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <img
                src={userData.photoURL || "default-profile.png"}
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
        <button
          className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          onClick={() => setShowModal(true)}
        >
          Edit Profile
        </button>
      )}
      <div className="mt-8 bg-primary-color">
        {isCurrentUser && (
          <>
            {/* 其他组件 */}
            <FavoriteReviews
              favoriteReviewIds={favorites}
              currentUserId={user?.uid} // 确保这里传递了当前用户的ID
            />
          </>
        )}
      </div>

      {/* 编辑用户资料的模态框 */}
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {/* 个人简介输入 */}
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
            {/* 头像上传 */}
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
            {/* 头像上传 */}
            {/* ... */}
            <div className="flex items-center justify-between">
              <button
                // ...按钮样式
                type="submit"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserProfile;
