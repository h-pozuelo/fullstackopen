const blogsRouter = require("express").Router();
const Blog = require("../models/blogs");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const middleware = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.status(200).json(blogs);
});

// /* El método "getTokenFrom()" recupera de la solicitud HTTP la cabecera "Authorization" (quitando la cadena de texto "Bearer " para retornar solo el JWT).
//  */
// const getTokenFrom = (request) => {
//   const authorization = request.get("authorization");
//   // Si existe la cabecera "Authorization" comprobamos que el esquema de autenticación sea "Bearer" (debemos quitar la cadena de texto "Bearer " para retornar solo el token).
//   if (authorization && authorization.startsWith("Bearer "))
//     return authorization.replace("Bearer ", "");
//   return null;
// };

blogsRouter.post(
  "/",
  middleware.userExtractor,
  async (request, response, next) => {
    const body = request.body;

    try {
      // // Buscamos en la base de datos aquel usuario en el que su identificador coincide con "userId".
      // const user = await User.findById(body.userId);

      // /* Decodificamos el token con el método "jwt.verify()" que 1º verifica que el token recibido como parámetro ha sido codificado con nuestro secreto.
      // Después retorna el "payload" con los "claims" que identifican a la entidad.
      // Si el token es inválido o nulo saltará la excepción "JsonWebTokenError".
      // */
      // const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

      // const decodedToken = jwt.verify(request.token, process.env.SECRET);
      // // Controlamos que el "payload" contiene el "claim" de "id".
      // if (!decodedToken.id)
      //   return response.status(401).json({ error: "token invalid" });

      const decodedToken = request.user;

      const user = await User.findById(decodedToken.id);

      const blog = new Blog({
        title: body.title,
        author: user.name, // La propiedad "author" la rellenamos con el nombre del usuario.
        url: body.url,
        user: user._id, // La propiedad "user" la rellenamos con el "ObjectId" del usuario.
      });

      // Cuando almacenamos el objeto en la base de datos retorna el nuevo elemento (con su "ObjectId").
      const savedBlog = await blog.save();
      user.blogs = user.blogs.concat(savedBlog._id); // Concatenamos el "ObjectId" a la lista de identificadores del usuario en cuestión.
      await user.save();

      /* ¡IMPORTANTE!
      Para que el cliente pueda determinar si el usuario que ha iniciado sesión es o no el autor del post debemos adjuntar a la respuesta la propiedad "user" poblada con la información del usuario autor (el método ".populate()" realiza una operación asíncrona).
      */
      response
        .status(201)
        .json(await savedBlog.populate("user", { username: 1, name: 1 }));
    } catch (error) {
      next(error);
    }
  }
);

blogsRouter.get("/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const blog = await Blog.findById(id).populate("user", {
      username: 1,
      name: 1,
    });

    if (!blog) return response.status(404).end();
    response.status(200).json(blog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response, next) => {
    const id = request.params.id;

    try {
      // const decodedToken = jwt.verify(request.token, process.env.SECRET);
      // if (!decodedToken.id)
      //   return response.status(401).json({ error: "token invalid" });

      const decodedToken = request.user;

      const blog = await Blog.findById(id);
      if (blog.user.toString() !== decodedToken.id)
        return response.status(401).json({ error: "unauthorized operation" });

      // await Blog.findByIdAndDelete(id);
      await blog.deleteOne();

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

blogsRouter.put("/:id", async (request, response, next) => {
  const id = request.params.id;
  const { title, author, url, likes } = request.body;

  const blog = { title, author, url, likes };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
      new: true,
      runValidators: true,
      context: "query",
    });

    response.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
