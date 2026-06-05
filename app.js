import { db, collection, getDocs, auth } from "./firebase.js";

let cart = [];

async function loadProducts(){
const snap = await getDocs(collection(db,"products"));

let box=document.getElementById("products");
box.innerHTML="";

snap.forEach(doc=>{
let p = doc.data();

box.innerHTML += `
<div class="card">
<img src="${p.image}">
<h3>${p.name}</h3>
<p>${p.price}$</p>
<button onclick="add('${p.name}',${p.price})">Add</button>
</div>`;
});
}

window.add = function(name,price){

let f = cart.find(i=>i.name===name);

if(f) f.qty++;
else cart.push({name,price,qty:1});

updateCart();
}

function updateCart(){
let box=document.getElementById("cartItems");
let total=0;

box.innerHTML="";

cart.forEach(i=>{
total += i.price*i.qty;

box.innerHTML += `<p>${i.name} × ${i.qty}</p>`;
});

document.getElementById("total").innerText = total+"$";
}

window.checkout = async function(){

let user = auth.currentUser;
if(!user) return alert("Login first");

await addDoc(collection(db,"orders"),{
user:user.email,
items:cart,
total:cart.reduce((a,b)=>a+b.price*b.qty,0),
date:new Date().toISOString()
});

cart=[];
updateCart();

alert("Order placed");
}

loadProducts();
