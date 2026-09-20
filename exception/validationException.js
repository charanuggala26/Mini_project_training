export class ValidationError extends Error {}

export function validateMovie(movie) {
  if (!movie.title) throw new ValidationError("Title is required");
  if (Number.isNaN(movie.releaseYear) ||
      movie.releaseYear < 1900 || movie.releaseYear > 2100) {
    throw new ValidationError("Year must be between 1900 and 2100");
  }
  if (Number.isNaN(movie.rating) || movie.rating < 0 || movie.rating > 10) {
    throw new ValidationError("Rating must be between 0 and 10");
  }
}

export function handleValidationError(error) {
  alert(error.message);
}
