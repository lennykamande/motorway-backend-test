import { describe, it, expect } from 'vitest';
import { vrmValidator } from '@app/data';

describe('vrmValidator', () => {
  it('should return valid: true for a valid VRM', () => {
    expect(vrmValidator('ABC123')).toEqual({ valid: true });
    expect(vrmValidator('  ABC123 ')).toEqual({ valid: true });
    expect(vrmValidator('1234567')).toEqual({ valid: true });
  });

  it('should return valid: false and error for empty string', () => {
    expect(vrmValidator('')).toEqual({
      valid: false,
      error: { message: 'vrm must be 7 characters or less', statusCode: 400, code: 400 }
    });
  });

  it('should return valid: false and error for string longer than 7', () => {
    expect(vrmValidator('ABCDEFGH')).toEqual({
      valid: false,
      error: { message: 'vrm must be 7 characters or less', statusCode: 400, code: 400 }
    });
  });

  it('should return valid: false and error for string with only spaces', () => {
    expect(vrmValidator('        ')).toEqual({
      valid: false,
      error: { message: 'vrm must be 7 characters or less', statusCode: 400, code: 400 }
    });
  });
});