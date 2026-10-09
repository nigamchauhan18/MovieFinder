let loginForm = document.getElementById("loginForm");
let loginEmail = document.getElementById("loginEmail");
let loginPassword = document.getElementById("loginPassword");
let emailError = document.getElementById("emailError");
let passwordError = document.getElementById("passwordError");
let successMessage = document.getElementById("successMessage");
let passwordToggle = document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {
    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        passwordToggle.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`;
    } else {
        loginPassword.type = "password";
        passwordToggle.innerHTML = `<i class="fa-solid fa-eye"></i>`;
    }
});

loginEmail.addEventListener("input", function () {
    emailError.textContent = "";
});
loginPassword.addEventListener("input", function () {
    passwordError.textContent = "";
});

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    
    let email = loginEmail.value;
    let password = loginPassword.value;

    let valid = true;
    if (email === "") {
        emailError.textContent = "Please enter your email.";
        valid = false;
    }
    if (password === "") {
        passwordError.textContent = "Please enter your password.";
        valid = false;
    }
    if (!valid) {
        return;
    }

    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        emailError.textContent = "No account found. Please create an account first.";
        return;
    }
    if (email !== user.signupEmail) {
        emailError.textContent = "Invalid email address.";
        return;
    }
    if (password !== user.signupPassword) {
        passwordError.textContent = "Invalid password.";
        return;
    }
    localStorage.setItem("isLoggedIn", "true");

    successMessage.style.display = "block";
    setTimeout(function () {
        window.location.href = "/movies.html";
    }, 1000);
});
