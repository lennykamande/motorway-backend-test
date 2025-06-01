import { describe, it, expect } from 'vitest';
import { ValidationError } from '../validationError';

describe('ValidationError', () => {
  it('should set all properties correctly with defaults', () => {
    const err = new ValidationError('Invalid input');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.name).toBe('ValidationError');
    expect(err.message).toBe('Invalid input');
    expect(err.httpStatus).toBe(400);
    expect(err.statusCode).toBe(400);
    expect(err.errorMessage).toBe('Invalid input');
    expect(err.originalError).toBeUndefined();
  });

  it('should set all properties with custom values', () => {
    const original = new Error('Root cause');
    const err = new ValidationError('Bad request', 422, 123, original);
    expect(err.httpStatus).toBe(422);
    expect(err.statusCode).toBe(123);
    expect(err.errorMessage).toBe('Bad request');
    expect(err.originalError).toBe(original);
  });
});