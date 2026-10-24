async function fetchData() {
    const url = 'https://www.omdbapi.com/?apikey=debaf989&t=The Avengers';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
// fetchData();





document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const API_KEY = "debaf989";
    const API_URL = "https://www.omdbapi.com/";

    const homeSearchForm = document.getElementById("homeSearchForm");
    const homeSearchInput = document.getElementById("homeSearchInput");
    const searchButton = document.getElementById("searchButton");

    const featuredMovies = document.getElementById("featuredMovies");
    const featuredHeading = document.getElementById("featuredHeading");
    const featuredDescription = document.getElementById("featuredDescription");

    const clearSearchButton = document.getElementById("clearSearchButton");
    const loadMoreButton = document.getElementById("loadMoreButton");
    const movieTabs = document.getElementById("movieTabs");

    const movieModalElement = document.getElementById("movieModal");
    const movieModalTitle = document.getElementById("movieModalTitle");
    const movieModalBody = document.getElementById("movieModalBody");

    const appToastElement = document.getElementById("appToast");
    const toastMessage = document.getElementById("toastMessage");

    const movieModal = movieModalElement
        ? new bootstrap.Modal(movieModalElement)
        : null;    

    const appToast = appToastElement
        ? new bootstrap.Toast(appToastElement, { delay: 2500 })
        : null;
        
    // 2. APPLICATION STATE
    let currentQuery = "Avengers";
    let currentPage = 1;
    let totalResults = 0;
    let currentMovies = [];
    let isLoading = false;
    let isSearchMode = false;

    const movieDetailsCache = new Map();
    
    // 3. API REQUESTS
    async function fetchFromOMDb(params) {
        const query = new URLSearchParams({
            apikey: API_KEY,
            ...params
        });

        const response = await fetch(`${API_URL}?${query.toString()}`);

        if (!response.ok) {
            throw new Error(
                `Movie service returned HTTP ${response.status}.`
            );
        }

        const data = await response.json();

        if (data.Response === "False") {
            throw new Error(
                data.Error || "No movie information was found."
            );
        }
        return data;
    }

    async function searchMovies(query, page = 1) {
        return fetchFromOMDb({
            s: query,
            page: String(page),
            type: "movie"
        });
    }

    async function getMovieDetails(imdbID) {
        if (movieDetailsCache.has(imdbID)) {
            return movieDetailsCache.get(imdbID);
        }

        const details = await fetchFromOMDb({
            i: imdbID,
            plot: "full"
        });
        movieDetailsCache.set(imdbID, details);
        return details;
    }
    
    // 4. TOAST NOTIFICATIONS
    function showToast(message) {
        if (!appToast || !toastMessage) {
            console.log(message);
            return;
        }
        toastMessage.textContent = message;
        appToast.show();
    }
    
    // 5. HTML HELPERS
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];
        });
    }

    function validPoster(poster) {
        return poster && poster !== "N/A";
    }

    function getPosterHTML(movie) {
        if (validPoster(movie.Poster)) {
            const posterURL = escapeHTML(movie.Poster);

            return `
                <img class="movie-poster" src="${posterURL}" alt="${escapeHTML(movie.Title)} poster" loading="lazy">
            `;
        }

        return `
            <div class="poster-placeholder">
                <i class="fa-solid fa-film"></i>
            </div>
        `;
    }

    function getRating(details) {
        if (!details) {
            return "—";
        }
        const rating = details.imdbRating;
        if (!rating || rating === "N/A") {
            return "—";
        }
        return rating;
    }
    
    // 6. LOADING AND ERROR STATES
    function showLoading(message = "Discovering amazing movies...") {
        featuredMovies.innerHTML = `
            <div class="col-12">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h3>${escapeHTML(message)}</h3>
                    <p>
                        Just a moment while we find something great.
                    </p>
                </div>
            </div>
        `;
    }

    function showError(message) {
        featuredMovies.innerHTML = `
            <div class="col-12">
                <div class="error-state">
                    <div class="error-state-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3>We couldn't load the movies</h3>
                    <p>${escapeHTML(message)}</p>
                    <button
                        type="button"
                        class="retry-btn"
                        id="retryMoviesButton"
                    >
                        <i class="fa-solid fa-rotate-right me-2"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
        const retryButton = document.getElementById("retryMoviesButton");

        if (retryButton) {
            retryButton.addEventListener("click", function () {
                loadMovies(currentQuery, currentPage, false);
            });
        }
    }

    function showEmptyState(query) {
        featuredMovies.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <h3>No movies found</h3>
                    <p>
                        We couldn't find movies matching
                        "${escapeHTML(query)}".
                        Try a different title or check the spelling.
                    </p>
                </div>
            </div>
        `;
    }
    
    // 7. MOVIE CARD TEMPLATE
    function createMovieCard(movie) {
        const favorite = MovieStorage.isFavorite(movie.imdbID);
        const watchlisted = MovieStorage.isInWatchlist(movie.imdbID);
        return `
            <div class="col-6 col-md-4 col-lg-3 col-xl-2 movie-column">
                <article class="movie-card" data-imdb-id="${escapeHTML(movie.imdbID)}">
                    <div class="movie-poster-wrapper">
                        ${getPosterHTML(movie)}
                        <span class="movie-rating" data-rating-for="${escapeHTML(movie.imdbID)}">
                            <i class="fa-solid fa-star"></i>
                            <span>—</span>
                        </span>
                        <div class="movie-card-actions">
                            <button
                                type="button"
                                class="movie-action-btn favorite-action ${favorite ? "is-active" : ""}"
                                data-action="favorite"
                                data-imdb-id="${escapeHTML(movie.imdbID)}"
                                aria-label="${favorite ? "Remove from favorites" : "Add to favorites"}"
                                title="${favorite ? "Remove from favorites" : "Add to favorites"}"
                                aria-pressed="${favorite}">
                                <i class="${favorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                            </button>
                            <button
                                type="button"
                                class="movie-action-btn watchlist-action ${watchlisted ? "is-active" : ""}"
                                data-action="watchlist"
                                data-imdb-id="${escapeHTML(movie.imdbID)}"
                                aria-label="${watchlisted ? "Remove from watchlist" : "Add to watchlist"}"
                                title="${watchlisted ? "Remove from watchlist" : "Add to watchlist"}"
                                aria-pressed="${watchlisted}"
                            >
                                <i class="fa-solid fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="movie-card-body">
                        <span class="movie-year">
                            ${escapeHTML(movie.Year || "Year unavailable")}
                        </span>
                        <a
                            href="#movieModal"
                            class="movie-title"
                            data-action="details"
                            data-imdb-id="${escapeHTML(movie.imdbID)}"
                        >
                            ${escapeHTML(movie.Title)}
                        </a>
                        <div class="movie-card-footer">
                            <span class="movie-type">
                                ${escapeHTML(movie.Type || "Movie")}
                            </span>
                            <button
                                type="button"
                                class="movie-details-btn"
                                data-action="details"
                                data-imdb-id="${escapeHTML(movie.imdbID)}"
                            >
                                Details
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }

    // 8. LOAD RATINGS
    async function loadRatings(movies) {
        const batch = movies.slice(0, 6);

        await Promise.allSettled(
            batch.map(async function (movie) {
                const ratingElement = document.querySelector(
                    `[data-rating-for="${CSS.escape(movie.imdbID)}"]`
                );

                if (!ratingElement) {
                    return;
                }

                try {
                    const details = await getMovieDetails(movie.imdbID);
                    if (!ratingElement.isConnected) {
                        return;
                    }
                    const ratingText = ratingElement.querySelector("span");
                    if (ratingText) {
                        ratingText.textContent = getRating(details);
                    }

                } catch (error) {
                    const ratingText = ratingElement.querySelector("span");

                    if (ratingText) {
                        ratingText.textContent = "—";
                    }
                }
            })
        );
    }
    
    // 9. RENDER MOVIES

    function renderMovies(movies, append = false) {
        if (!append) {
            currentMovies = [];
        }

        if (!movies || movies.length === 0) {
            if (!append) {
                showEmptyState(currentQuery);
            }

            return;
        }

        currentMovies = append
            ? currentMovies.concat(movies)
            : movies.slice();

        const html = movies.map(createMovieCard).join("");

        if (append) {
            featuredMovies.insertAdjacentHTML("beforeend", html);
        } else {
            featuredMovies.innerHTML = html;
        }

        loadRatings(movies);
    }


    /* =====================================
       10. LOAD MOVIES FROM API
    ===================================== */

    async function loadMovies(query, page = 1, append = false) {
        if (isLoading) {
            return;
        }

        if (!query || !query.trim()) {
            showToast("Enter a movie title to search.");
            return;
        }

        isLoading = true;

        currentQuery = query.trim();
        currentPage = page;

        if (!append) {
            showLoading(
                isSearchMode
                    ? "Searching for movies..."
                    : "Discovering amazing movies..."
            );
        }

        if (searchButton) {
            searchButton.disabled = true;
        }

        if (loadMoreButton) {
            loadMoreButton.disabled = true;
            loadMoreButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading...
            `;
        }

        try {
            const data = await searchMovies(currentQuery, page);

            totalResults = Number(data.totalResults || 0);

            const movies = Array.isArray(data.Search)
                ? data.Search
                : [];

            if (movies.length === 0 && !append) {
                showEmptyState(currentQuery);
                return;
            }

            renderMovies(movies, append);

            if (featuredHeading) {
                featuredHeading.innerHTML = isSearchMode
                    ? `Search <span>Results.</span>`
                    : `Movies Worth <span>Watching.</span>`;
            }

            if (featuredDescription) {
                featuredDescription.textContent = isSearchMode
                    ? `Showing movies matching "${currentQuery}".`
                    : "Explore popular picks and discover your next unforgettable movie.";
            }

            if (clearSearchButton) {
                clearSearchButton.hidden = !isSearchMode;
            }

            updateLoadMoreButton();

        } catch (error) {
            console.error("Movie search failed:", error);

            if (!append) {
                showError(
                    error.message ||
                    "Please check your internet connection and try again."
                );
            } else {
                showToast("Couldn't load more movies. Please try again.");
            }

        } finally {
            isLoading = false;

            if (searchButton) {
                searchButton.disabled = false;
            }

            if (loadMoreButton) {
                loadMoreButton.disabled = false;
                loadMoreButton.innerHTML = `
                    Discover More Movies
                    <i class="fa-solid fa-arrow-right"></i>
                `;
            }
        }
    }


    /* =====================================
       11. LOAD MORE BUTTON
    ===================================== */

    function updateLoadMoreButton() {
        if (!loadMoreButton) {
            return;
        }

        const displayedCount = currentMovies.length;

        const hasMore = displayedCount < totalResults &&
            displayedCount < 100;

        loadMoreButton.hidden = !hasMore;

        if (hasMore) {
            loadMoreButton.disabled = false;
            loadMoreButton.innerHTML = `
                Discover More Movies
                <i class="fa-solid fa-arrow-right"></i>
            `;
        }
    }


    /* =====================================
       12. SEARCH FORM
    ===================================== */

    homeSearchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const query = homeSearchInput.value.trim();

        if (!query) {
            showToast("Please enter a movie title.");
            homeSearchInput.focus();
            return;
        }

        isSearchMode = true;
        currentPage = 1;

        if (movieTabs) {
            movieTabs.querySelectorAll(".movie-tab").forEach(tab => {
                tab.classList.remove("active");
            });
        }

        loadMovies(query, 1, false);

        document.getElementById("featured").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });


    /* =====================================
       13. CATEGORY BUTTONS
    ===================================== */

    if (movieTabs) {
        movieTabs.addEventListener("click", function (event) {
            const tab = event.target.closest(".movie-tab");

            if (!tab) {
                return;
            }

            movieTabs.querySelectorAll(".movie-tab").forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            const query = tab.dataset.query;

            isSearchMode = false;
            currentPage = 1;

            if (homeSearchInput) {
                homeSearchInput.value = "";
            }

            loadMovies(query, 1, false);
        });
    }


    /* =====================================
       14. CLEAR SEARCH
    ===================================== */

    if (clearSearchButton) {
        clearSearchButton.addEventListener("click", function () {
            isSearchMode = false;
            currentPage = 1;

            if (homeSearchInput) {
                homeSearchInput.value = "";
            }

            if (movieTabs) {
                const firstTab = movieTabs.querySelector(".movie-tab");

                movieTabs.querySelectorAll(".movie-tab").forEach(tab => {
                    tab.classList.remove("active");
                });

                if (firstTab) {
                    firstTab.classList.add("active");
                }
            }

            loadMovies("Avengers", 1, false);
        });
    }


    /* =====================================
       15. LOAD MORE MOVIES
    ===================================== */

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", function () {
            if (isLoading) {
                return;
            }

            if (currentMovies.length >= 100) {
                showToast("You've reached the maximum results for this search.");
                return;
            }

            loadMovies(currentQuery, currentPage + 1, true);
        });
    }


    /* =====================================
       16. FIND MOVIE IN CURRENT RESULTS
    ===================================== */

    function findMovie(imdbID) {
        return currentMovies.find(
            movie => movie.imdbID === imdbID
        ) || null;
    }


    /* =====================================
       17. UPDATE MOVIE ACTION BUTTONS
    ===================================== */

    function updateMovieActionButtons(imdbID) {
        const favorite = MovieStorage.isFavorite(imdbID);
        const watchlisted = MovieStorage.isInWatchlist(imdbID);

        document.querySelectorAll(
            `.favorite-action[data-imdb-id="${CSS.escape(imdbID)}"]`
        ).forEach(button => {
            button.classList.toggle("is-active", favorite);
            button.setAttribute("aria-pressed", String(favorite));

            button.setAttribute(
                "aria-label",
                favorite ? "Remove from favorites" : "Add to favorites"
            );

            button.title = favorite
                ? "Remove from favorites"
                : "Add to favorites";

            const icon = button.querySelector("i");

            if (icon) {
                icon.className = `${favorite ? "fa-solid" : "fa-regular"} fa-heart`;
            }
        });

        document.querySelectorAll(
            `.watchlist-action[data-imdb-id="${CSS.escape(imdbID)}"]`
        ).forEach(button => {
            button.classList.toggle("is-active", watchlisted);
            button.setAttribute("aria-pressed", String(watchlisted));

            button.setAttribute(
                "aria-label",
                watchlisted ? "Remove from watchlist" : "Add to watchlist"
            );

            button.title = watchlisted
                ? "Remove from watchlist"
                : "Add to watchlist";
        });

        updateModalActionButtons(imdbID);
    }


    /* =====================================
       18. FAVORITES AND WATCHLIST ACTIONS
    ===================================== */

    featuredMovies.addEventListener("click", function (event) {
        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.action;
        const imdbID = actionButton.dataset.imdbId;

        if (!imdbID) {
            return;
        }

        if (action === "favorite" || action === "watchlist") {
            event.preventDefault();

            const movie = findMovie(imdbID);

            if (!movie) {
                showToast("Movie information is unavailable.");
                return;
            }

            const added = action === "favorite"
                ? MovieStorage.addFavorite(movie)
                : MovieStorage.addWatchlist(movie);

            if (added === null) {
                showToast("Couldn't save this movie. Check browser storage.");
                return;
            }

            if (added) {
                showToast(
                    action === "favorite"
                        ? "Added to your favorites."
                        : "Added to your watchlist."
                );
            } else {
                showToast(
                    action === "favorite"
                        ? "Removed from your favorites."
                        : "Removed from your watchlist."
                );
            }

            updateMovieActionButtons(imdbID);

            return;
        }

        if (action === "details") {
            event.preventDefault();
            openMovieDetails(imdbID);
        }
    });


    /* =====================================
       19. MOVIE DETAILS MODAL
    ===================================== */

    async function openMovieDetails(imdbID) {
        if (!movieModal || !movieModalBody) {
            return;
        }

        movieModalTitle.textContent = "Loading Movie Details";
        movieModalBody.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <h3>Loading movie details</h3>
                <p>Gathering information about this movie.</p>

            </div>
        `;
        movieModal.show();

        try {
            const movie = await getMovieDetails(imdbID);
            movieModalTitle.textContent = movie.Title || "Movie Details";
            movieModalBody.innerHTML = createMovieDetailsHTML(movie);
            updateModalActionButtons(imdbID);
        } catch (error) {
            console.error("Could not load movie details:", error);
            movieModalTitle.textContent = "Movie Details";
            movieModalBody.innerHTML = `
                <div class="error-state">

                    <div class="error-state-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <h3>Unable to load details</h3>

                    <p>
                        ${escapeHTML(error.message || "Please try again.")}
                    </p>

                </div>
            `;
        }
    }


    function createMovieDetailsHTML(movie) {
        const poster = validPoster(movie.Poster)
            ? `
                <img
                    src="${escapeHTML(movie.Poster)}"
                    alt="${escapeHTML(movie.Title)} poster"
                >
            `
            : `
                <div class="poster-placeholder">
                    <i class="fa-solid fa-film"></i>
                </div>
            `;

        const rating = movie.imdbRating && movie.imdbRating !== "N/A"
            ? movie.imdbRating
            : "Not rated";

        return `
            <div class="modal-movie-layout">

                <div class="modal-poster">
                    ${poster}
                </div>

                <div class="modal-movie-info">

                    <h3>${escapeHTML(movie.Title || "Untitled Movie")}</h3>

                    <div class="modal-movie-meta">

                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            ${escapeHTML(movie.Year || "N/A")}
                        </span>

                        <span>
                            <i class="fa-regular fa-clock"></i>
                            ${escapeHTML(movie.Runtime || "N/A")}
                        </span>

                        <span class="modal-rating">
                            <i class="fa-solid fa-star"></i>
                            ${escapeHTML(rating)}
                        </span>

                    </div>

                    <div class="modal-detail-block">
                        <h4>Genre</h4>
                        <p>${escapeHTML(movie.Genre || "Not available")}</p>
                    </div>

                    <div class="modal-detail-block">
                        <h4>Story</h4>
                        <p>${escapeHTML(movie.Plot || "Plot not available.")}</p>
                    </div>

                    <div class="modal-detail-block">
                        <h4>Director</h4>
                        <p>${escapeHTML(movie.Director || "Not available")}</p>
                    </div>

                    <div class="modal-detail-block">
                        <h4>Cast</h4>
                        <p>${escapeHTML(movie.Actors || "Not available")}</p>
                    </div>

                    <div class="modal-detail-block">
                        <h4>Language</h4>
                        <p>${escapeHTML(movie.Language || "Not available")}</p>
                    </div>

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="modal-action-btn"
                            data-modal-action="favorite"
                            data-imdb-id="${escapeHTML(movie.imdbID)}"
                        >
                            <i class="fa-regular fa-heart"></i>
                            Add to Favorites
                        </button>
                        <button
                            type="button"
                            class="modal-action-btn"
                            data-modal-action="watchlist"
                            data-imdb-id="${escapeHTML(movie.imdbID)}"
                        >
                            <i class="fa-solid fa-bookmark"></i>
                            Add to Watchlist
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function updateModalActionButtons(imdbID) {
        if (!movieModalBody) {
            return;
        }
        const favoriteButton = movieModalBody.querySelector(
            '[data-modal-action="favorite"]'
        );
        const watchlistButton = movieModalBody.querySelector(
            '[data-modal-action="watchlist"]'
        );
        if (favoriteButton) {
            const favorite = MovieStorage.isFavorite(imdbID);
            favoriteButton.classList.toggle("is-active", favorite);
            favoriteButton.innerHTML = `
                <i class="${favorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                ${favorite ? "Remove Favorite" : "Add to Favorites"}
            `;
        }
        if (watchlistButton) {
            const watchlisted = MovieStorage.isInWatchlist(imdbID);
            watchlistButton.classList.toggle("is-active", watchlisted);
            watchlistButton.innerHTML = `
                <i class="fa-solid fa-bookmark"></i>
                ${watchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            `;
        }
    }

    if (movieModalBody) {
        movieModalBody.addEventListener("click", function (event) {
            const button = event.target.closest("[data-modal-action]");

            if (!button) {
                return;
            }
            const action = button.dataset.modalAction;
            const imdbID = button.dataset.imdbId;

            const movie = findMovie(imdbID) || {
                imdbID,
                Title: movieModalTitle.textContent,
                Year: "",
                Type: "movie",
                Poster: "N/A"
            };

            const added = action === "favorite"
                ? MovieStorage.addFavorite(movie)
                : MovieStorage.addWatchlist(movie);

            if (added === null) {
                showToast("Couldn't save this movie.");
                return;
            }

            showToast(
                added
                    ? action === "favorite"
                        ? "Added to your favorites."
                        : "Added to your watchlist."
                    : action === "favorite"
                        ? "Removed from your favorites."
                        : "Removed from your watchlist."
            );

            updateMovieActionButtons(imdbID);
        });
    }

    document.addEventListener("movieStorageChanged", function (event) {
        const detail = event.detail;
        if (detail && detail.imdbID) {
            updateMovieActionButtons(detail.imdbID);
        }
    });

    MovieStorage.updateCounts();
    loadMovies("Avengers", 1, false);
});
