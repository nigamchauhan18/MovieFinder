(function () {
    "use strict";

    const API_KEY = "debaf989";
    const API_URL = "https://www.omdbapi.com/";

    const INITIAL_DISPLAY_COUNT = 12;
    const DISPLAY_INCREMENT = 12;

    const POPULAR_MOVIES = [
        "The Dark Knight",
        "Inception",
        "Interstellar",
        "The Shawshank Redemption",
        "The Godfather",
        "Forrest Gump",
        "The Matrix",
        "Fight Club",
        "Pulp Fiction",
        "The Lord of the Rings: The Fellowship of the Ring",
        "Avengers: Endgame",
        "Avengers: Infinity War",
        "Iron Man",
        "Black Panther",
        "Spider-Man: No Way Home",
        "Titanic",
        "Avatar",
        "Jurassic Park",
        "The Lion King",
        "Toy Story",
        "Coco",
        "Frozen",
        "Whiplash",
        "Parasite",
        "Oppenheimer",
        "Dune: Part Two",
        "Top Gun: Maverick",
        "The Grand Budapest Hotel",
        "The Truman Show",
        "The Wolf of Wall Street"
    ];

    const elements = {
        searchForm: document.getElementById("exploreSearchForm"),
        searchInput: document.getElementById("movieSearchInput"),

        movieGrid: document.getElementById("exploreMovieGrid"),
        genreFilter: document.getElementById("movieGenreFilter"),
        sortFilter: document.getElementById("sortFilter"),

        resultsCount: document.getElementById("resultsCount"),
        heading: document.getElementById("exploreHeading"),
        description: document.getElementById("exploreDescription"),

        resetFilters: document.getElementById("resetFilters"),
        loadMoreButton: document.getElementById("loadMoreButton"),

        emptyState: document.getElementById("emptyState"),
        emptyResetButton: document.getElementById("emptyResetButton"),

        activeSearchContainer: document.getElementById("activeSearchContainer"),
        activeSearchText: document.getElementById("activeSearchText"),
        clearSearchButton: document.getElementById("clearSearchButton"),

        modal: document.getElementById("movieModal"),
        modalTitle: document.getElementById("movieModalTitle"),
        modalBody: document.getElementById("movieModalBody"),

        toast: document.getElementById("appToast"),
        toastMessage: document.getElementById("toastMessage")
    };

    let allMovies = [];
    let filteredMovies = [];

    let visibleCount = INITIAL_DISPLAY_COUNT;
    let currentSearch = "";
    let requestNumber = 0;

    let toastInstance = null;
    let modalInstance = null;

    const posterFallback = "https://placehold.co/400x600/171727/a78bfa?text=No+Poster";
    document.addEventListener("DOMContentLoaded", initialize);
    function initialize() {
        if (window.bootstrap && elements.toast) {
            toastInstance = bootstrap.Toast.getOrCreateInstance(
                elements.toast,
                { delay: 2200 }
            );
        }

        if (window.bootstrap && elements.modal) {
            modalInstance = bootstrap.Modal.getOrCreateInstance(
                elements.modal
            );
        }

        attachEvents();
        updateStorageCounts();
        loadPopularMovies();
    }

    function attachEvents() {
        if (elements.searchForm) {
            elements.searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const query = elements.searchInput.value.trim();
                if (query) {
                    searchMovies(query);
                } else {
                    currentSearch = "";
                    applyFilters();
                }
            });
        }

        if (elements.genreFilter) {
            elements.genreFilter.addEventListener("change", function () {
                applyFilters();
            });
        }

        if (elements.sortFilter) {
            elements.sortFilter.addEventListener("change", function () {
                applyFilters();
            });
        }

        if (elements.resetFilters) {
            elements.resetFilters.addEventListener("click", resetExplore);
        }

        if (elements.emptyResetButton) {
            elements.emptyResetButton.addEventListener("click", resetExplore);
        }

        if (elements.clearSearchButton) {
            elements.clearSearchButton.addEventListener("click", function () {
                if (elements.searchInput) {
                    elements.searchInput.value = "";
                }

                currentSearch = "";
                applyFilters();
            });
        }

        if (elements.loadMoreButton) {
            elements.loadMoreButton.addEventListener("click", loadMoreMovies);
        }

        if (elements.movieGrid) {
            elements.movieGrid.addEventListener("click", handleMovieGridClick);
        }

        document.addEventListener("movieStorageChanged", function () {
            updateStorageCounts();
            renderMovies();
        });

        window.addEventListener("storage", function () {
            updateStorageCounts();
            renderMovies();
        });
    }

    async function loadPopularMovies() {
        showLoading();
        allMovies = [];
        const uniqueTitles = new Set();

        const batchSize = 5;

        for (let start = 0; start < POPULAR_MOVIES.length; start += batchSize) {
            const batch = POPULAR_MOVIES.slice(start, start + batchSize);

            const results = await Promise.all(
                batch.map(function (title) {
                    return fetchMovieByTitle(title);
                })
            );

            results.forEach(function (movie) {
                if (movie && movie.Response === "True" && movie.Type === "movie" && movie.imdbID && !uniqueTitles.has(movie.imdbID)) {
                    uniqueTitles.add(movie.imdbID);
                    allMovies.push(normalizeMovie(movie));
                }
            });

            applyFilters();
        }

        if (allMovies.length === 0) {
            showError(
                "No movies could be loaded. Check your API key and internet connection."
            );
            return;
        }

        applyFilters();
    }

    async function fetchMovieByTitle(title) {
        try {
            const url =
                API_URL +
                "?apikey=" + encodeURIComponent(API_KEY) +
                "&t=" + encodeURIComponent(title);

            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            return await response.json();

        } catch (error) {
            console.error("Movie request failed:", title, error);
            return null;
        }
    }

    function normalizeMovie(movie) {
        return {
            imdbID: movie.imdbID || "",
            Title: movie.Title || "Untitled Movie",
            Year: movie.Year || "N/A",
            Type: movie.Type || "movie",
            Poster:
                movie.Poster && movie.Poster !== "N/A"
                    ? movie.Poster
                    : "",
            Genre: movie.Genre || "Genre unavailable",
            imdbRating: movie.imdbRating || "N/A",
            Plot: movie.Plot || "No plot information available.",
            Director: movie.Director || "N/A",
            Actors: movie.Actors || "N/A",
            Runtime: movie.Runtime || "N/A",
            Released: movie.Released || "N/A",
            Language: movie.Language || "N/A",
            Country: movie.Country || "N/A",
            Rated: movie.Rated || "N/A",
            Awards: movie.Awards || "N/A",
            imdbVotes: movie.imdbVotes || "N/A"
        };
    }


    /* =========================================
       SEARCH
    ========================================= */

    async function searchMovies(query) {
        const thisRequest = ++requestNumber;

        currentSearch = query;
        visibleCount = INITIAL_DISPLAY_COUNT;

        updateSearchStatus();
        showLoading();

        try {
            const url =
                API_URL +
                "?apikey=" + encodeURIComponent(API_KEY) +
                "&s=" + encodeURIComponent(query) +
                "&type=movie";

            const response = await fetch(url);
            const data = await response.json();

            if (thisRequest !== requestNumber) {
                return;
            }

            if (data.Response !== "True" || !Array.isArray(data.Search)) {
                allMovies = [];
                applyFilters();

                if (elements.description) {
                    elements.description.textContent =
                        "No movies matched your search. Try another title.";
                }

                return;
            }

            /*
             * OMDb search returns basic information.
             * Fetch the details for each result to obtain Genre and IMDb rating.
             */

            const searchResults = data.Search.slice(0, 30);

            const detailedMovies = await Promise.all(
                searchResults.map(function (movie) {
                    return fetchMovieByTitle(movie.Title);
                })
            );

            if (thisRequest !== requestNumber) {
                return;
            }

            const uniqueMovies = new Map();

            detailedMovies.forEach(function (movie) {
                if (
                    movie &&
                    movie.Response === "True" &&
                    movie.Type === "movie" &&
                    movie.imdbID
                ) {
                    uniqueMovies.set(movie.imdbID, normalizeMovie(movie));
                }
            });

            allMovies = Array.from(uniqueMovies.values());

            applyFilters();

            if (elements.description) {
                elements.description.textContent =
                    "Showing movie search results for \"" + query + "\".";
            }

        } catch (error) {
            console.error("Search failed:", error);

            if (thisRequest === requestNumber) {
                showError("Unable to search movies. Please try again.");
            }
        }
    }


    /* =========================================
       FILTERING AND SORTING
    ========================================= */

    function applyFilters() {
        let result = [...allMovies];

        const selectedGenre = elements.genreFilter
            ? elements.genreFilter.value
            : "all";

        if (selectedGenre !== "all") {
            result = result.filter(function (movie) {
                const genres = movie.Genre
                    .split(",")
                    .map(function (genre) {
                        return genre.trim().toLowerCase();
                    });

                const normalizedSelected = selectedGenre.toLowerCase();

                return genres.some(function (genre) {
                    return genre === normalizedSelected;
                });
            });
        }

        const sortBy = elements.sortFilter
            ? elements.sortFilter.value
            : "popular";

        if (sortBy === "rating") {
            result.sort(function (a, b) {
                return getRating(b) - getRating(a);
            });
        } else if (sortBy === "title") {
            result.sort(function (a, b) {
                return a.Title.localeCompare(b.Title);
            });
        } else if (sortBy === "newest") {
            result.sort(function (a, b) {
                return getYear(b) - getYear(a);
            });
        } else if (sortBy === "oldest") {
            result.sort(function (a, b) {
                return getYear(a) - getYear(b);
            });
        }

        filteredMovies = result;

        visibleCount = Math.min(
            Math.max(visibleCount, INITIAL_DISPLAY_COUNT),
            Math.max(filteredMovies.length, INITIAL_DISPLAY_COUNT)
        );

        renderMovies();
        updateSearchStatus();
    }


    function getRating(movie) {
        const rating = Number.parseFloat(movie.imdbRating);
        return Number.isFinite(rating) ? rating : 0;
    }


    function getYear(movie) {
        const match = String(movie.Year).match(/\d{4}/);
        return match ? Number(match[0]) : 0;
    }


    /* =========================================
       RENDER MOVIES
    ========================================= */

    function renderMovies() {
        if (!elements.movieGrid) {
            return;
        }

        const displayedMovies = filteredMovies.slice(0, visibleCount);

        elements.movieGrid.innerHTML = "";

        if (elements.resultsCount) {
            elements.resultsCount.textContent =
                filteredMovies.length +
                (filteredMovies.length === 1 ? " movie" : " movies");
        }

        if (filteredMovies.length === 0) {
            elements.movieGrid.hidden = true;

            if (elements.emptyState) {
                elements.emptyState.hidden = false;
            }

            if (elements.loadMoreButton) {
                elements.loadMoreButton.hidden = true;
            }

            return;
        }

        elements.movieGrid.hidden = false;

        if (elements.emptyState) {
            elements.emptyState.hidden = true;
        }

        displayedMovies.forEach(function (movie) {
            elements.movieGrid.insertAdjacentHTML(
                "beforeend",
                createMovieCard(movie)
            );
        });

        if (elements.loadMoreButton) {
            const hasMore = visibleCount < filteredMovies.length;

            elements.loadMoreButton.hidden = !hasMore;

            if (hasMore) {
                elements.loadMoreButton.disabled = false;
                elements.loadMoreButton.innerHTML =
                    'Load More Movies <i class="fa-solid fa-arrow-down"></i>';
            }
        }
    }


    function createMovieCard(movie) {
        const id = escapeHTML(movie.imdbID);
        const title = escapeHTML(movie.Title);
        const year = escapeHTML(movie.Year);
        const rating = escapeHTML(movie.imdbRating);

        const genres = movie.Genre
            .split(",")
            .map(function (genre) {
                return genre.trim();
            })
            .filter(function (genre) {
                return genre && genre !== "Genre unavailable";
            })
            .slice(0, 2);

        const genreHTML = genres.length
            ? genres.map(function (genre) {
                return (
                    '<span class="explore-genre-tag">' +
                    escapeHTML(genre) +
                    "</span>"
                );
            }).join("")
            : '<span class="explore-genre-tag">Movie</span>';

        const posterHTML = movie.Poster
            ? '<img class="explore-poster" src="' +
                escapeHTML(movie.Poster) +
                '" alt="' + title + '" loading="lazy" onerror="this.onerror=null;this.src=\'' +
                posterFallback +
                '\'">'
            : '<div class="explore-poster-placeholder">' +
                '<i class="fa-solid fa-film"></i>' +
                '<span>' + title + '</span>' +
              '</div>';

        const favoriteActive = isInCollection("favorites", movie);
        const watchlistActive = isInCollection("watchlist", movie);

        return `
            <div class="col-6 col-md-4 col-lg-3 explore-movie-column">
                <article class="explore-movie-card">

                    <div class="explore-poster-wrap">

                        ${posterHTML}

                        <div class="explore-rating">
                            <i class="fa-solid fa-star"></i>
                            ${rating === "N/A" ? "N/A" : rating}
                        </div>

                        <div class="explore-card-actions">

                            <button
                                type="button"
                                class="explore-icon-btn favorite-action ${favoriteActive ? "is-active" : ""}"
                                data-action="favorite"
                                data-id="${id}"
                                aria-label="Toggle favorite for ${title}"
                                title="Add to favorites"
                            >
                                <i class="${favoriteActive ? "fa-solid" : "fa-regular"} fa-heart"></i>
                            </button>

                            <button
                                type="button"
                                class="explore-icon-btn watchlist-action ${watchlistActive ? "is-active" : ""}"
                                data-action="watchlist"
                                data-id="${id}"
                                aria-label="Toggle watchlist for ${title}"
                                title="Add to watchlist"
                            >
                                <i class="fa-solid fa-bookmark"></i>
                            </button>

                        </div>

                        <div class="explore-poster-overlay">

                            <button
                                type="button"
                                class="explore-details-btn"
                                data-action="details"
                                data-id="${id}"
                            >
                                <i class="fa-solid fa-circle-info me-2"></i>
                                View Details
                            </button>

                        </div>

                    </div>

                    <div class="explore-card-content">

                        <span class="explore-movie-year">
                            ${year}
                        </span>

                        <h3 class="explore-movie-title">
                            ${title}
                        </h3>

                        <div class="explore-movie-genres">
                            ${genreHTML}
                        </div>

                        <div class="explore-card-footer">
                            <span>
                                <i class="fa-solid fa-film"></i>
                                Movie
                            </span>

                            <span>
                                <i class="fa-solid fa-star"></i>
                                ${rating}
                            </span>
                        </div>

                    </div>

                </article>
            </div>
        `;
    }

    function handleMovieGridClick(event) {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const movieId = button.dataset.id;

        const movie = allMovies.find(function (item) {
            return item.imdbID === movieId;
        });

        if (!movie) {
            return;
        }

        if (action === "favorite") {
            toggleCollection("favorites", movie);
        } else if (action === "watchlist") {
            toggleCollection("watchlist", movie);
        } else if (action === "details") {
            showMovieDetails(movie);
        }
    }

    function getStorage() {
        return window.MovieStorage || null;
    }


    function getCollection(collection) {
        const storage = getStorage();

        if (!storage) {
            return [];
        }

        try {
            if (collection === "favorites" && typeof storage.getFavorites === "function") {
                return storage.getFavorites();
            }

            if (collection === "watchlist" && typeof storage.getWatchlist === "function") {
                return storage.getWatchlist();
            }
        } catch (error) {
            console.error("Could not read movie collection:", error);
        }

        return [];
    }


    function isInCollection(collection, movie) {
        const items = getCollection(collection);

        return items.some(function (item) {
            return item.imdbID === movie.imdbID;
        });
    }


    function toggleCollection(collection, movie) {
        const storage = getStorage();

        if (!storage) {
            showToast("Movie storage is unavailable. Check movieStorage.js.");
            return;
        }

        const isFavorite = collection === "favorites";
        const addMethod = isFavorite ? "addFavorite" : "addWatchlist";
        const removeMethod = isFavorite ? "removeFavorite" : "removeWatchlist";

        const alreadyAdded = isInCollection(collection, movie);

        try {
            if (alreadyAdded) {
                if (typeof storage[removeMethod] === "function") {
                    storage[removeMethod](movie.imdbID);
                    showToast(
                        isFavorite
                            ? "Removed from favorites."
                            : "Removed from watchlist."
                    );
                } else {
                    showToast("Check the remove function in movieStorage.js.");
                    return;
                }
            } else {
                if (typeof storage[addMethod] === "function") {
                    storage[addMethod](movie);
                    showToast(
                        isFavorite
                            ? "Added to favorites!"
                            : "Added to watchlist!"
                    );
                } else {
                    showToast("Check the add function in movieStorage.js.");
                    return;
                }
            }

            updateStorageCounts();
            renderMovies();

        } catch (error) {
            console.error("Could not update movie collection:", error);
            showToast("Unable to update your collection.");
        }
    }


    function updateStorageCounts() {
        const favorites = getCollection("favorites");
        const watchlist = getCollection("watchlist");

        const favoriteCount = document.getElementById("favoriteCount");
        const watchlistCount = document.getElementById("watchlistCount");

        if (favoriteCount) {
            favoriteCount.textContent = favorites.length;
        }

        if (watchlistCount) {
            watchlistCount.textContent = watchlist.length;
        }
    }

    function showMovieDetails(movie) {
        if (!elements.modalBody) {
            return;
        }

        const poster = movie.Poster
            ? '<img src="' + escapeHTML(movie.Poster) +
              '" class="explore-modal-poster" alt="' +
              escapeHTML(movie.Title) + '">'
            : '<div class="explore-poster-placeholder">' +
              '<i class="fa-solid fa-film"></i>' +
              '<span>No poster available</span>' +
              '</div>';

        const genres = escapeHTML(movie.Genre);

        elements.modalTitle.textContent = movie.Title;

        elements.modalBody.innerHTML = `
            <div class="row g-4">

                <div class="col-md-5">
                    ${poster}
                </div>

                <div class="col-md-7">

                    <h2 class="explore-modal-title">
                        ${escapeHTML(movie.Title)}
                    </h2>

                    <div class="explore-modal-meta">
                        <span>
                            <i class="fa-solid fa-calendar me-1"></i>
                            ${escapeHTML(movie.Year)}
                        </span>

                        <span>
                            <i class="fa-solid fa-star me-1"></i>
                            ${escapeHTML(movie.imdbRating)}
                        </span>

                        <span>
                            <i class="fa-solid fa-clock me-1"></i>
                            ${escapeHTML(movie.Runtime)}
                        </span>
                    </div>

                    <div class="explore-modal-info">

                        <p>
                            <strong>Genre:</strong>
                            ${genres}
                        </p>

                        <p>
                            <strong>Director:</strong>
                            ${escapeHTML(movie.Director)}
                        </p>

                        <p>
                            <strong>Cast:</strong>
                            ${escapeHTML(movie.Actors)}
                        </p>

                        <p>
                            <strong>Language:</strong>
                            ${escapeHTML(movie.Language)}
                        </p>

                        <p>
                            <strong>Released:</strong>
                            ${escapeHTML(movie.Released)}
                        </p>

                    </div>

                    <p class="explore-modal-plot">
                        ${escapeHTML(movie.Plot)}
                    </p>

                    <div class="explore-modal-actions">

                        <button type="button" data-modal-action="favorite">
                            <i class="fa-regular fa-heart me-2"></i>
                            Add to Favorites
                        </button>

                        <button type="button" data-modal-action="watchlist">
                            <i class="fa-solid fa-bookmark me-2"></i>
                            Add to Watchlist
                        </button>

                    </div>

                </div>

            </div>
        `;

        elements.modalBody.querySelectorAll("[data-modal-action]").forEach(function (button) {
            button.addEventListener("click", function () {
                toggleCollection(button.dataset.modalAction, movie);
            });
        });

        if (modalInstance) {
            modalInstance.show();
        }
    }

    function loadMoreMovies() {
        if (visibleCount >= filteredMovies.length) {
            return;
        }

        visibleCount += DISPLAY_INCREMENT;
        renderMovies();
    }

    function updateSearchStatus() {
        if (!elements.activeSearchContainer) {
            return;
        }

        const hasSearch = Boolean(currentSearch);

        elements.activeSearchContainer.hidden = !hasSearch;

        if (hasSearch && elements.activeSearchText) {
            elements.activeSearchText.textContent = currentSearch;
        }
    }

    function resetExplore() {
        requestNumber++;

        currentSearch = "";
        visibleCount = INITIAL_DISPLAY_COUNT;

        if (elements.searchInput) {
            elements.searchInput.value = "";
        }

        if (elements.genreFilter) {
            elements.genreFilter.value = "all";
        }

        if (elements.sortFilter) {
            elements.sortFilter.value = "popular";
        }

        if (elements.heading) {
            elements.heading.innerHTML = 'Explore <span>Movies.</span>';
        }

        if (elements.description) {
            elements.description.textContent =
                "Discover popular movies selected for every kind of movie lover.";
        }

        updateSearchStatus();
        applyFilters();

        const section = document.getElementById("exploreMovies");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    function showLoading() {
        if (!elements.movieGrid) {
            return;
        }

        elements.movieGrid.hidden = false;

        if (elements.emptyState) {
            elements.emptyState.hidden = true;
        }

        elements.movieGrid.innerHTML = `
            <div class="col-12">
                <div class="explore-loading">
                    <div class="explore-spinner"></div>
                    <h3>Discovering amazing movies</h3>
                    <p>Finding movie posters, ratings, and details...</p>
                </div>
            </div>
        `;

        if (elements.loadMoreButton) {
            elements.loadMoreButton.hidden = true;
        }
    }


    function showError(message) {
        if (elements.movieGrid) {
            elements.movieGrid.innerHTML = `
                <div class="col-12">
                    <div class="explore-empty-state">
                        <div class="empty-state-icon">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>

                        <h3>Unable to load movies</h3>

                        <p>${escapeHTML(message)}</p>

                        <button type="button" id="retryMoviesButton">
                            Try Again
                        </button>
                    </div>
                </div>
            `;

            const retryButton = document.getElementById("retryMoviesButton");

            if (retryButton) {
                retryButton.addEventListener("click", loadPopularMovies);
            }
        }

        if (elements.resultsCount) {
            elements.resultsCount.textContent = "Unable to load";
        }
    }

    function showToast(message) {
        if (!elements.toast || !elements.toastMessage) {
            return;
        }

        elements.toastMessage.textContent = message;

        if (toastInstance) {
            toastInstance.show();
        } else {
            elements.toast.classList.add("show");
            elements.toast.style.display = "block";

            setTimeout(function () {
                elements.toast.classList.remove("show");
                elements.toast.style.display = "";
            }, 2200);
        }
    }


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
})();
