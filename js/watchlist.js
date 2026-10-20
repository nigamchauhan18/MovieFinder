/* =========================================
   MOVIEFINDER — WATCHLIST PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";


    /* =========================================
       ELEMENTS
    ========================================= */

    const watchlistGrid = document.getElementById("watchlistGrid");

    const totalWatchlist = document.getElementById("totalWatchlist");
    const visibleWatchlist = document.getElementById("visibleWatchlist");

    const watchlistSearch = document.getElementById("watchlistSearch");
    const clearSearch = document.getElementById("clearSearch");

    const watchlistEmpty = document.getElementById("watchlistEmpty");
    const noSearchResults = document.getElementById("noSearchResults");

    const emptyTitle = document.getElementById("emptyTitle");
    const emptyDescription = document.getElementById("emptyDescription");

    const resultsDescription = document.getElementById("resultsDescription");

    const resetSearch = document.getElementById("resetSearch");

    const watchlistToast = document.getElementById("watchlistToast");
    const toastTitle = document.getElementById("toastTitle");
    const toastMessage = document.getElementById("toastMessage");
    const closeToast = document.getElementById("closeToast");


    /* =========================================
       STORAGE CHECK
    ========================================= */

    if (
        !window.MovieStorage ||
        typeof MovieStorage.getWatchlist !== "function" ||
        typeof MovieStorage.removeWatchlist !== "function" ||
        typeof MovieStorage.addFavorite !== "function" ||
        typeof MovieStorage.isFavorite !== "function"
    ) {
        watchlistGrid.innerHTML = `
            <div class="col-12 text-center p-4">
                <p style="color: #ff819f;">
                    Movie storage could not be loaded.
                    Please check your movieStorage.js file.
                </p>
            </div>
        `;

        console.error(
            "MovieStorage is unavailable. Make sure movieStorage.js loads before watchlist.js."
        );

        return;
    }


    /* =========================================
       VARIABLES
    ========================================= */

    let allWatchlistMovies = [];
    let toastTimer = null;


    /* =========================================
       GET WATCHLIST
    ========================================= */

    function getWatchlist() {
        try {
            const movies = MovieStorage.getWatchlist();

            return Array.isArray(movies) ? movies : [];
        } catch (error) {
            console.error("Could not retrieve watchlist:", error);

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
            <div class="watchlist-poster-fallback">
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

        const isFavorite = imdbID
            ? MovieStorage.isFavorite(imdbID)
            : false;

        const posterHTML = hasPoster
            ? `
                <img
                    class="watchlist-poster"
                    src="${escapeHTML(poster)}"
                    alt="${escapeHTML(title)} poster"
                    loading="lazy"
                    data-poster
                >
            `
            : createPosterFallback(title);


        return `
            <article
                class="watchlist-card"
                data-imdb-id="${escapeHTML(imdbID)}"
                style="animation-delay: ${Math.min(index * 45, 350)}ms"
            >

                <div class="watchlist-poster-wrapper">

                    ${posterHTML}

                    <div class="watchlist-poster-overlay">

                        <span class="watchlist-badge">
                            <i class="fa-solid fa-bookmark"></i>
                            Watch Later
                        </span>

                    </div>

                </div>


                <div class="watchlist-card-body">

                    <h3
                        class="watchlist-card-title"
                        title="${escapeHTML(title)}"
                    >
                        ${escapeHTML(title)}
                    </h3>


                    <div class="watchlist-card-meta">

                        <span>${escapeHTML(year)}</span>

                        <span class="meta-dot"></span>

                        <span class="movie-type">
                            ${escapeHTML(type)}
                        </span>

                    </div>


                    <div class="watchlist-actions">

                        <button
                            type="button"
                            class="watchlist-action-btn add-favorite-btn ${isFavorite ? "is-favorite" : ""}"
                            data-toggle-favorite="${escapeHTML(imdbID)}"
                            aria-pressed="${isFavorite}"
                            ${imdbID ? "" : "disabled"}
                        >
                            <i class="fa-solid ${isFavorite ? "fa-heart" : "fa-heart"}"></i>

                            ${isFavorite ? "In Favorites" : "Add to Favorites"}
                        </button>


                        <button
                            type="button"
                            class="watchlist-action-btn remove-watchlist-btn"
                            data-remove-watchlist="${escapeHTML(imdbID)}"
                            ${imdbID ? "" : "disabled"}
                        >
                            <i class="fa-solid fa-trash-can"></i>
                            Remove
                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    /* =========================================
       RENDER WATCHLIST
    ========================================= */

    function renderWatchlist() {
        allWatchlistMovies = getWatchlist();

        const searchTerm = watchlistSearch.value
            .trim()
            .toLowerCase();


        const filteredMovies = allWatchlistMovies.filter(function (movie) {
            const title = String(movie.Title || "").toLowerCase();
            const year = String(movie.Year || "").toLowerCase();
            const type = String(movie.Type || "").toLowerCase();

            return (
                title.includes(searchTerm) ||
                year.includes(searchTerm) ||
                type.includes(searchTerm)
            );
        });


        /* Update counters */

        totalWatchlist.textContent = allWatchlistMovies.length;
        visibleWatchlist.textContent = filteredMovies.length;

        MovieStorage.updateCounts();


        /* Update clear-search button */

        clearSearch.classList.toggle(
            "visible",
            watchlistSearch.value.length > 0
        );


        /* Reset content */

        watchlistGrid.innerHTML = "";

        watchlistEmpty.hidden = true;
        noSearchResults.hidden = true;


        /* Empty watchlist */

        if (allWatchlistMovies.length === 0) {
            watchlistEmpty.hidden = false;

            emptyTitle.textContent =
                "Your watchlist is waiting";

            emptyDescription.textContent =
                "You haven't added any movies yet. Explore MovieFinder and save movies you want to watch later.";

            resultsDescription.textContent =
                "Your watchlist is currently empty.";

            return;
        }


        /* No search matches */

        if (filteredMovies.length === 0) {
            noSearchResults.hidden = false;

            resultsDescription.textContent =
                "No movies match your search.";

            return;
        }


        /* Results description */

        if (searchTerm) {
            resultsDescription.textContent =
                `Showing ${filteredMovies.length} matching movie${filteredMovies.length === 1 ? "" : "s"}.`;
        } else {
            resultsDescription.textContent =
                "All the movies you have saved for later.";
        }


        /* Render movie cards */

        watchlistGrid.innerHTML = filteredMovies
            .map(function (movie, index) {
                return createMovieCard(movie, index);
            })
            .join("");


        /* Handle broken poster images */

        watchlistGrid
            .querySelectorAll("img[data-poster]")
            .forEach(function (image) {
                image.addEventListener("error", function () {
                    const fallback = document.createElement("div");

                    fallback.className = "watchlist-poster-fallback";

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
       TOAST NOTIFICATION
    ========================================= */

    function showToast(title, message) {
        toastTitle.textContent = title;
        toastMessage.textContent = message;

        watchlistToast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            watchlistToast.classList.remove("show");
        }, 2800);
    }


    /* =========================================
       WATCHLIST ACTIONS
    ========================================= */

    watchlistGrid.addEventListener("click", function (event) {

        /* -------------------------------------
           REMOVE FROM WATCHLIST
        ------------------------------------- */

        const removeButton = event.target.closest(
            "[data-remove-watchlist]"
        );

        if (removeButton) {
            const imdbID = removeButton.dataset.removeWatchlist;

            if (!imdbID) {
                showToast(
                    "Unable to remove movie",
                    "This movie does not have a valid IMDb ID."
                );

                return;
            }

            const movie = allWatchlistMovies.find(function (item) {
                return item.imdbID === imdbID;
            });

            const movieTitle = movie
                ? movie.Title
                : "Movie";


            const removed = MovieStorage.removeWatchlist(imdbID);

            if (removed) {
                renderWatchlist();

                showToast(
                    "Movie removed",
                    `"${movieTitle}" has been removed from your watchlist.`
                );
            } else {
                renderWatchlist();

                showToast(
                    "Unable to remove movie",
                    "Please try again."
                );
            }

            return;
        }


        /* -------------------------------------
           ADD OR REMOVE FAVORITE
        ------------------------------------- */

        const favoriteButton = event.target.closest(
            "[data-toggle-favorite]"
        );

        if (favoriteButton) {
            const imdbID = favoriteButton.dataset.toggleFavorite;

            if (!imdbID) {
                return;
            }

            const movie = allWatchlistMovies.find(function (item) {
                return item.imdbID === imdbID;
            });

            if (!movie) {
                return;
            }


            /*
               MovieStorage.addFavorite() toggles the favorite:
               - Adds it if it is not already a favorite.
               - Removes it if it is already a favorite.
            */

            const result = MovieStorage.addFavorite(movie);

            if (result === null) {
                showToast(
                    "Could not update favorites",
                    "Please try again."
                );

                return;
            }

            renderWatchlist();

            if (result === true) {
                showToast(
                    "Added to Favorites",
                    `"${movie.Title}" has been added to your favorites.`
                );
            } else {
                showToast(
                    "Removed from Favorites",
                    `"${movie.Title}" has been removed from your favorites.`
                );
            }
        }

    });


    /* =========================================
       SEARCH
    ========================================= */

    watchlistSearch.addEventListener("input", function () {
        renderWatchlist();
    });


    /* =========================================
       CLEAR SEARCH
    ========================================= */

    function clearSearchInput() {
        watchlistSearch.value = "";

        renderWatchlist();

        watchlistSearch.focus();
    }

    clearSearch.addEventListener("click", clearSearchInput);

    resetSearch.addEventListener("click", clearSearchInput);


    /* =========================================
       CLOSE TOAST
    ========================================= */

    closeToast.addEventListener("click", function () {
        watchlistToast.classList.remove("show");

        clearTimeout(toastTimer);
    });


    /* =========================================
       STORAGE SYNCHRONIZATION
    ========================================= */

    /*
       Update when localStorage changes in another tab.
    */

    window.addEventListener("storage", function (event) {
        if (
            event.key === "movieFinderWatchlist" ||
            event.key === "movieFinderFavorites"
        ) {
            renderWatchlist();
        }
    });


    /*
       Update when MovieStorage dispatches an event.
    */

    document.addEventListener("movieStorageChanged", function (event) {
        if (
            !event.detail ||
            event.detail.type === "watchlist" ||
            event.detail.type === "favorites"
        ) {
            renderWatchlist();
        }
    });


    /*
       Refresh when returning to the browser tab.
    */

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            renderWatchlist();
        }
    });


    /* =========================================
       INITIALIZE
    ========================================= */

    renderWatchlist();
});
