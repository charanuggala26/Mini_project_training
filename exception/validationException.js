export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
export function validateMovie(movie) {
  if (!movie.title) {
    throw new ValidationError("Title is required");
  }

  if (!movie.genre) {
    throw new ValidationError("Genre is required");
  }

  if (!movie.language) {
    throw new ValidationError("Language is required");
  }

  if (!movie.releaseYear) {
    throw new ValidationError("Release year is required");
  }

  if (Number.isNaN(movie.releaseYear) ||
      movie.releaseYear < 1888 ||
      movie.releaseYear > 2026) {
    throw new ValidationError("Enter a valid year");
  }

  if (!movie.rating) {
    throw new ValidationError("Rating is required");
  }

  if (Number.isNaN(movie.rating) ||
      movie.rating < 0 ||
      movie.rating > 10) {
    throw new ValidationError("Rating must be between 0 and 10");
  }

  if (!movie.duration) {
    throw new ValidationError("Duration is required");
  }

  if (!movie.description) {
    throw new ValidationError("Description is required");
  }
}

export function handleValidationError(error) {
  alert(error.message);
}
