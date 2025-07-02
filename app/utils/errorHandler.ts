import { z } from 'zod';
import { Context } from 'hono';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown, c: Context) {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return c.json({
      success: false,
      error: error.message,
      code: error.code
    }, error.statusCode);
  }
  
  if (error instanceof z.ZodError) {
    return c.json({
      success: false,
      error: 'Invalid request data',
      details: error.errors
    }, 400);
  }
  
  if (error instanceof Error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
  
  return c.json({
    success: false,
    error: 'Internal server error'
  }, 500);
}

export function validateId(id: string | undefined): number {
  if (!id) {
    throw new AppError('ID is required', 400);
  }
  
  const numId = parseInt(id);
  if (isNaN(numId)) {
    throw new AppError('Invalid ID format', 400);
  }
  
  return numId;
}