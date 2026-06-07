// ============================================
// Database Management Module
// ============================================

import {
  db,
  auth,
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
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  storage
} from "./firebase.js";

// ============================================
// User Management Functions
// ============================================

export async function createUserProfile(uid, email, displayName = "") {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      uid,
      email,
      displayName: displayName || email.split("@")[0],
      role: "user",
      createdAt: Timestamp.now(),
      address: {},
      phone: ""
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, "users"), {
        uid,
        email,
        displayName: displayName || email.split("@")[0],
        role: "user",
        createdAt: Timestamp.now(),
        address: {},
        phone: ""
      });
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(uid, data) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// ============================================
// Product Management Functions
// ============================================

export async function addProduct(productData, imageFile = null) {
  try {
    let imageUrl = "";

    // Upload image if provided
    if (imageFile) {
      const storageRef = ref(
        storage,
        `products/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Add product to Firestore
    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      imageUrl: imageUrl || productData.imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

export async function getProducts() {
  try {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
}

export async function getProductById(productId) {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
}

export async function updateProduct(productId, data) {
  try {
    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    // Get product to find image URL
    const product = await getProductById(productId);
    
    // Delete image from storage if it exists
    if (product && product.imageUrl) {
      try {
        const imageRef = ref(storage, product.imageUrl);
        await deleteObject(imageRef);
      } catch (e) {
        console.warn("Could not delete image:", e);
      }
    }

    // Delete product document
    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export function onProductsChange(callback) {
  const q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    callback(products);
  });
}

// ============================================
// Cart Management Functions
// ============================================

export async function addToCart(uid, productId, product, quantity = 1) {
  try {
    const cartRef = collection(db, "users", uid, "cart");
    
    // Check if product already in cart
    const q = query(cartRef, where("productId", "==", productId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update quantity if product exists
      const cartItemId = querySnapshot.docs[0].id;
      const currentQuantity = querySnapshot.docs[0].data().quantity;
      await updateDoc(doc(cartRef, cartItemId), {
        quantity: currentQuantity + quantity
      });
    } else {
      // Add new product to cart
      await addDoc(cartRef, {
        productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
        addedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

export async function getCart(uid) {
  try {
    const cartRef = collection(db, "users", uid, "cart");
    const querySnapshot = await getDocs(cartRef);
    const cartItems = [];
    querySnapshot.forEach((doc) => {
      cartItems.push({ id: doc.id, ...doc.data() });
    });
    return cartItems;
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
}

export async function updateCartItem(uid, cartItemId, quantity) {
  try {
    const cartItemRef = doc(db, "users", uid, "cart", cartItemId);
    if (quantity <= 0) {
      await deleteDoc(cartItemRef);
    } else {
      await updateDoc(cartItemRef, { quantity });
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

export async function removeFromCart(uid, cartItemId) {
  try {
    const cartItemRef = doc(db, "users", uid, "cart", cartItemId);
    await deleteDoc(cartItemRef);
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

export async function clearCart(uid) {
  try {
    const cartRef = collection(db, "users", uid, "cart");
    const querySnapshot = await getDocs(cartRef);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

export function onCartChange(uid, callback) {
  const cartRef = collection(db, "users", uid, "cart");
  return onSnapshot(cartRef, (querySnapshot) => {
    const cartItems = [];
    querySnapshot.forEach((doc) => {
      cartItems.push({ id: doc.id, ...doc.data() });
    });
    callback(cartItems);
  });
}

// ============================================
// Order Management Functions
// ============================================

export async function createOrder(uid, items, totalAmount, shippingAddress) {
  try {
    const orderRef = await addDoc(collection(db, "orders"), {
      userId: uid,
      items,
      totalAmount,
      status: "pending",
      orderDate: Timestamp.now(),
      shippingAddress
    });

    // Clear cart after order
    await clearCart(uid);

    return orderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getUserOrders(uid) {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", uid),
      orderBy("orderDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("orderDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export function onOrdersChange(callback) {
  const q = query(
    collection(db, "orders"),
    orderBy("orderDate", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  });
}

// ============================================
// Authentication Helper Functions
// ============================================

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
