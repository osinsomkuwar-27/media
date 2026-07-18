import AppError from '../utils/AppError.js';

// Generic Zod-validation middleware. Pass a schema shaped like
// { body: z.object({...}) } and it validates req.body against it,
// replacing req.body with the parsed (and type-coerced) result.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body });

  if (!result.success) {
    const message = result.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');

    return next(new AppError(message, 400, 'VALIDATION_ERROR'));
  }

  req.body = result.data.body;
  next();
};

export default validate;