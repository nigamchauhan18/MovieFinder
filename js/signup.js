let signupForm = document.getElementById("signupForm");

let signupName = document.getElementById("signupName");
let signupEmail = document.getElementById("signupEmail");
let signupPassword = document.getElementById("signupPassword");
let confirmPassword = document.getElementById("confirmPassword");
let terms = document.getElementById("terms");
let nameError = document.getElementById("nameError");
let emailError = document.getElementById("emailError");
let passwordError = document.getElementById("passwordError");
let confirmPasswordError = document.getElementById("confirmPasswordError");
let passwordToggle = document.getElementById("passwordToggle");
let confirmPasswordToggle = document.getElementById("confirmPasswordToggle");
let termsError = document.getElementById("termsError");
let successMessage = document.getElementById("successMessage");

passwordToggle.addEventListener("click", function () {
    if (signupPassword.type === "password") {
        signupPassword.type = "text";
        passwordToggle.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`;
    } else {
        signupPassword.type = "password";
        passwordToggle.innerHTML = `<i class="fa-solid fa-eye"></i>`;
    }
});
confirmPasswordToggle.addEventListener("click", function () {
    if (confirmPassword.type === "password") {
        confirmPassword.type = "text";
        confirmPasswordToggle.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`;
    } else {
        confirmPassword.type = "password";
        confirmPasswordToggle.innerHTML = `<i class="fa-solid fa-eye"></i>`;
    }
});

signupName.addEventListener("input", function () {
    nameError.textContent = "";
});
signupEmail.addEventListener("input", function () {
    emailError.textContent = "";
});
signupPassword.addEventListener("input", function () {
    passwordError.textContent = "";
});
confirmPassword.addEventListener("input", function () {
    confirmPasswordError.textContent = "";
});
terms.addEventListener("change", function () {
    termsError.textContent = "";
});

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    successMessage.style.display = "none";

    let name = signupName.value;
    let email = signupEmail.value;
    let password = signupPassword.value;
    let confirm = confirmPassword.value;

    let valid = true;
    if (name === "") {
        nameError.textContent = "Please enter your name.";
        valid = false;
    }
    if (email === "") {
        emailError.textContent = "Please enter your email.";
        valid = false;
    }
    if (password === "") {
        passwordError.textContent = "Please create a password.";
        valid = false;
    }
    if (confirm === "") {
        confirmPasswordError.textContent = "Please confirm your password.";
        valid = false;
    }
    if (!terms.checked) {
        termsError.textContent = "Please accept the Terms & Conditions.";
        valid = false;
    }
    if (!valid) {
        return;
    }

    let user = {
        signupName: name,
        signupEmail: email,
        signupPassword: password,
        confirmPassword: confirm
    };
    localStorage.setItem("user", JSON.stringify(user));

    successMessage.style.display = "block";
    
    signupForm.reset();
    
    setTimeout(function () {
        window.location.href = "/login.html";
    }, 1500);
});
