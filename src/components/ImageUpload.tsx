/** @format */

import React, { useState } from "react";
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ImageUpload = ({ userId }) => {
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!image) {
      console.log("未選擇圖片，取消上傳");
      return;
    }

    const imageRef = ref(storage, `avatars/${userId}`);
    uploadBytes(imageRef, image)
      .then(() => {
        getDownloadURL(imageRef).then((url) => {
          // 更新用户頭像 URL 的邏輯
        });
      })
      .catch((error) => {
        console.error("圖片上傳失敗:", error);
      });
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>上傳頭貼</button>
    </div>
  );
};

export default ImageUpload;
