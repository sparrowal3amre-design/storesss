import {
auth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "./firebase.js";

window.register = async function(){

try{

await createUserWithEmailAndPassword(
auth,
email.value,
pass.value
);

alert("تم إنشاء الحساب");

}catch(e){

alert(e.message);

}

}

window.login = async function(){

try{

await signInWithEmailAndPassword(
auth,
email.value,
pass.value
);

location.href="index.html";

}catch(e){

alert(e.message);

}

}
