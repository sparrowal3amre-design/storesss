function render() {
    const box = document.getElementById("products");
    box.innerHTML = "";

    products.forEach((p, i) => {
        box.innerHTML += `
        <div class="card glass">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>${p.price}$</p>
            <button onclick="add(${i})">أضف للسلة</button>
        </div>
        `;
    });
}

function add(i) {
    cart.push(products[i]);
    saveCart();
    updateCart();
}

function updateCart() {

    document.getElementById("count").innerText = cart.length;

    let box = document.getElementById("cartItems");
    box.innerHTML = "";

    let total = 0;

    cart.forEach((p, i) => {
        total += Number(p.price);

        box.innerHTML += `
        <div>
            ${p.name} - ${p.price}$
            <button onclick="remove(${i})">X</button>
        </div>
        `;
    });

    document.getElementById("total").innerText = "Total: " + total + "$";
}

function remove(i) {
    cart.splice(i, 1);
    saveCart();
    updateCart();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCart();
}

function toggleCart() {
    document.getElementById("cart").classList.toggle("show");
}

render();
updateCart();
