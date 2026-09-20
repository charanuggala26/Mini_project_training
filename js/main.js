// DOM logic only. All API calls come from the service file.
import { getMovies, addMovie, updateMovie, deleteMovie } from "./service/movieService.js";
import { validateMovie, handleValidationError } from "../exception/validationException.js";

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"];
const FIELDS = ["title", "genre", "language", "releaseYear", "rating", "duration", "description", "poster"];
const $ = (id) => document.getElementById(id);   // shortcut for getElementById

let movies = [];      // local copy of data from the server
let editId = null;    // null = adding, otherwise = id of the movie being edited

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function showError(error) {
  console.error(error);
  $("grid").innerHTML = `<p class="status error">Could not load your movies. Please refresh and try again.</p>`;
}

// ---------- Fill the dropdowns ----------
const options = GENRES.map((g) => `<option>${g}</option>`).join("");
$("genre").innerHTML = options;
$("genreFilter").innerHTML = `<option value="">All Genres</option>` + options;

// ---------- READ + display ----------
async function loadMovies() {
  try {
    movies = (await getMovies()) || [];
    render();
  } catch (error) {
    showError(error);
  }
}

function render() {
  const text = $("search").value.toLowerCase();
  const genre = $("genreFilter").value;
  const sortBy = $("sortBy").value;

  const list = movies.filter(
    (m) => m.title.toLowerCase().includes(text) && (!genre || m.genre === genre)
  ).sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
    if (sortBy === "oldest") return Number(a.releaseYear) - Number(b.releaseYear);
    return Number(b.releaseYear) - Number(a.releaseYear);
  });

  $("grid").innerHTML =
    list.map((m) => `
      <div class="card">
        <img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}" onerror="this.src='https://placehold.co/500x750/172033/e6edf7?text=No+poster'">
        <div class="card-content">
          <h3>${escapeHtml(m.title)}</h3>
          <p class="muted">${escapeHtml(m.genre)} · ${escapeHtml(m.language)} · ${escapeHtml(m.releaseYear)}</p>
          <p class="rating">★ ${escapeHtml(m.rating)} <span>· ${escapeHtml(m.duration)}</span></p>
          <small>${escapeHtml(m.description)}</small>
        </div>
        <button data-action="fav" data-id="${m.id}">${m.favorite ? "❤️" : "🤍"}</button>
        <button class="icon-button" data-action="edit" data-id="${m.id}" aria-label="Edit ${escapeHtml(m.title)}">✎</button>
        <button class="icon-button danger" data-action="delete" data-id="${m.id}" aria-label="Delete ${escapeHtml(m.title)}">×</button>
      </div>`).join("") || "<p>No movies found 😢</p>";
}

// ---------- Search + filter ----------
$("search").oninput = render;
$("genreFilter").onchange = render;
$("sortBy").onchange = render;

// ---------- Card buttons (one listener for all cards) ----------
$("grid").onclick = async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const movie = movies.find((m) => m.id == button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") return openForm(movie);

  try {
    if (action === "fav") await updateMovie(movie.id, { ...movie, favorite: !movie.favorite });
    if (action === "delete" && confirm(`Delete "${movie.title}"?`)) await deleteMovie(movie.id);
  } catch (error) {
    showError(error);
    return;
  }

  await loadMovies();
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

  try {
    if (editId) {
      const old = movies.find((m) => m.id == editId);
      await updateMovie(editId, { ...old, ...movie });
    } else {
      await addMovie({ ...movie, favorite: false });
    }
  } catch (error) {
    showError(error);
    return;
  }

  $("dialog").close();
  loadMovies();
};

loadMovies();   // run once when the page opens
