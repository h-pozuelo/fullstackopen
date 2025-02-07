const logger = require("./logger");
const jwt = require("jsonwebtoken");

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:", request.path);
  logger.info("Body:", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) =>
  response.status(404).send({ error: "unknown endpoint" });

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError")
    return response.status(400).send({ error: "malformatted id" });
  if (error.name === "ValidationError")
    return response.status(400).send({ error: error.message });
  if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  )
    return response
      .status(400)
      .send({ error: "expected `username` to be unique" });
  if (error.name === "JsonWebTokenError")
    return response.status(401).json({ error: "token invalid" });
  if (error.name === "TokenExpiredError")
    return response.status(401).json({ error: "token expired" });

  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer "))
    request.token = authorization.replace("Bearer ", "");

  next();
};

const userExtractor = (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id)
      return response.status(401).json({ error: "token invalid" });

    request.user = decodedToken;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
