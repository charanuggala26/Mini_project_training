const STORAGE_KEY = "crudflix.movies";
const DB_URL = "../../db.json";
const POSTERS = {
  "3 Idiots": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
  Chhichhore: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
  Dangal: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80",
  "Taare Zameen Par": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
  "Zindagi Na Milegi Dobara": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
  Jawan: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&q=80"
};

let moviesPromise;

async function readInitialMovies() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const movies = JSON.parse(stored);
    return movies.map((movie) => ({
      ...movie,
      poster: POSTERS[movie.title] || movie.poster
    }));
  }

  const response = await fetch(DB_URL);
  if (!response.ok) {
    throw new Error("Unable to load the movie collection.");
  }

  const data = await response.json();
  const movies = Array.isArray(data.movies) ? data.movies : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  return movies;
}

function persist(movies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  return movies;
}

async function getStoredMovies() {
  if (!moviesPromise) {
    moviesPromise = readInitialMovies();
  }
  return moviesPromise;
}

export async function getMovies() {
  return [...await getStoredMovies()];
}

export async function addMovie(movie) {
  const movies = await getStoredMovies();
  const nextId = movies.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  movies.push({ ...movie, id: nextId });
  persist(movies);
  return { ...movie, id: nextId };
}

export async function updateMovie(id, movie) {
  const movies = await getStoredMovies();
  const index = movies.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    throw new Error("Movie not found.");
  }
  movies[index] = { ...movie, id: movies[index].id };
  persist(movies);
  return movies[index];
}

export async function deleteMovie(id) {
  const movies = await getStoredMovies();
  const remaining = movies.filter((item) => String(item.id) !== String(id));
  if (remaining.length === movies.length) {
    throw new Error("Movie not found.");
  }
  movies.splice(0, movies.length, ...remaining);
  persist(movies);
}
