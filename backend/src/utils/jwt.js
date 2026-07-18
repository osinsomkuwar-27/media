import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  // Throws jwt.TokenExpiredError or jwt.JsonWebTokenError on failure —
  // caller is responsible for catching and converting to a 401.
  return jwt.verify(token, env.jwtSecret);
}