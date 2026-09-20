// All movie requests go through Axios and JSON Server.
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.9/+esm";

const MOVIES_URL = "http://localhost:3000/movies";

export async function getMovies() {
  const response = await axios.get(MOVIES_URL);
  return response.data;
}

export async function addMovie(movie) {
  const response = await axios.post(MOVIES_URL, movie);
  return response.data;
}

export async function updateMovie(id, movie) {
  const response = await axios.put(`${MOVIES_URL}/${id}`, movie);
  return response.data;
}

export async function deleteMovie(id) {
  await axios.delete(`${MOVIES_URL}/${id}`);
}
