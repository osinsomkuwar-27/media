import { z } from 'zod';

export const uploadMediaSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional().default(''),
    unlockPrice: z.coerce.number().min(0, 'unlockPrice must be >= 0'),
  }),
});