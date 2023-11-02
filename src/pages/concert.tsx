/** @format */
/** @format */

// export default Accounting;
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Form from "../components/Form";
import List from "../components/List";

interface RecordItem {
  id: string;
  amount: number;
  detail: string;
}

function Accounting() {
  const [user] = useAuthState(auth);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchRecords(user.uid);
    } else {
      router.push("/login");
    }
  }, [user, router]);

  const fetchRecords = async (userId: string) => {
    const recordsColRef = collection(db, "users", userId, "accountingRecords");
    const recordsSnapshot = await getDocs(recordsColRef);
    const recordsData: RecordItem[] = recordsSnapshot.docs.map((doc) => ({
      id: doc.id,

      ...(doc.data() as {
        amount: number;
        detail: string;
      }),
    }));
    setRecords(recordsData);
  };

  const addRecordToFirestore = async (newRecord) => {
    if (!user) return;
    const recordsColRef = collection(
      db,
      "users",
      user.uid,
      "accountingRecords"
    );
    await addDoc(recordsColRef, newRecord);
    fetchRecords(user.uid); // 添加成功後，重新獲取記錄
  };

  const deleteRecordFromFirestore = async (recordId: string) => {
    if (!user || !recordId) return;
    try {
      const recordRef = doc(
        db,
        "users",
        user.uid,
        "accountingRecords",
        recordId
      );
      await deleteDoc(recordRef);
      fetchRecords(user.uid); // 刪除成功後，重新獲取記錄
    } catch (error) {
      console.error("無法刪除記錄:", error);
    }
  };

  const totalAmount = records.reduce(
    (sum, record) => sum + (record.amount || 0),
    0
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-purple">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Form onAdd={addRecordToFirestore} />
        <List records={records} onDelete={deleteRecordFromFirestore} />
        <div className="text-dark-gray mt-2">小計：{totalAmount}</div>
        <div className="mt-4">
          <Link href="/">
            <div className="px-3 py-1 bg-light-purple text-gray-700 rounded hover:bg-purple-300">
              返回首頁
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Accounting;
