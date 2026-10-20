// =====================================
// MovieFinder Signup
// =====================================

const USERS_KEY = "movieFinderUsers";

const signupForm = document.getElementById("signupForm");

const nameInput = document.getElementById("signupName");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsCheckbox = document.getElementById("signupTerms");

const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const termsError = document.getElementById("termsError");

const signupSubmit = signupForm.querySelector('button[type="submit"]');

// Get registered demo accounts
function getRegisteredUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

// Display field errors
function showFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.add("invalid");
    input.classList.remove("valid");
}

// Clear field errors
function clearFieldError(input, errorElement) {
    errorElement.textContent = "";
    input.classList.remove("invalid");
}

// Validate name
function validateName() {
    const name = nameInput.value.trim();

    if (name.length < 2) {
        showFieldError(
            nameInput,
            nameError,
            "Name must contain at least 2 characters."
        );
        return false;
    }

    if (name.length > 60) {
        showFieldError(
            nameInput,
            nameError,
            "Name cannot exceed 60 characters."
        );
        return false;
    }

    clearFieldError(nameInput, nameError);
    return true;
}

// Validate email
function validateEmail() {
    const email = emailInput.value.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showFieldError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );
        return false;
    }

    const users = getRegisteredUsers();

    const alreadyRegistered = users.some(
        user => user.email.toLowerCase() === email
    );

    if (alreadyRegistered) {
        showFieldError(
            emailInput,
            emailError,
            "This email is already registered. Please log in."
        );
        return false;
    }

    clearFieldError(emailInput, emailError);
    return true;
}

// Validate password
function validatePassword() {
    const password = passwordInput.value;

    if (password.length < 6) {
        showFieldError(
            passwordInput,
            passwordError,
            "Password must contain at least 6 characters."
        );
        return false;
    }

    if (password.length > 128) {
        showFieldError(
            passwordInput,
            passwordError,
            "Password cannot exceed 128 characters."
        );
        return false;
    }

    clearFieldError(passwordInput, passwordError);
    return true;
}

// Validate confirm password
function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
        showFieldError(
            confirmPasswordInput,
            confirmPasswordError,
            "Please confirm your password."
        );
        return false;
    }

    if (password !== confirmPassword) {
        showFieldError(
            confirmPasswordInput,
            confirmPasswordError,
            "Passwords do not match."
        );
        return false;
    }

    clearFieldError(confirmPasswordInput, confirmPasswordError);
    return true;
}

// Validate terms
function validateTerms() {
    if (!termsCheckbox.checked) {
        termsError.textContent =
            "Please agree to the Terms and Conditions.";
        return false;
    }

    termsError.textContent = "";
    return true;
}

// Validate fields as the user types
nameInput.addEventListener("input", validateName);

emailInput.addEventListener("input", function () {
    // Avoid showing the duplicate-email error before the user enters an email.
    if (emailInput.value.trim()) {
        validateEmail();
    } else {
        clearFieldError(emailInput, emailError);
    }
});

passwordInput.addEventListener("input", function () {
    validatePassword();

    if (confirmPasswordInput.value) {
        validateConfirmPassword();
    }
});

confirmPasswordInput.addEventListener("input", validateConfirmPassword);

termsCheckbox.addEventListener("change", validateTerms);

// Show/hide password buttons
document.querySelectorAll(".signup-password-toggle").forEach(button => {
    button.addEventListener("click", function () {
        const targetId = this.dataset.target;
        const input = document.getElementById(targetId);
        const icon = this.querySelector("i");

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
            this.setAttribute("aria-label", "Hide password");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
            this.setAttribute("aria-label", "Show password");
        }
    });
});

// Submit signup form
signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    signupError.classList.remove("show");
    signupSuccess.classList.remove("show");

    const validName = validateName();
    const validEmail = validateEmail();
    const validPassword = validatePassword();
    const validConfirmPassword = validateConfirmPassword();
    const validTerms = validateTerms();

    if (
        !validName ||
        !validEmail ||
        !validPassword ||
        !validConfirmPassword ||
        !validTerms
    ) {
        signupError.textContent =
            "Please correct the highlighted fields and try again.";

        signupError.classList.add("show");
        return;
    }

    const users = getRegisteredUsers();

    const email = emailInput.value.trim().toLowerCase();

    // Check again immediately before saving
    if (users.some(user => user.email.toLowerCase() === email)) {
        showFieldError(
            emailInput,
            emailError,
            "This email is already registered. Please log in."
        );
        return;
    }

    const newUser = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),

        name: nameInput.value.trim(),
        email: email,

        // Demo only: never store real passwords in localStorage.
        password: passwordInput.value
    };

    users.push(newUser);

    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        signupError.textContent =
            "Unable to save your account. Check your browser storage settings.";

        signupError.classList.add("show");
        return;
    }

    signupSuccess.textContent =
        "Account created successfully! Redirecting you to Login...";

    signupSuccess.classList.add("show");

    signupSubmit.disabled = true;

    // Registration does not automatically log the user in.
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
});

// Terms and Conditions modal
const termsLink = document.getElementById("termsLink");

if (termsLink) {
    termsLink.addEventListener("click", function (event) {
        event.preventDefault();

        const termsModal = document.getElementById("termsModal");

        bootstrap.Modal
            .getOrCreateInstance(termsModal)
            .show();
    });
}
