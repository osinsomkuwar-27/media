import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const MEDIA_TOKEN_EXPIRY = '5m';

// Deliberately separate purpose/shape from the normal auth JWT so a
// media-access token can never be reused as a login session token,
// even though both happen to share the same signing secret.
export function signMediaAccessToken(mediaId, userId) {
  return jwt.sign(
    {
      mediaId: mediaId.toString(),
      userId: userId.toString(),
      purpose: 'media_access',
    },
    env.jwtSecret,
    { expiresIn: MEDIA_TOKEN_EXPIRY }
  );
}

export function verifyMediaAccessToken(token) {
  // Throws JsonWebTokenError / TokenExpiredError on failure — caller handles it.
  return jwt.verify(token, env.jwtSecret);
}