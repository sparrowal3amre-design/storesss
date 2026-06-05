function register() {

    let user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        pass: document.getElementById("pass").value
    };

    users.push(user);
    saveAll();

    alert("تم التسجيل");
}

function login() {

    let email = document.getElementById("email").value;
    let pass = document.getElementById("pass").value;

    let found = users.find(u => u.email === email && u.pass === pass);

    if (found) {
        currentUser = found;
        saveAll();
        alert("تم الدخول");
        window.location.href = "index.html";
    } else {
        alert("خطأ في البيانات");
    }
}
