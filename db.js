let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function save() {
    localStorage.setItem("products", JSON.stringify(products));
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}
