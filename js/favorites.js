/* =========================================
   MOVIEFINDER — FAVORITES PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================
       ELEMENTS
    ========================================= */

    const favoritesGrid = document.getElementById("favoritesGrid");

    const totalFavorites = document.getElementById("totalFavorites");
    const visibleFavorites = document.getElementById("visibleFavorites");

    const favoriteSearch = document.getElementById("favoriteSearch");
    const clearSearch = document.getElementById("clearSearch");

    const favoritesEmpty = document.getElementById("favoritesEmpty");
    const noSearchResults = document.getElementById("noSearchResults");

    const emptyTitle = document.getElementById("emptyTitle");
    const emptyDescription = document.getElementById("emptyDescription");

    const resultsDescription = document.getElementById("resultsDescription");

    const resetSearch = document.getElementById("resetSearch");

    const favoritesToast = document.getElementById("favoritesToast");
    const toastTitle = document.getElementById("toastTitle");
    const toastMessage = document.getElementById("toastMessage");
    const closeToast = document.getElementById("closeToast");


    /* =========================================
       STORAGE CHECK
    ========================================= */

    if (
        !window.MovieStorage ||
        typeof MovieStorage.getFavorites !== "function" ||
        typeof MovieStorage.removeFavorite !== "function"
    ) {
        favoritesGrid.innerHTML = `
            <div class="col-12 text-center p-4">
                <p style="color: #ff819f;">
                    Movie storage could not be loaded.
                    Please check your movieStorage.js file.
                </p>
            </div>
        `;

        console.error(
            "MovieStorage is unavailable. Make sure movieStorage.js loads before favorites.js."
        );

        return;
    }


    /* =========================================
       VARIABLES
    ========================================= */

    let allFavorites = [];
    let toastTimer = null;


    /* =========================================
       GET FAVORITES
    ========================================= */

    function getFavorites() {
        try {
            const movies = MovieStorage.getFavorites();

            return Array.isArray(movies) ? movies : [];
        } catch (error) {
            console.error("Could not retrieve favorite movies:", error);

            return [];
        }
    }


    /* =========================================
       ESCAPE HTML
    ========================================= */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }


    /* =========================================
       POSTER FALLBACK
    ========================================= */

    function createPosterFallback(title) {
        return `
            <div class="favorite-poster-fallback">
                <i class="fa-solid fa-film"></i>
                <span>${escapeHTML(title)}</span>
            </div>
        `;
    }


    /* =========================================
       CREATE MOVIE CARD
    ========================================= */

    function createMovieCard(movie, index) {
        const imdbID = String(movie.imdbID || "");
        const title = movie.Title || "Untitled Movie";
        const year = movie.Year || "Year unknown";
        const type = movie.Type || "movie";

        const poster = movie.Poster;

        const hasPoster =
            poster &&
            poster !== "N/A" &&
            /^https?:\/\//i.test(poster);

        const posterHTML = hasPoster
            ? `
                <img
                    class="favorite-poster"
                    src="${escapeHTML(poster)}"
                    alt="${escapeHTML(title)} poster"
                    loading="lazy"
                    data-poster
                >
            `
            : createPosterFallback(title);

        return `
            <article
                class="favorite-card"
                data-imdb-id="${escapeHTML(imdbID)}"
                style="animation-delay: ${Math.min(index * 45, 350)}ms"
            >

                <div class="favorite-poster-wrapper">

                    ${posterHTML}

                    <div class="favorite-poster-overlay">

                        <span class="favorite-badge">
                            <i class="fa-solid fa-heart"></i>
                            Favorite
                        </span>

                    </div>

                </div>


                <div class="favorite-card-body">

                    <h3 class="favorite-card-title"
                        title="${escapeHTML(title)}">
                        ${escapeHTML(title)}
                    </h3>

                    <div class="favorite-card-meta">

                        <span>
                            ${escapeHTML(year)}
                        </span>

                        <span class="meta-dot"></span>

                        <span class="movie-type">
                            ${escapeHTML(type)}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="remove-favorite-btn"
                        data-remove-favorite="${escapeHTML(imdbID)}"
                        aria-label="Remove ${escapeHTML(title)} from favorites"
                    >
                        <i class="fa-solid fa-heart-crack"></i>
                        Remove Favorite
                    </button>

                </div>

            </article>
        `;
    }


    /* =========================================
       RENDER FAVORITES
    ========================================= */

    function renderFavorites() {
        allFavorites = getFavorites();

        const searchTerm = favoriteSearch.value
            .trim()
            .toLowerCase();

        const filteredFavorites = allFavorites.filter(function (movie) {
            const title = String(movie.Title || "").toLowerCase();
            const year = String(movie.Year || "").toLowerCase();
            const type = String(movie.Type || "").toLowerCase();

            return (
                title.includes(searchTerm) ||
                year.includes(searchTerm) ||
                type.includes(searchTerm)
            );
        });


        /* Update counts */

        totalFavorites.textContent = allFavorites.length;
        visibleFavorites.textContent = filteredFavorites.length;

        MovieStorage.updateCounts();


        /* Update search clear button */

        clearSearch.classList.toggle(
            "visible",
            favoriteSearch.value.length > 0
        );


        /* Reset result containers */

        favoritesGrid.innerHTML = "";

        favoritesEmpty.hidden = true;
        noSearchResults.hidden = true;


        /* No saved movies */

        if (allFavorites.length === 0) {
            favoritesEmpty.hidden = false;

            emptyTitle.textContent =
                "Your favorite collection is waiting";

            emptyDescription.textContent =
                "You haven't saved any movies yet. Explore movies and add the ones you love to your favorites.";

            resultsDescription.textContent =
                "Your collection is currently empty.";

            return;
        }


        /* Search returned no movies */

        if (filteredFavorites.length === 0) {
            noSearchResults.hidden = false;

            resultsDescription.textContent =
                "No movies match your search.";

            return;
        }


        /* Update results description */

        if (searchTerm) {
            resultsDescription.textContent =
                `Showing ${filteredFavorites.length} matching movie${filteredFavorites.length === 1 ? "" : "s"}.`;
        } else {
            resultsDescription.textContent =
                "All your favorite movies in one place.";
        }


        /* Render movie cards */

        favoritesGrid.innerHTML = filteredFavorites
            .map(function (movie, index) {
                return createMovieCard(movie, index);
            })
            .join("");


        /* Handle broken poster images */

        favoritesGrid
            .querySelectorAll("img[data-poster]")
            .forEach(function (image) {
                image.addEventListener("error", function () {
                    const fallback = document.createElement("div");

                    fallback.className = "favorite-poster-fallback";

                    const icon = document.createElement("i");
                    icon.className = "fa-solid fa-film";

                    const title = document.createElement("span");
                    title.textContent =
                        image.alt.replace(/\s+poster$/i, "");

                    fallback.append(icon, title);

                    image.replaceWith(fallback);
                }, { once: true });
            });
    }


    /* =========================================
       SHOW TOAST
    ========================================= */

    function showToast(title, message) {
        toastTitle.textContent = title;
        toastMessage.textContent = message;

        favoritesToast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            favoritesToast.classList.remove("show");
        }, 2800);
    }


    /* =========================================
       REMOVE FAVORITE
    ========================================= */

    favoritesGrid.addEventListener("click", function (event) {
        const removeButton = event.target.closest(
            "[data-remove-favorite]"
        );

        if (!removeButton) {
            return;
        }

        const imdbID = removeButton.dataset.removeFavorite;

        if (!imdbID) {
            showToast(
                "Unable to remove movie",
                "This movie does not have a valid IMDb ID."
            );

            return;
        }


        /* Find movie before removing it */

        const movie = allFavorites.find(function (item) {
            return item.imdbID === imdbID;
        });

        const movieTitle = movie
            ? movie.Title
            : "Movie";


        /* Remove using the existing MovieStorage API */

        const removed = MovieStorage.removeFavorite(imdbID);

        if (removed) {
            renderFavorites();

            showToast(
                "Favorite removed",
                `"${movieTitle}" has been removed from your favorites.`
            );
        } else {
            renderFavorites();

            showToast(
                "Unable to remove movie",
                "The movie could not be removed. Please try again."
            );
        }
    });


    /* =========================================
       SEARCH
    ========================================= */

    favoriteSearch.addEventListener("input", function () {
        renderFavorites();
    });


    /* =========================================
       CLEAR SEARCH
    ========================================= */

    function clearSearchInput() {
        favoriteSearch.value = "";

        renderFavorites();

        favoriteSearch.focus();
    }

    clearSearch.addEventListener("click", clearSearchInput);

    resetSearch.addEventListener("click", clearSearchInput);


    /* =========================================
       CLOSE TOAST
    ========================================= */

    closeToast.addEventListener("click", function () {
        favoritesToast.classList.remove("show");

        clearTimeout(toastTimer);
    });


    /* =========================================
       STORAGE SYNCHRONIZATION
    ========================================= */

    /*
       Updates the Favorites page when localStorage changes
       in another browser tab.
    */

    window.addEventListener("storage", function (event) {
        if (
            event.key === "movieFinderFavorites" ||
            event.key === "movieFinderWatchlist"
        ) {
            renderFavorites();
        }
    });


    /*
       Updates the page when another page uses MovieStorage
       and dispatches movieStorageChanged.
    */

    document.addEventListener("movieStorageChanged", function (event) {
        if (
            !event.detail ||
            event.detail.type === "favorites"
        ) {
            renderFavorites();
        }
    });


    /*
       Refreshes favorites when the user returns to this tab.
    */

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            renderFavorites();
        }
    });


    /* =========================================
       INITIALIZE PAGE
    ========================================= */

    renderFavorites();

});