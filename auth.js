// ============================================
// Authentication Module
// ============================================

import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "./firebase.js";

import { createUserProfile } from "./db.js";

// ============================================
// Registration Function
// ============================================

window.register = async function() {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const displayName = document.getElementById("displayName").value.trim();

    // Validation
    if (!email || !password || !confirmPassword) {
      showMessage("يرجى ملء جميع الحقول", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("كلمات المرور غير متطابقة", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("البريد الإلكتروني غير صحيح", "error");
      return;
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(user.uid, email, displayName);

    showMessage("تم إنشاء الحساب بنجاح! جاري إعادة التوجيه...", "success");

    // Redirect to home page after 2 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);

  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = "حدث خطأ أثناء التسجيل";
    
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "هذا البريد الإلكتروني مسجل بالفعل";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "كلمة المرور ضعيفة جداً";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "البريد الإلكتروني غير صحيح";
    }
    
    showMessage(errorMessage, "error");
  }
};

// ============================================
// Login Function
// ============================================

window.login = async function() {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validation
    if (!email || !password) {
      showMessage("يرجى ملء جميع الحقول", "error");
      return;
    }

    // Sign in user
    await signInWithEmailAndPassword(auth, email, password);

    showMessage("تم تسجيل الدخول بنجاح! جاري إعادة التوجيه...", "success");

    // Redirect to home page after 1.5 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (error) {
    console.error("Login error:", error);
    
    let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
    
    if (error.code === "auth/user-not-found") {
      errorMessage = "البريد الإلكتروني غير مسجل";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "كلمة المرور غير صحيحة";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "البريد الإلكتروني غير صحيح";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "محاولات كثيرة جداً. يرجى المحاولة لاحقاً";
    }
    
    showMessage(errorMessage, "error");
  }
};

// ============================================
// Logout Function
// ============================================

window.logout = async function() {
  try {
    await signOut(auth);
    showMessage("تم تسجيل الخروج بنجاح", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    console.error("Logout error:", error);
    showMessage("حدث خطأ أثناء تسجيل الخروج", "error");
  }
};

// ============================================
// Message Display Function
// ============================================

function showMessage(message, type = "info") {
  // Remove existing message if any
  const existingMessage = document.querySelector(".message-box");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageBox = document.createElement("div");
  messageBox.className = `message-box message-${type}`;
  messageBox.textContent = message;
  
  // Add styles for message box
  messageBox.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(messageBox);

  // Remove message after 4 seconds
  setTimeout(() => {
    messageBox.style.animation = "slideOut 0.3s ease";
    setTimeout(() => messageBox.remove(), 300);
  }, 4000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
