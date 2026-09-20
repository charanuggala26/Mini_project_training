// Custom error for bad form input
export class ValidationError extends Error {}

// Throws a ValidationError if the movie data is invalid
export function validateMovie(movie) {
  if (!movie.title) throw new ValidationError("Title is required");
  if (movie.releaseYear < 1900 || movie.releaseYear > 2100) throw new ValidationError("Year must be between 1900 and 2100");
  if (movie.rating < 0 || movie.rating > 10) throw new ValidationError("Rating must be between 0 and 10");
}

// Shows the validation message to the user
export function handleValidationError(error) {
  alert(error.message);
}
