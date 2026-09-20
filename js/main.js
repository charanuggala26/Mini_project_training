// DOM logic only. All API calls come from the service file.
import { getMovies, addMovie, updateMovie, deleteMovie } from "./service/movieService.js";
import { validateMovie, handleValidationError } from "../exception/validationException.js";

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"];
const FIELDS = ["title", "genre", "language", "releaseYear", "rating", "duration", "description", "poster"];
const $ = (id) => document.getElementById(id);   // shortcut for getElementById

let movies = [];      // local copy of data from the server
let editId = null;    // null = adding, otherwise = id of the movie being edited

// ---------- Fill the dropdowns ----------
const options = GENRES.map((g) => `<option>${g}</option>`).join("");
$("genre").innerHTML = options;
$("genreFilter").innerHTML = `<option value="">All Genres</option>` + options;

// ---------- READ + display ----------
async function loadMovies() {
  movies = (await getMovies()) || [];
  render();
}

function render() {
  const text = $("search").value.toLowerCase();
  const genre = $("genreFilter").value;

  const list = movies.filter(
    (m) => m.title.toLowerCase().includes(text) && (!genre || m.genre === genre)
  );

  $("grid").innerHTML =
    list.map((m) => `
      <div class="card">
        <img src="${m.poster}" alt="${m.title}">
        <h3>${m.title}</h3>
        <p>${m.genre} • ${m.language} • ${m.releaseYear}</p>
        <p>⭐ ${m.rating} • ${m.duration}</p>
        <small>${m.description}</small>
        <button data-action="fav" data-id="${m.id}">${m.favorite ? "❤️" : "🤍"}</button>
        <button data-action="edit" data-id="${m.id}">✏️</button>
        <button data-action="delete" data-id="${m.id}">🗑️</button>
      </div>`).join("") || "<p>No movies found 😢</p>";
}

// ---------- Search + filter ----------
$("search").oninput = render;
$("genreFilter").onchange = render;

// ---------- Card buttons (one listener for all cards) ----------
$("grid").onclick = async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const movie = movies.find((m) => m.id == button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") return openForm(movie);

  if (action === "fav") await updateMovie(movie.id, { ...movie, favorite: !movie.favorite });     // UPDATE
  if (action === "delete" && confirm(`Delete "${movie.title}"?`)) await deleteMovie(movie.id);     // DELETE

  loadMovies();
};

// ---------- Add / Edit form ----------
function openForm(movie) {
  editId = movie ? movie.id : null;
  $("formTitle").textContent = movie ? "Edit Movie" : "Add Movie";

  const empty = { title: "", genre: GENRES[0], language: "Hindi", releaseYear: 2024, rating: 5, duration: "", description: "", poster: "" };
  const data = movie || empty;
  FIELDS.forEach((field) => ($(field).value = data[field]));

  $("dialog").showModal();
}

$("addBtn").onclick = () => openForm();
$("cancelBtn").onclick = () => $("dialog").close();

$("movieForm").onsubmit = async (e) => {
  e.preventDefault();   // stop the page from reloading

  // read every form field into one object
  const movie = {};
  FIELDS.forEach((field) => (movie[field] = $(field).value.trim()));
  movie.releaseYear = Number(movie.releaseYear);   // inputs give text, convert to numbers
  movie.rating = Number(movie.rating);

  try {
    validateMovie(movie);
  } catch (error) {
    return handleValidationError(error);
  }

  // no poster given? make a placeholder image from the title
  if (!movie.poster) {
    movie.poster = `https://placehold.co/500x750/1b1b1b/ffffff?text=${encodeURIComponent(movie.title)}`;
  }

  if (editId) {
    const old = movies.find((m) => m.id == editId);
    await updateMovie(editId, { ...old, ...movie });        // UPDATE
  } else {
    await addMovie({ ...movie, favorite: false });          // CREATE
  }

  $("dialog").close();
  loadMovies();
};

loadMovies();   // run once when the page opens
