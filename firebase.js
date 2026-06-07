// ============================================
// Firebase Configuration & Initialization
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJxjMbheO6ComvGApxte6_354ML54mDXo",
  authDomain: "store-3bd3d.firebaseapp.com",
  projectId: "store-3bd3d",
  storageBucket: "store-3bd3d.firebasestorage.app",
  appId: "1:889662991855:web:3c93c89a9b2886e9005a1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Export Firestore Functions
export {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
