import {
    getMovies,
    addMovie,
    updateMovie,
    deleteMovie
} from "./service/movieService.js";

import { validateMovie } from "../exception/validationException.js";


/* ---------- Helper ---------- */

const $ = (id) => document.getElementById(id);


/* ---------- Elements ---------- */

const movieList = $("movieList");

const searchInput = $("searchInput");
const genreFilter = $("genreFilter");
const ratingSort = $("ratingSort");

const showFormBtn = $("showFormBtn");
const movieForm = $("movieForm");
const cancelEditBtn = $("cancelEditBtn");

const formTitle = $("formTitle");
const submitMovieBtn = $("submitMovieBtn");

const movieModal = $("movieModal");
const movieDetails = $("movieDetails");
const closeModalBtn = $("closeModalBtn");

const statusMessage = $("statusMessage");


/* ---------- Form inputs ---------- */

const titleInput = $("title");
const genreInput = $("genre");
const languageInput = $("language");
const releaseYearInput = $("releaseYear");
const ratingInput = $("rating");
const durationInput = $("duration");
const posterInput = $("poster");
const descriptionInput = $("description");


/* ---------- App data ---------- */

let movies = [];
let editingId = null;


/* ---------- Show message ---------- */

function showMessage(message) {
    statusMessage.textContent = message;
}


/* ---------- Load movies ---------- */

async function loadMovies() {

    try {

        movies = await getMovies();

        applyFilters();

    } catch (error) {

        showMessage(error.message);

    }
}


/* ---------- Display movies ---------- */

function displayMovies(list) {

    movieList.innerHTML = "";

    if (list.length === 0) {

        movieList.innerHTML = `
            <p class="empty-message">
                No movies found.
            </p>
        `;

        return;
    }


    list.forEach((movie) => {

        movieList.innerHTML += `
            <div class="movie-card">

                <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                    class="movie-poster"
                >

                <div class="movie-info">

                    <h3>${movie.title}</h3>

                    <p class="movie-genre">
                        ${movie.genre} • ${movie.language}
                    </p>

                    <div class="movie-meta">

                        <span>
                            ⭐ ${movie.rating}
                        </span>

                        <span>
                            ${movie.releaseYear}
                        </span>

                    </div>

                    <div class="movie-actions">

                        <button
                            type="button"
                            class="view-btn"
                            data-id="${movie.id}">
                            View
                        </button>

                        <button
                            type="button"
                            class="edit-btn"
                            data-id="${movie.id}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-btn"
                            data-id="${movie.id}">
                            Delete
                        </button>

                        <button
                            type="button"
                            class="favorite-btn ${movie.favorite ? "active" : ""}"
                            data-id="${movie.id}">
                            ${movie.favorite ? "♥" : "♡"}
                        </button>

                    </div>

                </div>

            </div>
        `;
    });
}


/* ---------- Search / Filter / Sort ---------- */

function applyFilters() {

    let result = [...movies];

    const search = searchInput.value
        .toLowerCase()
        .trim();


    /* Search */

    if (search) {

        result = result.filter((movie) =>
            movie.title.toLowerCase().includes(search)
        );

    }


    /* Genre */

    if (genreFilter.value) {

        result = result.filter((movie) =>
            movie.genre === genreFilter.value
        );

    }


    /* Rating */

    if (ratingSort.value === "high") {

        result.sort((a, b) => b.rating - a.rating);

    }

    if (ratingSort.value === "low") {

        result.sort((a, b) => a.rating - b.rating);

    }


    displayMovies(result);
}


/* ---------- Get form data ---------- */

function getFormData() {

    return {
        title: titleInput.value.trim(),
        genre: genreInput.value,
        language: languageInput.value.trim(),
        releaseYear: Number(releaseYearInput.value),
        rating: Number(ratingInput.value),
        duration: durationInput.value.trim(),
        poster: posterInput.value.trim(),
        description: descriptionInput.value.trim()
    };
}


/* ---------- Clear form ---------- */

function clearForm() {

    movieForm.reset();

    editingId = null;

    formTitle.textContent = "Add New Movie";
    submitMovieBtn.textContent = "Add Movie";
}


/* ---------- Show form ---------- */

showFormBtn.addEventListener("click", () => {

    movieForm.style.display = "block";

});


/* ---------- Cancel form ---------- */

cancelEditBtn.addEventListener("click", () => {

    movieForm.style.display = "none";

    clearForm();

    showMessage("");

});


/* ---------- Add / Update movie ---------- */

movieForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const movieData = getFormData();

    const validationError = validateMovie(movieData);


    if (validationError) {

        showMessage(validationError);

        return;
    }


    try {

        /* Edit */

        if (editingId !== null) {

            const oldMovie = movies.find(
                (movie) => movie.id === editingId
            );

            await updateMovie(editingId, {
                ...movieData,
                id: editingId,
                favorite: oldMovie.favorite
            });

            showMessage("Movie updated successfully.");

        }


        /* Add */

        else {

            await addMovie({
                ...movieData,
                favorite: false
            });

            showMessage("Movie added successfully.");

        }


        movieForm.style.display = "none";

        clearForm();

        await loadMovies();

    } catch (error) {

        showMessage(error.message);

    }

});


/* ---------- Movie buttons ---------- */

movieList.addEventListener("click", async (event) => {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }


    const id = Number(button.dataset.id);

    const movie = movies.find(
        (movie) => movie.id === id
    );

    if (!movie) {
        return;
    }


    /* View */

    if (button.classList.contains("view-btn")) {

        movieDetails.innerHTML = `

            <div class="movie-details">

                <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                >

                <div class="movie-details-info">

                    <h2>${movie.title}</h2>

                    <p>Genre: ${movie.genre}</p>
                    <p>Language: ${movie.language}</p>
                    <p>Year: ${movie.releaseYear}</p>
                    <p>Rating: ⭐ ${movie.rating}</p>
                    <p>Duration: ${movie.duration}</p>

                    <p>${movie.description}</p>

                </div>

            </div>
        `;

        movieModal.style.display = "flex";

        return;
    }


    /* Edit */

    if (button.classList.contains("edit-btn")) {

        editingId = id;

        titleInput.value = movie.title;
        genreInput.value = movie.genre;
        languageInput.value = movie.language;
        releaseYearInput.value = movie.releaseYear;
        ratingInput.value = movie.rating;
        durationInput.value = movie.duration;
        posterInput.value = movie.poster;
        descriptionInput.value = movie.description;

        formTitle.textContent = "Edit Movie";
        submitMovieBtn.textContent = "Update Movie";

        movieForm.style.display = "block";

        movieForm.scrollIntoView({
            behavior: "smooth"
        });

        return;
    }


    /* Delete */

    if (button.classList.contains("delete-btn")) {

        const confirmed = confirm(
            `Delete "${movie.title}"?`
        );

        if (!confirmed) {
            return;
        }


        try {

            await deleteMovie(id);

            showMessage("Movie deleted successfully.");

            await loadMovies();

        } catch (error) {

            showMessage(error.message);

        }

        return;
    }


    /* Favourite */

    if (button.classList.contains("favorite-btn")) {

        try {

            await updateMovie(id, {
                ...movie,
                favorite: !movie.favorite
            });

            await loadMovies();

        } catch (error) {

            showMessage(error.message);

        }

    }

});


/* ---------- Close modal ---------- */

closeModalBtn.addEventListener("click", () => {

    movieModal.style.display = "none";

});


movieModal.addEventListener("click", (event) => {

    if (event.target === movieModal) {

        movieModal.style.display = "none";

    }

});


/* ---------- Search ---------- */

searchInput.addEventListener(
    "input",
    applyFilters
);


/* ---------- Genre filter ---------- */

genreFilter.addEventListener(
    "change",
    applyFilters
);


/* ---------- Rating sort ---------- */

ratingSort.addEventListener(
    "change",
    applyFilters
);


/* ---------- Start ---------- */

loadMovies();