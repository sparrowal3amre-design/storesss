import {
db,
collection,
getDocs,
addDoc,
auth
} from "./firebase.js";

let cart=[];

async function loadProducts(){

const snap=
await getDocs(
collection(db,"products")
);

const box=
document.getElementById("products");

if(!box) return;

box.innerHTML="";

snap.forEach(doc=>{

const p=doc.data();

box.innerHTML += `
<div class="product-card">

<img src="${p.image}">

<h3>${p.name}</h3>

<p class="price">
${p.price} AED
</p>

<button
onclick="addToCart('${p.name}',${p.price})">

أضف للسلة

</button>

</div>
`;

});

}

window.addToCart =
function(name,price){

const item=
cart.find(
i=>i.name===name
);

if(item){

item.qty++;

}else{

cart.push({
name,
price,
qty:1
});

}

updateCart();

}

function updateCart(){

const box=
document.getElementById("cartItems");

if(!box) return;

box.innerHTML="";

let total=0;

cart.forEach(item=>{

total +=
item.price *
item.qty;

box.innerHTML += `
<p>
${item.name}
×
${item.qty}
</p>
`;

});

const t=
document.getElementById("total");

if(t){
t.innerText=
total + " AED";
}

}

window.checkout =
async function(){

const user=
auth.currentUser;

if(!user){

alert("سجل الدخول أولاً");

return;

}

await addDoc(
collection(db,"orders"),
{
user:user.email,
items:cart,
total:cart.reduce(
(a,b)=>
a+b.price*b.qty,
0
),
date:new Date()
.toISOString()
}
);

alert("تم إرسال الطلب");

cart=[];

updateCart();

}

loadProducts();
