export const mileageValidator = (mileage: number) => {
  if (mileage === null || mileage <= 0) {
    return {
      valid: false,
      error: { message: 'mileage must be a positive number', statusCode: 400, code: 400 }
    };
  }
  return { valid: true };
}