export const notFoundHandler = (request, response) => {
  response.status(404).json({ error: 'Route not found' });
};

export const errorHandler = (error, request, response, next) => {
  // Keep diagnostic context on the server, without leaking provider/database
  // internals to clients.
  console.error({
    message: error.message,
    name: error.name,
    code: error.code,
    path: request.originalUrl
  });
  if (response.headersSent) return next(error);

  const statusCode = error.statusCode || (error.name === 'AxiosError' ? 502 : 500);
  response.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : error.message
  });
};
