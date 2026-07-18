import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { verifyToken } from '../utils/jwt.js';

// Verifies the JWT from the Authorization header, loads the user,
// and attaches it to req.user. Downstream routes/controllers can
// then trust req.user is a real, authenticated user document.
const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  // verifyToken throws JsonWebTokenError / TokenExpiredError on failure —
  // both are caught here and forwarded to the centralized error handler,
  // which maps them to the correct 401 response.
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(err);
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    return next(new AppError('User belonging to this token no longer exists', 401, 'UNAUTHORIZED'));
  }

  req.user = user;
  next();
});

export default protect;