import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});