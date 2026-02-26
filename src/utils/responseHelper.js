/**
 * Response Helper
 * Provides structured JSON responses with envelope {data, message, status, timestamp}
 */

const successResponse = (res, { data = null, message = 'Success', statusCode = 200, meta = {} }) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

const errorResponse = (res, { message = 'Error', statusCode = 500, errors = null }) => {
  const response = {
    status: statusCode,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, { data, message = 'Success', statusCode = 200, pagination }) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
