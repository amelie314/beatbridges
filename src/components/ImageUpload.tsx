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
    const imageRef = ref(storage, `avatars/${userId}`);
    uploadBytes(imageRef, image).then(() => {
      getDownloadURL(imageRef).then((url) => {
        // 更新用户头像 URL 的逻辑
      });
    });
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>上传头像</button>
    </div>
  );
};

export default ImageUpload;
