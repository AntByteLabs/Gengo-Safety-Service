export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'AppError';
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static unauthorized(message = 'Missing or invalid token'): AppError {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError('NOT_FOUND', `${resource} not found`, 404);
  }

  static conflict(message: string): AppError {
    return new AppError('CONFLICT', message, 409);
  }

  static validationError(message: string, field?: string): AppError {
    return new AppError('VALIDATION_ERROR', message, 400, field);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError('INTERNAL_ERROR', message, 500);
  }
}
