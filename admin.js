import { db, collection, addDoc } from "./firebase.js";

function uploadImage(file){

let form = new FormData();
form.append("file",file);
form.append("upload_preset","storevip_upload");

return fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",{
method:"POST",
body:form
})
.then(r=>r.json())
.then(d=>d.secure_url);
}

window.addProduct = async function(){

let file = document.getElementById("img").files[0];

let url = await uploadImage(file);

await addDoc(collection(db,"products"),{
name:name.value,
price:price.value,
image:url
});

alert("تمت الإضافة إلى Firebase 🚀");
}
