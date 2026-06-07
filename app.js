// ============================================
// Main Store Application
// ============================================

import {
  auth,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

import {
  getProducts,
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  createOrder,
  onCartChange,
  getCurrentUser
} from "./db.js";

// ============================================
// Global State
// ============================================

let currentUser = null;
let cartItems = [];
let products = [];

// ============================================
// Initialization
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication state
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    updateUIBasedOnAuth();

    if (user) {
      // Subscribe to cart changes
      onCartChange(user.uid, (items) => {
        cartItems = items;
        updateCartUI();
      });
    }
  });

  // Load products
  await loadProducts();

  // Setup event listeners
  setupEventListeners();
});

// ============================================
// Authentication UI Updates
// ============================================

function updateUIBasedOnAuth() {
  const accountBtn = document.querySelector('a[href="auth.html"]');
  const logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    // User is logged in
    if (accountBtn) {
      accountBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${currentUser.displayName || "حسابي"}`;
      accountBtn.href = "account.html";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "block";
    }
  } else {
    // User is not logged in
    if (accountBtn) {
      accountBtn.innerHTML = `<i class="fa-regular fa-user"></i> الحساب`;
      accountBtn.href = "auth.html";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }
  }
}

// ============================================
// Product Loading
// ============================================

async function loadProducts() {
  try {
    products = await getProducts();
    displayProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
    showNotification("حدث خطأ في تحميل المنتجات", "error");
  }
}

function displayProducts(productsToDisplay) {
  const productsContainer = document.getElementById("products");

  if (!productsContainer) return;

  if (productsToDisplay.length === 0) {
    productsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">لا توجد منتجات متاحة</p>';
    return;
  }

  productsContainer.innerHTML = productsToDisplay.map((product) => `
    <div class="product-card">
      <img src="${product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}" alt="${product.name}">
      <h3>${product.name}</h3>
      <div class="stars">★★★★★</div>
      <p class="price">${product.price} AED</p>
      <button onclick="goToProductDetail('${product.id}')">عرض التفاصيل</button>
    </div>
  `).join("");
}

// ============================================
// Product Detail Navigation
// ============================================

window.goToProductDetail = function(productId) {
  window.location.href = `product.html?id=${productId}`;
};

// ============================================
// Cart Management
// ============================================

window.toggleCart = function() {
  const cartSidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("overlay");

  if (cartSidebar) cartSidebar.classList.toggle("show");
  if (overlay) overlay.classList.toggle("show");
};

function updateCartUI() {
  const cartItemsContainer = document.getElementById("cartItems");
  const totalElement = document.getElementById("total");
  const cartCountElement = document.getElementById("cartCount");

  if (!cartItemsContainer) return;

  // Update cart count
  if (cartCountElement) {
    cartCountElement.textContent = cartItems.length;
  }

  // Update cart items display
  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = '<p>لا توجد منتجات في السلة</p>';
    if (totalElement) totalElement.textContent = "0 AED";
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartItemsContainer.innerHTML = cartItems.map((item) => `
    <div class="cart-item">
      <img src="${item.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">${item.price} AED</div>
        <div class="cart-item-quantity">
          <button onclick="decreaseQuantity('${item.id}')">−</button>
          <span>${item.quantity}</span>
          <button onclick="increaseQuantity('${item.id}')">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem('${item.id}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join("");

  if (totalElement) {
    totalElement.textContent = `${total.toFixed(2)} AED`;
  }
}

window.decreaseQuantity = async function(cartItemId) {
  if (!currentUser) {
    showNotification("يرجى تسجيل الدخول أولاً", "error");
    return;
  }

  const item = cartItems.find(i => i.id === cartItemId);
  if (item) {
    try {
      await updateCartItem(currentUser.uid, cartItemId, item.quantity - 1);
    } catch (error) {
      console.error("Error updating cart:", error);
      showNotification("حدث خطأ في تحديث السلة", "error");
    }
  }
};

window.increaseQuantity = async function(cartItemId) {
  if (!currentUser) {
    showNotification("يرجى تسجيل الدخول أولاً", "error");
    return;
  }

  const item = cartItems.find(i => i.id === cartItemId);
  if (item) {
    try {
      await updateCartItem(currentUser.uid, cartItemId, item.quantity + 1);
    } catch (error) {
      console.error("Error updating cart:", error);
      showNotification("حدث خطأ في تحديث السلة", "error");
    }
  }
};

window.removeCartItem = async function(cartItemId) {
  if (!currentUser) {
    showNotification("يرجى تسجيل الدخول أولاً", "error");
    return;
  }

  try {
    await removeFromCart(currentUser.uid, cartItemId);
    showNotification("تم حذف المنتج من السلة", "success");
  } catch (error) {
    console.error("Error removing from cart:", error);
    showNotification("حدث خطأ في حذف المنتج", "error");
  }
};

// ============================================
// Checkout
// ============================================

window.checkout = async function() {
  if (!currentUser) {
    showNotification("يرجى تسجيل الدخول أولاً", "error");
    return;
  }

  if (cartItems.length === 0) {
    showNotification("السلة فارغة", "error");
    return;
  }

  try {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderId = await createOrder(
      currentUser.uid,
      cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total,
      {} // Empty shipping address for now
    );

    showNotification("تم إنشاء الطلب بنجاح!", "success");
    window.toggleCart();

    // Redirect to order confirmation page
    setTimeout(() => {
      window.location.href = `order-confirmation.html?orderId=${orderId}`;
    }, 2000);

  } catch (error) {
    console.error("Checkout error:", error);
    showNotification("حدث خطأ أثناء إتمام الشراء", "error");
  }
};

// ============================================
// Search Functionality
// ============================================

function setupEventListeners() {
  const searchInput = document.querySelector(".search-box input");
  const searchBtn = document.querySelector(".search-box button");

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }

  // Setup checkout button
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }

  // Setup logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        showNotification("تم تسجيل الخروج بنجاح", "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        showNotification("حدث خطأ في تسجيل الخروج", "error");
      }
    });
  }
}

function performSearch() {
  const searchInput = document.querySelector(".search-box input");
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    displayProducts(products);
    return;
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    (product.description && product.description.toLowerCase().includes(query))
  );

  displayProducts(filteredProducts);
}

// ============================================
// Notification System
// ============================================

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ============================================
// Navigation Setup
// ============================================

window.navigateTo = function(page) {
  window.location.href = page;
};
