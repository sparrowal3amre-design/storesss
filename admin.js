import {
db,
storage,
collection,
addDoc,
ref,
uploadBytes,
getDownloadURL
} from "./firebase.js";

window.addProduct = async function(){

try{

const file = document.getElementById("img").files[0];

if(!file){
alert("اختر صورة");
return;
}

const storageRef = ref(
storage,
"products/" + Date.now() + "_" + file.name
);

await uploadBytes(storageRef,file);

const imageUrl =
await getDownloadURL(storageRef);

await addDoc(
collection(db,"products"),
{
name:name.value,
price:Number(price.value),
image:imageUrl,
created:Date.now()
}
);

alert("تمت إضافة المنتج");

}catch(err){

alert(err.message);

}

}
