(function () {
    "use strict";

    const FAVORITES_KEY = "movieFinderFavorites";
    const WATCHLIST_KEY = "movieFinderWatchlist";

    function readStorage(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");

            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("Could not read movie storage:", error);
            return [];
        }
    }

    function writeStorage(key, movies) {
        try {
            localStorage.setItem(key, JSON.stringify(movies));
            return true;
        } catch (error) {
            console.error("Could not save movies:", error);
            return false;
        }
    }

    function normalizeMovie(movie) {
        return {
            imdbID: movie.imdbID,
            Title: movie.Title || "Untitled Movie",
            Year: movie.Year || "N/A",
            Type: movie.Type || "movie",
            Poster: movie.Poster || "N/A"
        };
    }

    function getMovies(key) {
        return readStorage(key);
    }

    function containsMovie(key, imdbID) {
        return readStorage(key).some(
            movie => movie.imdbID === imdbID
        );
    }

    function toggleMovie(key, movie) {
        if (!movie || !movie.imdbID) {
            return false;
        }

        const movies = readStorage(key);

        const existingIndex = movies.findIndex(
            item => item.imdbID === movie.imdbID
        );

        let added;

        if (existingIndex !== -1) {
            movies.splice(existingIndex, 1);
            added = false;
        } else {
            movies.unshift(normalizeMovie(movie));
            added = true;
        }

        const saved = writeStorage(key, movies);

        if (!saved) {
            return null;
        }

        updateCounts();

        document.dispatchEvent(
            new CustomEvent("movieStorageChanged", {
                detail: {
                    type: key === FAVORITES_KEY
                        ? "favorites"
                        : "watchlist",
                    imdbID: movie.imdbID,
                    added
                }
            })
        );

        return added;
    }

    function removeMovie(key, imdbID) {
        const movies = readStorage(key);

        const updatedMovies = movies.filter(
            movie => movie.imdbID !== imdbID
        );

        if (updatedMovies.length === movies.length) {
            return false;
        }

        const saved = writeStorage(key, updatedMovies);

        if (!saved) {
            return false;
        }

        updateCounts();

        document.dispatchEvent(
            new CustomEvent("movieStorageChanged", {
                detail: {
                    type: key === FAVORITES_KEY
                        ? "favorites"
                        : "watchlist",
                    imdbID,
                    added: false
                }
            })
        );
        return true;
    }

    function updateCounts() {
        const favoriteCount = document.getElementById("favoriteCount");
        const watchlistCount = document.getElementById("watchlistCount");

        if (favoriteCount) {
            favoriteCount.textContent = getMovies(FAVORITES_KEY).length;
        }

        if (watchlistCount) {
            watchlistCount.textContent = getMovies(WATCHLIST_KEY).length;
        }
    }

    function addFavorite(movie) {
        return toggleMovie(FAVORITES_KEY, movie);
    }

    function addWatchlist(movie) {
        return toggleMovie(WATCHLIST_KEY, movie);
    }

    function removeFavorite(imdbID) {
        return removeMovie(FAVORITES_KEY, imdbID);
    }

    function removeWatchlist(imdbID) {
        return removeMovie(WATCHLIST_KEY, imdbID);
    }

    function isFavorite(imdbID) {
        return containsMovie(FAVORITES_KEY, imdbID);
    }

    function isInWatchlist(imdbID) {
        return containsMovie(WATCHLIST_KEY, imdbID);
    }
    
    window.MovieStorage = {
        getFavorites: () => getMovies(FAVORITES_KEY),
        getWatchlist: () => getMovies(WATCHLIST_KEY),
        addFavorite,
        addWatchlist,
        removeFavorite,
        removeWatchlist,
        isFavorite,
        isInWatchlist,
        updateCounts
    };
    document.addEventListener("DOMContentLoaded", updateCounts);
})();
