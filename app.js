import { db, collection, getDocs } from "./firebase.js";

let cart = [];

async function loadProducts(){
const querySnapshot = await getDocs(collection(db,"products"));

let box = document.getElementById("products");
box.innerHTML="";

querySnapshot.forEach((doc)=>{

let p = doc.data();

box.innerHTML += `
<div class="card">
<img src="${p.image}">
<h3>${p.name}</h3>
<p>${p.price}$</p>
<button onclick='add("${p.name}",${p.price})'>Add</button>
</div>`;
});
}

window.add = function(name,price){

let found = cart.find(p=>p.name===name);

if(found){
found.qty++;
}else{
cart.push({name,price,qty:1});
}

updateCart();
}

function updateCart(){
let box=document.getElementById("cartItems");
let total=0;

box.innerHTML="";

cart.forEach((p,i)=>{
total += p.price * p.qty;

box.innerHTML += `
<p>${p.name} ${p.price}$ × ${p.qty}</p>`;
});

document.getElementById("total").innerText="Total: "+total+"$";
}

loadProducts();
