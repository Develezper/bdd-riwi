function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;

  if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
  }

  if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
  }

  const payload = {
    success: false,
    message: err.message || 'Internal server error'
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };
