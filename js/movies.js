let API_URL = "https://v3-cinemeta.strem.io/catalog/movie/top.json";
let SEARCH_URL = "https://v3-cinemeta.strem.io/catalog/movie/top/search=";

let movieSearch = document.getElementById("movieSearch");
let searchBtn = document.getElementById("searchBtn");
let genreFilter = document.getElementById("genreFilter");
let resetBtn = document.getElementById("resetBtn");
let movieCount = document.getElementById("movieCount");
let errorMessage = document.getElementById("errorMessage");
let loading = document.getElementById("loading");
let movieContainer = document.getElementById("movieContainer");

let allMovies = [];

function loadMovies(url = API_URL) {
    loading.style.display = 'block';
    movieContainer.innerHTML = '';

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            let movies = data.metas;
            allMovies = movies;

            let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
            let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

            movieCount.textContent = `${movies.length} Movies`;
            
            movies.forEach((movie) => {
                let isFavorite = favorites.some((item) =>
                    item.id === movie.id
                );
                let isWatchlist = watchlist.some((item) =>
                    item.id === movie.id
                );

                let card = `
                    <div class="col-md-3">
                        <div class="card movieCard h-100 shadow-sm">
                            <div class="movie-poster-box">
                                <img src="${movie.poster}" alt="${movie.name}" class="movie-poster" loading="lazy">
                                <span class="movie-rating"><i class="fa-solid fa-star"></i> ${movie.imdbRating ? movie.imdbRating : 'N/A'}</span>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <div class="mb-3">
                                    <span class="movie-genre">${movie.genres ? movie.genres.join(', ') : 'Movie'}</span>
                                </div>
                                <h5 class="movie-title">${movie.name}</h5>
                                <p class="text-secondary small mb-2"><i class="fa-regular fa-calendar"></i> ${movie.year || movie.releaseInfo || "N/A"}</p>
                                <p class="movie-description">${movie.description 
                                        ? movie.description.substring(0, 100) + "..." 
                                        : "No description available."
                                    }</p>
                                <div class="mt-auto pt-2">
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <button class="btn ${isFavorite ? "btn-danger" : "btn-outline-danger"} w-100 favorite-btn" id="favorite-${movie.id}" onclick="addToFavorite('${movie.id}')">
                                                <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i> Favorite
                                            </button>
                                        </div>
                                        <div class="col-6">
                                            <button class="btn ${isWatchlist ? "btn-secondary" : "btn-danger" } w-100 watchlist-btn" id="watchlist-${movie.id}" onclick="addToWatchlist('${movie.id}')">
                                                <i class="${isWatchlist ? "fa-solid fa-check" : "fa-solid fa-plus" }"></i>  ${isWatchlist ? "Added" : "Watchlist"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        </div>
                    </div>
                `;
                movieContainer.innerHTML += card;
            });
            loading.style.display = "none";
        })
        .catch((error) => {
            console.log("Error: ", error);
            loading.style.display = "none";
            errorMessage.textContent = "Failed to load movies.";
            errorMessage.style.display = "block";
        });
}
loadMovies();

function addToFavorite(movieId) {
    let movie = allMovies.find((movie) => movie.id === movieId);
    if (!movie) {
        return;
    }
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let existingIndex = favorites.findIndex((item) =>
        item.id === movieId
    );
    let button = document.getElementById(`favorite-${movieId}`);
    if (!button) {
        return;
    }
    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        button.classList.remove("btn-danger");
        button.classList.add("btn-outline-danger");
        button.innerHTML = `<i class="fa-regular fa-heart"></i> Favorite`;
        return;
    }
    favorites.push(movie);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    button.classList.remove("btn-outline-danger");
    button.classList.add("btn-danger");
    button.innerHTML = `<i class="fa-solid fa-heart"></i> Favorite`;
}

function addToWatchlist(movieId) {
    let movie = allMovies.find((movie) => movie.id === movieId);
    if (!movie) {
        return;
    }
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    let existingIndex = watchlist.findIndex((item) => item.id === movieId);
    let button = document.getElementById(`watchlist-${movieId}`);
    if (!button) {
        return;
    }
    if (existingIndex !== -1) {
        watchlist.splice(existingIndex, 1);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        button.classList.remove("btn-secondary");
        button.classList.add("btn-danger");
        button.innerHTML = `<i class="fa-solid fa-plus"></i> Watchlist`;
        return;

    }
    watchlist.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    button.classList.remove("btn-danger");
    button.classList.add("btn-secondary");
    button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
}

function searchMovies() {
    let searchValue = movieSearch.value;
    if (searchValue === "") {
        loadMovies();
        return;
    }
    let searchURL = SEARCH_URL + encodeURIComponent(searchValue) + '.json';
    console.log("Search URL:", searchURL);
    loadMovies(searchURL);
}

searchBtn.addEventListener("click", function () {
    searchMovies();
});
resetBtn.addEventListener("click", function () {
    movieSearch.value = "";
    loadMovies();
});
