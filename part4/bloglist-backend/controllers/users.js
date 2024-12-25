const usersRouter = require("express").Router();
const User = require("../models/users");

const bcrypt = require("bcrypt");

usersRouter.get("/", async (request, response) => {
  /* Con el método ".populate()" le decimos a MongoDB que busque en la base de datos aquella colección a la que la propiedad "user.blogs" hace referencia ("ref": "Blog").
    Por cada identificador en la lista traerá aquel elemento correspondiente.
    Podemos especificar que propiedades traer pasando un 2º parámetro.
    */
  const users = await User.find({}).populate("blogs", {
    title: 1,
    url: 1,
    likes: 1,
  });
  response.status(200).json(users);
});

/* La solicitud HTTP POST envía en el cuerpo de la petición un objeto con el nombre de usuario, el nombre y la contraseña.
Como no queremos almacenar la contraseña en la base de datos debemos cifrarla con el método "bcrypt.hash()" que recibe la contraseña y el número de iteraciones (salt rounds).
*/
usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!(password && password.length >= 3))
    return response.status(400).json({ error: "malformatted password" });

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({ username, name, passwordHash });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
