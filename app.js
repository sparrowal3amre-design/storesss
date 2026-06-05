function render(){
let box = document.getElementById("products");
box.innerHTML="";

products.forEach((p,i)=>{
box.innerHTML += `
<div class="card">
<img src="${p.image}">
<h3>${p.name}</h3>
<p>${p.price}$</p>
<button onclick="add(${i})">Add</button>
</div>`;
});
}

function add(i){
let item = products[i];

let found = cart.find(p=>p.name===item.name);

if(found){
found.qty++;
} else {
cart.push({...item, qty:1});
}

localStorage.setItem("cart",JSON.stringify(cart));
updateCart();
}

function updateCart(){
let box=document.getElementById("cartItems");
let total=0;

box.innerHTML="";

cart.forEach((p,i)=>{
total += p.price * p.qty;

box.innerHTML += `
<p>${p.name} ${p.price}$ × ${p.qty}
<button onclick="removeItem(${i})">X</button>
</p>`;
});

document.getElementById("total").innerText="Total: "+total+"$";
}

function removeItem(i){
cart.splice(i,1);
localStorage.setItem("cart",JSON.stringify(cart));
updateCart();
}

function checkout(){
if(!currentUser){
alert("سجل دخول");
return;
}

orders.push({
user:currentUser.email,
items:cart,
total:cart.reduce((a,b)=>a+b.price*b.qty,0),
date:new Date().toLocaleString()
});

cart=[];
localStorage.setItem("orders",JSON.stringify(orders));
localStorage.setItem("cart",JSON.stringify(cart));

updateCart();
alert("تم الطلب");
}

render();
updateCart();
