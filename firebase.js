import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
getFirestore, collection, addDoc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyBJxjMbheO6ComvGApxte6_354ML54mDXo",
authDomain: "store-3bd3d.firebaseapp.com",
projectId: "store-3bd3d",
storageBucket: "store-3bd3d.firebasestorage.app",
appId: "1:889662991855:web:3c93c89a9b2886e9005a1a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export {
collection, addDoc, getDocs, query, where,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
};
