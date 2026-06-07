// ============================================
// Admin Dashboard Module
// ============================================

import {
  auth,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getUserProfile,
  onProductsChange,
  onOrdersChange
} from "./db.js";

// ============================================
// Global State
// ============================================

let currentUser = null;
let products = [];
let orders = [];
let editingProductId = null;

// ============================================
// Initialization
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication state
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) {
      window.location.href = "auth.html";
      return;
    }

    // Check if user is admin
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile || userProfile.role !== "admin") {
      alert("ليس لديك صلاحيات الوصول إلى لوحة التحكم");
      window.location.href = "index.html";
      return;
    }

    updateAdminUI();
    setupEventListeners();

    // Load initial data
    await loadProducts();
    await loadOrders();

    // Subscribe to real-time updates
    onProductsChange((updatedProducts) => {
      products = updatedProducts;
      displayProducts();
    });

    onOrdersChange((updatedOrders) => {
      orders = updatedOrders;
      displayOrders();
    });
  });
});

// ============================================
// Admin UI Updates
// ============================================

function updateAdminUI() {
  const adminName = document.getElementById("adminName");
  if (adminName) {
    adminName.textContent = currentUser.displayName || currentUser.email;
  }
}

function setupEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll(".admin-nav button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Remove active class from all buttons and sections
      tabButtons.forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".admin-section").forEach(section => section.classList.remove("active"));

      // Add active class to clicked button and corresponding section
      e.target.classList.add("active");
      const sectionId = e.target.dataset.section;
      document.getElementById(sectionId).classList.add("active");
    });
  });

  // Product form
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("تم تسجيل الخروج بنجاح");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Logout error:", error);
        alert("حدث خطأ في تسجيل الخروج");
      }
    });
  }
}

// ============================================
// Product Management
// ============================================

async function loadProducts() {
  try {
    products = await getProducts();
    displayProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    showNotification("حدث خطأ في تحميل المنتجات", "error");
  }
}

function displayProducts() {
  const productsTable = document.getElementById("productsTable");

  if (!productsTable) return;

  if (products.length === 0) {
    productsTable.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">لا توجد منتجات</td>
      </tr>
    `;
    return;
  }

  productsTable.innerHTML = products.map((product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.price} AED</td>
      <td>${product.stock || 0}</td>
      <td>${product.category || "عام"}</td>
      <td>
        <button class="action-btn" onclick="editProduct('${product.id}')">تعديل</button>
        <button class="action-btn delete" onclick="deleteProductConfirm('${product.id}')">حذف</button>
      </td>
    </tr>
  `).join("");
}

async function handleProductSubmit(e) {
  e.preventDefault();

  try {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value) || 0;
    const category = document.getElementById("productCategory").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const imageFile = document.getElementById("productImage").files[0];

    // Validation
    if (!name || !price || !category) {
      showNotification("يرجى ملء جميع الحقول المطلوبة", "error");
      return;
    }

    if (price <= 0) {
      showNotification("السعر يجب أن يكون أكبر من صفر", "error");
      return;
    }

    const productData = {
      name,
      price,
      stock,
      category,
      description
    };

    if (editingProductId) {
      // Update existing product
      if (imageFile) {
        // If new image is provided, upload it
        // For now, we'll just update without the image
        showNotification("تحديث الصورة قيد التطوير", "warning");
      }

      await updateProduct(editingProductId, productData);
      showNotification("تم تحديث المنتج بنجاح", "success");
      editingProductId = null;
    } else {
      // Add new product
      if (!imageFile) {
        showNotification("يرجى اختيار صورة للمنتج", "error");
        return;
      }

      await addProduct(productData, imageFile);
      showNotification("تم إضافة المنتج بنجاح", "success");
    }

    // Reset form
    document.getElementById("productForm").reset();
    document.getElementById("submitBtn").textContent = "إضافة منتج";

  } catch (error) {
    console.error("Error handling product:", error);
    showNotification("حدث خطأ في معالجة المنتج", "error");
  }
}

window.editProduct = async function(productId) {
  try {
    const product = products.find(p => p.id === productId);

    if (!product) {
      showNotification("لم يتم العثور على المنتج", "error");
      return;
    }

    // Fill form with product data
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock || 0;
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productDescription").value = product.description || "";

    // Update button text
    document.getElementById("submitBtn").textContent = "تحديث المنتج";

    // Store editing product ID
    editingProductId = productId;

    // Scroll to form
    document.getElementById("productForm").scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error("Error editing product:", error);
    showNotification("حدث خطأ في تحميل بيانات المنتج", "error");
  }
};

window.deleteProductConfirm = function(productId) {
  if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    deleteProductAction(productId);
  }
};

async function deleteProductAction(productId) {
  try {
    await deleteProduct(productId);
    showNotification("تم حذف المنتج بنجاح", "success");
  } catch (error) {
    console.error("Error deleting product:", error);
    showNotification("حدث خطأ في حذف المنتج", "error");
  }
}

// ============================================
// Order Management
// ============================================

async function loadOrders() {
  try {
    orders = await getAllOrders();
    displayOrders();
  } catch (error) {
    console.error("Error loading orders:", error);
    showNotification("حدث خطأ في تحميل الطلبات", "error");
  }
}

function displayOrders() {
  const ordersTable = document.getElementById("ordersTable");

  if (!ordersTable) return;

  if (orders.length === 0) {
    ordersTable.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">لا توجد طلبات</td>
      </tr>
    `;
    return;
  }

  ordersTable.innerHTML = orders.map((order) => {
    const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString("ar-AE");

    return `
      <tr>
        <td>${order.id.substring(0, 8)}</td>
        <td>${order.userId.substring(0, 8)}</td>
        <td>${order.items.length} منتج</td>
        <td>${order.totalAmount} AED</td>
        <td>
          <select onchange="updateStatus('${order.id}', this.value)" style="background: rgba(99, 102, 241, 0.1); border: 1px solid #334155; color: #f1f5f9; padding: 0.5rem; border-radius: 4px;">
            <option value="pending" ${order.status === "pending" ? "selected" : ""}>قيد الانتظار</option>
            <option value="processing" ${order.status === "processing" ? "selected" : ""}>قيد المعالجة</option>
            <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>مشحون</option>
            <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>تم التسليم</option>
            <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>ملغى</option>
          </select>
        </td>
        <td>${formattedDate}</td>
      </tr>
    `;
  }).join("");
}

window.updateStatus = async function(orderId, newStatus) {
  try {
    await updateOrderStatus(orderId, newStatus);
    showNotification("تم تحديث حالة الطلب بنجاح", "success");
  } catch (error) {
    console.error("Error updating order status:", error);
    showNotification("حدث خطأ في تحديث حالة الطلب", "error");
  }
};

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
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#6366f1"};
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
