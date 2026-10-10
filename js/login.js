const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const successMessage = document.getElementById("successMessage");
const passwordToggle = document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {
    if (loginPassword.type === "password") {
        loginPassword.type = "text";
        passwordToggle.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        loginPassword.type = "password";
        passwordToggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
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

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

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

    let user;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        user = null;
    }
    if (!user) {
        emailError.textContent = "No account found. Please create an account first.";
        return;
    }

    if (!user.signupEmail || email.toLowerCase() !== user.signupEmail.trim().toLowerCase()) {
        emailError.textContent = "Invalid email address.";
        return;
    }
    if (password !== user.signupPassword) {
        passwordError.textContent = "Invalid password.";
        return;
    }
    const userName = user.signupName;
    if (!userName) {
        emailError.textContent = "Your account name is missing. Please register again.";
        return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", userName);
    localStorage.setItem("userEmail", user.signupEmail);

    successMessage.style.display = "block";

    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
    }
    setTimeout(function () {
        window.location.href = "/movies.html";
    }, 1000);
});
