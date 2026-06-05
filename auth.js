function register(){
users.push({
email:email.value,
password:pass.value
});

localStorage.setItem("users",JSON.stringify(users));
alert("تم التسجيل");
}

function login(){

let u = users.find(x=>x.email==email.value && x.password==pass.value);

if(u){
currentUser = u;
localStorage.setItem("currentUser",JSON.stringify(u));
alert("تم الدخول");
location.href="index.html";
} else {
alert("خطأ");
}
}
