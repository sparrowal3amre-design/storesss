const PASSWORD = "1234";

function login() {
    let p = document.getElementById("pass").value;

    if (p === PASSWORD) {
        document.getElementById("login").style.display = "none";
        document.getElementById("panel").style.display = "block";
        render();
    } else {
        alert("خطأ");
    }
}

function add() {

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const file = document.getElementById("image").files[0];

    const reader = new FileReader();

    reader.onload = function () {

        products.push({
            id: Date.now(),
            name,
            price,
            image: reader.result
        });

        save();
        render();
    };

    reader.readAsDataURL(file);
}

function render() {
    let box = document.getElementById("list");
    box.innerHTML = "";

    products.forEach((p, i) => {
        box.innerHTML += `
        <div>
            ${p.name} - ${p.price}$
            <button onclick="del(${i})">حذف</button>
        </div>
        `;
    });
}

function del(i) {
    products.splice(i, 1);
    save();
    render();
}
