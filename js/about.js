// Update the copyright year
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Update Favorites and Watchlist counts
if (window.MovieStorage) {
    MovieStorage.updateCounts();
}

// Update counts when movie storage changes
window.addEventListener("movieStorageChanged", function () {
    if (window.MovieStorage) {
        MovieStorage.updateCounts();
    }
});
