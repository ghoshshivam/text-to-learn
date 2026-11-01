const { AppError } = require("../utils/errors");

const isProd = process.env.NODE_ENV === "production";

const notFound = (req, res, next) =>
  next(
    new AppError(`Route not found: ${req.method} ${req.originalUrl}`, {
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
    })
  );

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = isProd ? "Something went wrong on our side." : err.message;
  let details;

  if (err.name === "ZodError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid request";
    details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
  } else if (err instanceof AppError) {
    ({ statusCode, code, message } = err);
  } else if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid id";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = err.message;
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Request body is not valid JSON";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    code = "PAYLOAD_TOO_LARGE";
    message = "Request body is too large";
  } else if (err.status === 401 || err.status === 403) {
    // errors from the Auth0 JWT middleware
    statusCode = err.status;
    code = "UNAUTHORIZED";
    message = "Invalid or missing access token";
  }

  if (statusCode >= 500) console.error("[error]", err);

  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details && { details }) },
  });
};

module.exports = { notFound, errorHandler };