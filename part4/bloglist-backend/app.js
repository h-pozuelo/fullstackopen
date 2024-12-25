const config = require("./utils/config");
const logger = require("./utils/logger");
const express = require("express");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const mongoUrl = config.MONGODB_URI;
mongoose
  .connect(mongoUrl)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB", error.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

/* Sólo implementamos el middleware "userExtractor()" a esta ruta específica.
Podemos implementar el middleware a una operación específica del controlador:
  const middleware = require("../utils/middleware");
  // ...
  router.post("/", middleware.userExtractor, async (request, response, next) => {
    // ...
  });
*/
app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
