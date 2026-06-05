let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}
