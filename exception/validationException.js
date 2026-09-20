export class ValidationError extends Error {}

export function validateMovie(movie) {
  if (!movie.title) throw new ValidationError("Title is required");
  if (Number.isNaN(movie.releaseYear) ||
      movie.releaseYear < 1888 || movie.releaseYear > 2026) {
    throw new ValidationError("Enter a Valid year");
  }
  if (Number.isNaN(movie.rating) || movie.rating < 0 || movie.rating > 10) {
    throw new ValidationError("Rating must be between 0 and 10");
  }
}

export function handleValidationError(error) {
  alert(error.message);
}
