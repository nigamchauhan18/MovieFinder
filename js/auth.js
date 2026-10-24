const USER_KEY = "movieFinderUser";
const LOGIN_KEY = "movieFinderLoggedIn";

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (error) {
        return null;
    }
}

function isLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) === "true"
        && getCurrentUser() !== null;
}

// Update the navbar according to login state
function updateNavbarAuth() {
    const loginNavItem = document.getElementById("loginNavItem");
    const profileNavItem = document.getElementById("profileNavItem");

    const navUserName = document.getElementById("navUserName");
    const navUserEmail = document.getElementById("navUserEmail");

    const user = getCurrentUser();
    const loggedIn = isLoggedIn();

    if (loginNavItem) {
        loginNavItem.classList.toggle("d-none", loggedIn);
    }

    if (profileNavItem) {
        profileNavItem.classList.toggle("d-none", !loggedIn);
    }

    if (loggedIn && user) {
        if (navUserName) {
            navUserName.textContent = user.name;
        }

        if (navUserEmail) {
            navUserEmail.textContent = user.email;
        }
    }
}

// Login form
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    // If already logged in, go back to the homepage
    if (isLoggedIn()) {
        window.location.replace("index.html");
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("userName");
        const emailInput = document.getElementById("userEmail");
        const passwordInput = document.getElementById("userPassword");

        const errorBox = document.getElementById("loginError");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        errorBox.textContent = "";
        errorBox.classList.remove("show");

        // Basic frontend validation
        if (!name || !email || !password) {
            errorBox.textContent = "Please fill in all fields.";
            errorBox.classList.add("show");
            return;
        }

        if (password.length < 6) {
            errorBox.textContent =
                "Password must contain at least 6 characters.";

            errorBox.classList.add("show");
            return;
        }

        // Save profile information for this demo
        const user = {
            name: name,
            email: email
        };

        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(LOGIN_KEY, "true");

        // Return to the homepage
        window.location.href = "index.html";
    });
}

// Show/hide password
const togglePassword = document.getElementById("togglePassword");

if (togglePassword) {
    togglePassword.addEventListener("click", function () {
        const passwordInput = document.getElementById("userPassword");
        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

            this.setAttribute("aria-label", "Hide password");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

            this.setAttribute("aria-label", "Show password");
        }
    });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem(LOGIN_KEY);
        localStorage.removeItem(USER_KEY);

        window.location.href = "index.html";
    });
}

// Update the navbar on every page where auth.js is included
updateNavbarAuth();
