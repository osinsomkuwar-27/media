import catchAsync from '../utils/catchAsync.js';
import { registerUser, loginUser } from '../services/auth.service.js';
import { logAudit } from '../utils/auditLogger.js';

export const register = catchAsync(async (req, res) => {
  const { user, token } = await registerUser(req.body);

  logAudit({ req, userId: user.id, action: 'USER_REGISTERED' });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token },
  });
});

export const login = catchAsync(async (req, res) => {
  const { user, token } = await loginUser(req.body);

  logAudit({ req, userId: user.id, action: 'USER_LOGIN' });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: req.user.toSafeObject() },
  });
});