import {
auth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "./firebase.js";

window.register = async function(){
await createUserWithEmailAndPassword(auth,email.value,pass.value);
alert("تم التسجيل");
}

window.login = async function(){
await signInWithEmailAndPassword(auth,email.value,pass.value);
alert("تم الدخول");
location.href="index.html";
}
