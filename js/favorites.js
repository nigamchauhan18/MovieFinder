let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

let favoriteContainer = document.getElementById("favoriteContainer");
let favoriteCount = document.getElementById("favoriteCount");
let emptyFavorites = document.getElementById("emptyFavorites");

favoriteCount.textContent = `${favorites.length} Movies`;

if (favorites.length === 0) {
    emptyFavorites.style.display = "block";
} else {
    emptyFavorites.style.display = "none";
}

favorites.forEach((movie) => {
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
                        <button class="btn btn-outline-danger w-100" onclick="removeFavorite('${movie.id}')">
                            <i class="fa-solid fa-heart-crack"></i> Remove Favorite
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    favoriteContainer.innerHTML += card;
});

function removeFavorite(movieId) {
    favorites = favorites.filter((movie) =>
        movie.id !== movieId
    );
    console.log(favorites);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    location.reload();
}
