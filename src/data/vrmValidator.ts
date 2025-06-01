export const vrmValidator = (vrm: string) => {
  const trimmedVrm = vrm.trim();
  if (trimmedVrm === null || trimmedVrm === '' || trimmedVrm.length > 7) {
    return {
      valid: false,
      error: { message: 'vrm must be 7 characters or less', statusCode: 400, code: 400 }
    };
  }
  return { valid: true };
}