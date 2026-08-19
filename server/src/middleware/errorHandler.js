const { AppError } = require("../errors");

function notFoundHandler(_req, _res, next) {
  next(
    new AppError("Route not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    }),
  );
}

function errorHandler(error, _req, res, _next) {
  const isKnownError = error instanceof AppError;
  const statusCode = isKnownError ? error.statusCode : 500;
  const code = isKnownError ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isKnownError ? error.message : "Unexpected server error";

  if (statusCode >= 500) {
    console.error({
      code,
      message: error.message,
      details: error.details,
      stack: error.stack,
    });
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
