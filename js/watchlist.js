let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

let watchlistContainer = document.getElementById("watchlistContainer");
let watchlistCount = document.getElementById("watchlistCount");
let emptyWatchlist = document.getElementById("emptyWatchlist");

watchlistCount.textContent = `${watchlist.length} Movies`;

if (watchlist.length === 0) {
    emptyWatchlist.style.display = "block";
} else {
    emptyWatchlist.style.display = "none";
}

watchlist.forEach((movie) => {
    let card = `
        <div class="col-md-3">
            <div class="card movieCard h-100 shadow-sm">
                <div class="movie-poster-box">
                    <img src="${movie.poster}" alt="${movie.name}" class="movie-poster" loading="lazy">
                    <span class="movie-rating">
                        <i class="fa-solid fa-star"></i>
                        ${movie.imdbRating ? movie.imdbRating : "N/A" }
                    </span>
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="mb-3">
                        <span class="movie-genre">
                            ${movie.genres ? movie.genres.join(", ") : "Movie"}
                        </span>
                    </div>
                    <h5 class="movie-title">${movie.name}</h5>
                    <p class="text-secondary small mb-2">
                        <i class="fa-regular fa-calendar"></i> ${movie.year || movie.releaseInfo || "N/A"}
                    </p>
                    <p class="movie-description">
                        ${movie.description ? movie.description.substring(0, 100) + "..." : "No description available."}
                    </p>
                    <div class="mt-auto pt-2">
                        <button class="btn btn-outline-danger w-100" onclick="removeFromWatchlist('${movie.id}')">
                            <i class="fa-solid fa-trash"></i> Remove from Watchlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    watchlistContainer.innerHTML += card;
});

function removeFromWatchlist(movieId) {
    watchlist = watchlist.filter((movie) => movie.id !== movieId);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    location.reload();
}
