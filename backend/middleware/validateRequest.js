import { validationResult } from 'express-validator';

export const validateRequest = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({
      error: 'Validation failed',
      details: errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  return next();
};