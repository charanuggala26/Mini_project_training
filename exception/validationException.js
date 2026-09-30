export function validateMovie(movie) {

    if (!movie.title.trim()) {
        return "Movie title is required.";
    }

    if (!movie.genre) {
        return "Please select a genre.";
    }

    if (!movie.language.trim()) {
        return "Language is required.";
    }

    if (!movie.releaseYear) {
        return "Release year is required.";
    }

    if (movie.rating < 0 || movie.rating > 10) {
        return "Rating must be between 0 and 10.";
    }

    if (!movie.duration.trim()) {
        return "Duration is required.";
    }

    if (!movie.poster.trim()) {
        return "Poster URL is required.";
    }

    if (!movie.description.trim()) {
        return "Description is required.";
    }

    return null;
}