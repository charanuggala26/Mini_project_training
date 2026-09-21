import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie
} from "./service/movieService.js";
import {
  validateMovie,
  handleValidationError
} from "../exception/validationException.js";

const genres = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"];
const fields = [
  "title", "genre", "language", "releaseYear",
  "rating", "duration", "description", "poster"
];
const $ = (id) => document.getElementById(id);

let movies = [];
let editId = null;

function safe(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[character]));
}

function showError(error) {
  console.error(error);
  $("grid").innerHTML =
    "<p class='status error'>Could not connect to the movie server.</p>";
}

function setGenres() {
  const options = genres.map((genre) =>
    `<option value="${genre}">${genre}</option>`
  ).join("");

  $("genre").innerHTML =
    `<option value="">Choose a genre</option>${options}`;
  $("genreFilter").innerHTML =
    `<option value="">All genres</option>${options}`;
}

function filteredMovies() {
  const search = $("search").value.toLowerCase();
  const genre = $("genreFilter").value;
  const sort = $("sortBy").value;

  const list = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search) &&
    (!genre || movie.genre === genre) &&
    (sort !== "favorites" || movie.favorite)
  );

  return list.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "oldest") return a.releaseYear - b.releaseYear;
    if (sort === "favorites") return movies.filter(movie => movie.favorite)
    return b.releaseYear - a.releaseYear;
    
   });
}

function render() {
  $("grid").innerHTML = filteredMovies().map((movie) => `
    <article class="card" data-id="${movie.id}">
      <img src="${safe(movie.poster)}" alt="${safe(movie.title)}"
        onerror="this.src='https://placehold.co/500x750/eaf2fb/315f9b?text=No+poster'">
      <div class="card-content">
        <h3>${safe(movie.title)}</h3>
        <p class="muted">${safe(movie.genre)} ·
          ${safe(movie.language)} · ${movie.releaseYear}</p>
        <p class="rating">★ ${movie.rating}
          <span>· ${safe(movie.duration)}</span></p>
        <small>${safe(movie.description)}</small>
      </div>
      <button data-action="fav">${movie.favorite ? "❤️" : "🤍"}</button>
      <button data-action="edit">Edit</button>
      <button class="danger" data-action="delete">Delete</button>
    </article>
  `).join("") || "<p class='status'>No movies found.</p>";
}

async function loadMovies() {
  try {
    movies = await getMovies();
    render();
  } catch (error) {
    showError(error);
  }
}

function openForm(movie) {
  editId = movie ? movie.id : null;
  $("formTitle").textContent = movie ? "Edit Movie" : "Add Movie";

  fields.forEach((field) => {
    $(field).value = movie ? movie[field] : "";
  });
  $("dialog").showModal();
}

function openDetails(movie) {
  $("detailsTitle").textContent = movie.title;
  $("detailsContent").innerHTML = `
    <img src="${safe(movie.poster)}" alt="${safe(movie.title)}">
    <div>
      <p>${safe(movie.genre)} · ${safe(movie.language)}</p>
      <p>${movie.releaseYear} · ★ ${movie.rating} ·
        ${safe(movie.duration)}</p>
      <p>${safe(movie.description)}</p>
    </div>
  `;
  $("detailsDialog").showModal();
}

async function cardAction(event) {
  const card = event.target.closest(".card");
  if (!card) return;

  const movie = movies.find((item) => item.id == card.dataset.id);
  const button = event.target.closest("button");

  if (!button) return openDetails(movie);

  try {
    const action = button.dataset.action;
    if (action === "edit") return openForm(movie);
    if (action === "fav") {
      await updateMovie(movie.id, { ...movie, favorite: !movie.favorite });
    }
    if (action === "delete" && confirm(`Delete "${movie.title}"?`)) {
      await deleteMovie(movie.id);
    }
    await loadMovies();
  } catch (error) {
    showError(error);
  }
}

async function saveMovie(event) {
  event.preventDefault();

  const movie = {};
  fields.forEach((field) => {
    movie[field] = $(field).value.trim();
  });
  movie.releaseYear = Number(movie.releaseYear);
  movie.rating = Number(movie.rating);

  try {
    validateMovie(movie);
    if (!movie.poster) {
      movie.poster =
        `https://placehold.co/500x750/eaf2fb/315f9b?text=${movie.title}`;
    }

    if (editId) {
      const oldMovie = movies.find((item) => item.id == editId);
      await updateMovie(editId, { ...oldMovie, ...movie });
    } else {
      await addMovie({ ...movie, favorite: false });
    }

    $("dialog").close();
    await loadMovies();
  } catch (error) {
    error.name === "ValidationError"
      ? handleValidationError(error)
      : showError(error);
  }
}

$("search").oninput = render;
$("genreFilter").onchange = render;
$("sortBy").onchange = render;
$("addBtn").onclick = () => openForm();
$("cancelBtn").onclick = () => $("dialog").close();
$("closeDetailsBtn").onclick = () => $("detailsDialog").close();
$("grid").onclick = cardAction;
$("movieForm").onsubmit = saveMovie;

setGenres();
loadMovies();


