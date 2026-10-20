/* =====================================================
   MOVIEFINDER — CONTACT PAGE
   File: js/contact.js
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const contactForm = document.getElementById("contactForm");

    const fullName = document.getElementById("fullName");
    const emailID = document.getElementById("emailID");
    const selectSubject = document.getElementById("selectSubject");
    const textareaText = document.getElementById("textareaText");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const subjectError = document.getElementById("subjectError");
    const messageError = document.getElementById("messageError");

    const charCount = document.getElementById("charCount");

    const successToast = document.getElementById("successToast");
    const toastClose = document.getElementById("toastClose");

    const submitBtn = document.getElementById("submitBtn");

    const STORAGE_KEY = "movieFinderContactMessages";

    let toastTimer;


    // ==========================================
    // READ SAVED MESSAGES
    // ==========================================

    function readMessages() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const messages = JSON.parse(saved);

            return Array.isArray(messages) ? messages : [];

        } catch (error) {
            console.error("Could not read messages:", error);
            return [];
        }
    }


    // ==========================================
    // VALIDATION HELPERS
    // ==========================================

    function showError(input, errorElement, message) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");

        errorElement.textContent = message;
    }


    function showValid(input, errorElement) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");

        errorElement.textContent = "";
    }


    function validateName() {
        const value = fullName.value.trim();

        if (!value) {
            showError(
                fullName,
                nameError,
                "Please enter your full name."
            );

            return false;
        }

        if (value.length < 2) {
            showError(
                fullName,
                nameError,
                "Name must contain at least 2 characters."
            );

            return false;
        }

        showValid(fullName, nameError);

        return true;
    }


    function validateEmail() {
        const value = emailID.value.trim();

        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            showError(
                emailID,
                emailError,
                "Please enter your email address."
            );

            return false;
        }

        if (!pattern.test(value)) {
            showError(
                emailID,
                emailError,
                "Please enter a valid email address."
            );

            return false;
        }

        showValid(emailID, emailError);

        return true;
    }


    function validateSubject() {
        if (!selectSubject.value) {
            showError(
                selectSubject,
                subjectError,
                "Please select a subject."
            );

            return false;
        }

        showValid(selectSubject, subjectError);

        return true;
    }


    function validateMessage() {
        const value = textareaText.value.trim();

        if (!value) {
            showError(
                textareaText,
                messageError,
                "Please enter your message."
            );

            return false;
        }

        if (value.length < 10) {
            showError(
                textareaText,
                messageError,
                "Message must contain at least 10 characters."
            );

            return false;
        }

        if (value.length > 1000) {
            showError(
                textareaText,
                messageError,
                "Message cannot exceed 1000 characters."
            );

            return false;
        }

        showValid(textareaText, messageError);

        return true;
    }


    // ==========================================
    // VALIDATE WHEN USERS EDIT FIELDS
    // ==========================================

    fullName.addEventListener("input", validateName);

    emailID.addEventListener("input", validateEmail);

    selectSubject.addEventListener("change", validateSubject);

    textareaText.addEventListener("input", function () {
        charCount.textContent = textareaText.value.length;

        validateMessage();
    });


    // ==========================================
    // TOAST NOTIFICATION
    // ==========================================

    function hideToast() {
        successToast.classList.remove("show");

        clearTimeout(toastTimer);
    }


    function showToast() {
        clearTimeout(toastTimer);

        successToast.classList.add("show");

        toastTimer = setTimeout(hideToast, 3500);
    }


    toastClose.addEventListener("click", hideToast);


    // ==========================================
    // FORM SUBMISSION
    // ==========================================

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const validName = validateName();
        const validEmail = validateEmail();
        const validSubject = validateSubject();
        const validMessage = validateMessage();

        if (
            !validName ||
            !validEmail ||
            !validSubject ||
            !validMessage
        ) {
            const firstInvalidField =
                contactForm.querySelector(".is-invalid");

            if (firstInvalidField) {
                firstInvalidField.focus();
            }

            return;
        }


        const message = {
            id: Date.now(),

            fullName: fullName.value.trim(),

            emailID: emailID.value.trim(),

            selectSubject: selectSubject.value,

            textareaText: textareaText.value.trim(),

            createdAt: new Date().toISOString()
        };


        // Save to browser storage.

        submitBtn.disabled = true;

        try {
            const messages = readMessages();

            messages.unshift(message);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(messages)
            );

            // Reset the form.

            contactForm.reset();

            charCount.textContent = "0";

            [
                [fullName, nameError],
                [emailID, emailError],
                [selectSubject, subjectError],
                [textareaText, messageError]
            ].forEach(function ([input, errorElement]) {
                input.classList.remove("is-invalid", "is-valid");
                errorElement.textContent = "";
            });

            showToast();

        } catch (error) {
            console.error("Could not save contact message:", error);

            alert(
                "Unable to save your message in this browser. " +
                "Please check your browser storage settings and try again."
            );

        } finally {
            submitBtn.disabled = false;
        }
    });

});
