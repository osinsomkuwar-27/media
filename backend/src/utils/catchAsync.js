// Wraps async route handlers so any thrown/rejected error is
// automatically passed to next(), instead of needing try/catch
// in every single controller.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;