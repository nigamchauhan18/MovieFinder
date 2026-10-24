document.addEventListener("DOMContentLoaded", function () {
    const loginNavItem = document.getElementById("loginNavItem");
    const profileNavItem = document.getElementById("profileNavItem");
    const profileName = document.getElementById("profileName");
    const profileInitials = document.getElementById("profileInitials");
    const logoutBtn = document.getElementById("logoutBtn");

    function updateNavbar() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userName = localStorage.getItem("userName");

        if (isLoggedIn && userName) {
            if (loginNavItem) {
                loginNavItem.classList.add("d-none");
            }
            if (profileNavItem) {
                profileNavItem.classList.remove("d-none");
            }
            if (profileName) {
                profileName.textContent = userName;
            }
            if (profileInitials) {
                const initials = userName
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(word => word.charAt(0))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
                profileInitials.textContent = initials;
            }
        } else {
            if (loginNavItem) {
                loginNavItem.classList.remove("d-none");
            }
            if (profileNavItem) {
                profileNavItem.classList.add("d-none");
            }
        }
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            window.location.href = "/index.html";
        });
    }
    
    updateNavbar();
});
