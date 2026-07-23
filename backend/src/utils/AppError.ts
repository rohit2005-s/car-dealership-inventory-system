/**
 * Standard operational error used across services/controllers.
 * Lets the centralized error middleware respond with the right
 * status code and message instead of leaking stack traces.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
