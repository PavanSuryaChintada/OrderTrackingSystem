function notFoundHandler(_req, res) {
  return res.status(404).json({
    message: "Route not found",
  });
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON payload",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
