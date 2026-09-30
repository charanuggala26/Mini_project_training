import { BASE_URL } from "./apiConfig.js";
import { handleApiError } from "../../exception/apiException.js";


/* ---------- GET ---------- */

export async function getMovies() {

    try {

        const response = await axios.get(`${BASE_URL}/movies`);

        return response.data;

    } catch (error) {

        throw new Error(
            handleApiError(error, "load movies")
        );
    }
}


/* ---------- GET ONE ---------- */

export async function getMovieById(id) {

    try {

        const response = await axios.get(
            `${BASE_URL}/movies/${id}`
        );

        return response.data;

    } catch (error) {

        throw new Error(
            handleApiError(error, "load movie")
        );
    }
}


/* ---------- POST ---------- */

export async function addMovie(movie) {

    try {

        const response = await axios.post(
            `${BASE_URL}/movies`,
            movie
        );

        return response.data;

    } catch (error) {

        throw new Error(
            handleApiError(error, "add movie")
        );
    }
}


/* ---------- PUT ---------- */

export async function updateMovie(id, movie) {

    try {

        const response = await axios.put(
            `${BASE_URL}/movies/${id}`,
            movie
        );

        return response.data;

    } catch (error) {

        throw new Error(
            handleApiError(error, "update movie")
        );
    }
}


/* ---------- DELETE ---------- */

export async function deleteMovie(id) {

    try {

        await axios.delete(
            `${BASE_URL}/movies/${id}`
        );

    } catch (error) {

        throw new Error(
            handleApiError(error, "delete movie")
        );
    }
}