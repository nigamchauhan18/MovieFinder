const API_URL = "https://v3-cinemeta.strem.io/catalog/movie/top.json";
const SEARCH_URL = "https://v3-cinemeta.strem.io/catalog/movie/top/search=";

const movieContainer = document.getElementById("movieContainer");
const movieSearch = document.getElementById("movieSearch");
const searchBtn = document.getElementById("searchBtn");
const genreFilter = document.getElementById("genreFilter");
const resetBtn = document.getElementById("resetBtn");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const movieCount = document.getElementById("movieCount");

// LOAD MOVIES
async function loadMovies() {
    showLoading();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Unable to fetch movies");
        }
        const data = await response.json();
        const movies = data.metas || [];
        if (movies.length === 0) {
            throw new Error("No movies found");
        }
        displayMovies(movies);
    }
    catch (error) {
        console.error(error);
        // Show demo movies if API fails
        displayMovies(demoMovies);
    }
}

// SEARCH MOVIES
async function searchMovies() {
    const query = movieSearch.value.trim();
    if (query === "") {
        loadMovies();
        return;
    }
    showLoading();
    try {
        const response = await fetch(SEARCH_URL + encodeURIComponent(query) + ".json");
        if (!response.ok) {
            throw new Error("Search failed");
        }
        const data = await response.json()
        const movies = data.metas || [];
        displayMovies(movies);
    }
    catch (error) {
        console.error(error);
        showError();
    }
}

// DISPLAY MOVIES
function displayMovies(movies) {
    loading.classList.add("d-none");
    errorMessage.classList.add("d-none");
    movieContainer.innerHTML = "";
    if (!movies || movies.length === 0) {
        movieContainer.innerHTML = `
            <div class="col-12">
                <div class="empty-movie text-center">
                    <i class="fa-solid fa-film
                    text-danger fs-1"></i>
                    <h4 class="fw-bold mt-3">
                        No Movies Found
                    </h4>
                    <p class="text-secondary">
                        Try searching for another movie.
                    </p>
                </div>
            </div>
        `;
        movieCount.textContent = "0 Movies";
        return;
    }
    movieCount.textContent = `${movies.length} Movies`;
    movies.forEach(movie => {
        movieContainer.innerHTML += createMovieCard(movie);
    });
    attachButtons();
}

// CREATE MOVIE CARD
function createMovieCard(movie) {
    const title = movie.name || "Unknown Movie";
    const poster = movie.poster || "https://via.placeholder.com/500x750?text=No+Poster";
    const rating =  movie.imdbRating || "N/A";
    const year = movie.year || movie.releaseInfo || "N/A";
    const genres = movie.genres || movie.genre || ["Movie"];
    const genreText = genres.slice(0, 2).join(" • ");
    let description = movie.description || "Discover more information about this movie.";
    if (description.length > 100) {
        description = description.substring(0, 100) + "...";
    }
    return `
        <div class="col-xl-3 col-lg-4 col-md-6">
            <div class="card movieCard h-100 shadow-sm">
                <div class="movie-poster-box">
                    <img src="${poster}" alt="${escapeHTML(title)}" class="movie-poster" loading="lazy">
                    <span class="movie-rating">
                        <i class="fa-solid fa-star"></i>${rating}
                    </span>
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="mb-3">
                        <span class="movie-genre">${escapeHTML(genreText)}</span>
                    </div>
                    <h5 class="movie-title">${escapeHTML(title)}</h5>
                    <p class="text-secondary small mb-2">
                        <i class="fa-regular fa-calendar"></i>${year}
                    </p>
                    <p class="movie-description">${escapeHTML(description)}</p>
                    <div class="mt-auto pt-2">
                        <div class="row g-2">
                            <div class="col-6">
                                <button class="btn btn-outline-danger w-100 favorite-btn" data-id="${movie.id}" data-title="${escapeHTML(title)}" data-poster="${poster}">
                                    <i class="fa-regular fa-heart"></i>Favorite
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-danger w-100 watchlist-btn" data-id="${movie.id}" data-title="${escapeHTML(title)}" data-poster="${poster}">
                                    <i class="fa-solid fa-plus"></i>Watchlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// FAVORITE / WATCHLIST BUTTONS
function attachButtons() {
    // Favorite
    document.querySelectorAll(".favorite-btn").forEach(button => {
        button.addEventListener("click", function () {
            const movie = {
                id: this.dataset.id,
                title: this.dataset.title,
                poster: this.dataset.poster
            };
            addFavorite(movie);
            this.innerHTML = `<i class="fa-solid fa-heart"></i>Added`;
        });
    });
    // Watchlist
    document.querySelectorAll(".watchlist-btn").forEach(button => {
        button.addEventListener("click", function () {
            const movie = {
                id: this.dataset.id,
                title: this.dataset.title,
                poster: this.dataset.poster

            };
            addWatchlist(movie);
            this.innerHTML = `<i class="fa-solid fa-check"></i>Added`;
        });
    });
}

// ADD FAVORITE
function addFavorite(movie) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favorites.some(item => item.id === movie.id);
    if (!exists) {
        favorites.push(movie);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

// ADD WATCHLIST
function addWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const exists = watchlist.some(item => item.id === movie.id);
    if (!exists) {
        watchlist.push(movie);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
}

// GENRE FILTER
genreFilter.addEventListener("change", function () {
    const selectedGenre = this.value;
    if (selectedGenre === "") {
        loadMovies();
        return;
    }
    const cards = document.querySelectorAll(".movie-card");
    cards.forEach(card => {
        const genre = card.querySelector(".movie-genre")
                    .textContent
                    .toLowerCase();
        if (genre.includes(selectedGenre.toLowerCase())) {
            card.closest(".col-xl-3").style.display = "";
        } else {
            card.closest(".col-xl-3").style.display = "none";
        }
    });
});

// SEARCH BUTTON
searchBtn.addEventListener("click", searchMovies);

// ENTER KEY SEARCH
movieSearch.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchMovies();
    }
});

// RESET
resetBtn.addEventListener("click", function () {
    movieSearch.value = "";
    genreFilter.value = "";
    loadMovies();
});

// LOADING
function showLoading() {
    loading.classList.remove("d-none");
    errorMessage.classList.add("d-none");
    movieContainer.innerHTML = "";
    movieCount.textContent = "Loading...";
}

// ERROR
function showError() {
    loading.classList.add("d-none");
    errorMessage.classList.remove("d-none");
    movieContainer.innerHTML = "";
    movieCount.textContent = "0 Movies";
}

// ESCAPE HTML
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
loadMovies();
