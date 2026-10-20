// =====================================
// MovieFinder Login
// =====================================

const USERS_KEY = "movieFinderUsers";
const USER_KEY = "movieFinderUser";
const LOGIN_KEY = "movieFinderLoggedIn";

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("userEmail");
const passwordInput = document.getElementById("userPassword");
const nameInput = document.getElementById("userName");

const loginError = document.getElementById("loginError");

// Read registered demo accounts
function getRegisteredUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

// If already logged in, return to homepage
if (localStorage.getItem(LOGIN_KEY) === "true") {
    window.location.replace("index.html");
}

// Handle login
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    loginError.textContent = "";
    loginError.classList.remove("show");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        loginError.textContent = "Please enter your email and password.";
        loginError.classList.add("show");
        return;
    }

    const users = getRegisteredUsers();

    // Find the registered account
    const user = users.find(
        account =>
            account.email.toLowerCase() === email &&
            account.password === password
    );

    if (!user) {
        loginError.textContent =
            "Invalid email or password. Please check your details or sign up.";

        loginError.classList.add("show");
        return;
    }

    // Save only profile information in the active login session.
    // The demo password remains in the registered-users array.
    const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem(LOGIN_KEY, "true");

    window.location.href = "index.html";
});

// Show/hide password
const togglePassword = document.getElementById("togglePassword");

if (togglePassword) {
    togglePassword.addEventListener("click", function () {
        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
            this.setAttribute("aria-label", "Hide password");
        } else {
            passwordInput.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
            this.setAttribute("aria-label", "Show password");
        }
    });
}
