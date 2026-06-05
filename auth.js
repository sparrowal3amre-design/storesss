import {
auth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "./firebase.js";

window.register = async function(){
await createUserWithEmailAndPassword(auth,email.value,pass.value);
alert("Account created");
}

window.login = async function(){
await signInWithEmailAndPassword(auth,email.value,pass.value);
alert("Login success");
location.href="index.html";
}
