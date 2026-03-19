import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaWpeuu_7v7xz8QiTj81D2b4qB7ie8dxs",
  authDomain: "ummet-8fc6b.firebaseapp.com",
  projectId: "ummet-8fc6b",
  storageBucket: "ummet-8fc6b.firebasestorage.app",
  messagingSenderId: "739419340204",
  appId: "1:739419340204:web:2985be0680c4d270038e09",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
