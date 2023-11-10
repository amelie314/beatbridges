/** @format */

const admin = require("firebase-admin");

const csv = require("csv-parser");
const fs = require("fs");

// 初始化 Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require("../firebase-adminsdk.json")),
  // 可以在 Firebase 控制台中找到您的 projectId
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// 讀取 CSV 文件並導入到 Firestore
fs.createReadStream("../LocationInfo.csv")
  .pipe(csv())
  .on("data", (row) => {
    db.collection("venues")
      .add(row)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });
