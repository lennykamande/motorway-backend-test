import { describe, it, expect } from 'vitest';
import { mileageValidator } from '@app/data';

describe('mileageValidator', () => {
  it('should return valid: true for positive mileage', () => {
    expect(mileageValidator(10000)).toEqual({ valid: true });
    expect(mileageValidator(1)).toEqual({ valid: true });
  });

  it('should return valid: false and error for null mileage', () => {
    expect(mileageValidator(null)).toEqual({
      valid: false,
      error: { message: 'mileage must be a positive number', statusCode: 400, code: 400 }
    });
  });

  it('should return valid: false and error for zero mileage', () => {
    expect(mileageValidator(0)).toEqual({
      valid: false,
      error: { message: 'mileage must be a positive number', statusCode: 400, code: 400 }
    });
  });

  it('should return valid: false and error for negative mileage', () => {
    expect(mileageValidator(-5)).toEqual({
      valid: false,
      error: { message: 'mileage must be a positive number', statusCode: 400, code: 400 }
    });
  });
});