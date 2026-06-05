function render() {

    let box = document.getElementById("products");
    box.innerHTML = "";

    products.forEach((p, i) => {
        box.innerHTML += `
        <div class="glass card">
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
    saveAll();
    updateCart();
}

function updateCart() {

    let box = document.getElementById("cartItems");
    box.innerHTML = "";

    let total = 0;

    cart.forEach(p => {
        total += Number(p.price);
        box.innerHTML += `<p>${p.name} - ${p.price}$</p>`;
    });

    document.getElementById("total").innerText = "Total: " + total + "$";
}

function checkout() {

    if (!currentUser) {
        alert("سجل دخول أولاً");
        return;
    }

    let order = {
        user: currentUser.email,
        items: cart,
        total: cart.reduce((a,b)=>a+Number(b.price),0),
        date: new Date().toLocaleString()
    };

    orders.push(order);

    cart = [];
    saveAll();

    alert("تم إرسال الطلب");
    updateCart();
}

render();
updateCart();
