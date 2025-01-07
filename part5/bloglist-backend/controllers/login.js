const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/users");

loginRouter.post("/", async (request, response, next) => {
  const { username, password } = request.body;

  try {
    // Encontramos en la base de datos al usuario que cumpla con el filtro especificado (que su nombre de usuario coincida con aquel recibido dentro del cuerpo de la solicitud HTTP).
    const user = await User.findOne({ username: username });
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    // Si el usuario no existe (null) ni la contraseña coincide con el hash almacenado en la base de datos (comparamos la contraseña con el hash mediante el método "bcrypt.compare()").
    if (!(user && passwordCorrect))
      return response
        .status(401)
        .json({ error: "invalid username or password" });

    // Construimos el "payload" (conjunto de "claims" que identifican a la entidad).
    const userForToken = { username: user.username, id: user._id };

    /* Generamos el token con el método "jwt.sign()" (debemos definir la variable de entorno que corresponde al secreto).
    Podemos establecer un tiempo de validez pasándole como 3º parámetro un objeto que contenga la propiedad "expiresIn" con un valor en segundos (debemos controlar el error en el middleware controlador de errores).
    */
    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: 60 * 60,
    });

    response
      .status(200)
      .send({ token, username: user.username, name: user.name });
  } catch (error) {
    next(error);
  }
});

module.exports = loginRouter;
