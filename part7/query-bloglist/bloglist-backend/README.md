# bloglist-backend

Creamos el directorio en donde va a residir el servidor web:
· `mkdir bloglist-backend`

Accedemos a la carpeta creada para iniciar el entorno de "Node.js":
· `cd bloglist-backend/`
· `npm init`

Creamos el fichero `index.js`.

Instalamos el servidor web de "Express.js":
· `npm install express --save`

Dentro de `index.js` montamos un servidor web preliminal:

```
const express = require("express");
const app = express();

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Para arrancar el servidor web ejecutamos `node index.js`.

## Configuración de Nodemon y scripts npm

Instalamos el paquete de "Nodemon" para que el servidor web se reinicie con cada cambio realizado:
· `npm install nodemon --save-dev`

Dentro de `package.json` definimos los scripts npm:

```
{
  ...,
  "scripts": {
    ...,
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  ...
}
```

Para arrancar el servidor web podemos ejecutar `npm start` o `npm run dev` (al no ser un comando que viene por defecto en Node es necesario incluir el "run").

## Configuración de CORS

Instalamos el paquete de "CORS" para poder acceder al servidor web desde un origen distinto al cual se ha levantado el servidor web (nos permitirá acceder al servidor web levantado en el puerto "3003" desde el cliente independientemente del puerto en el que esté levantado):
· `npm install cors --save`

Dentro de `index.js` importamos el módulo de "CORS". Dado que "CORS" actua como un middleware también debemos implementarlo (debe encontrarse entre los primeros middlewares implementados):

```
...
const cors = require("cors");

app.use(cors());
...
```

## Configuración de Mongoose

Instalamos el paquete de "Mongoose" para poder comunicarnos con la base de datos de MongoDB:
· `npm install mongoose --save`

Dentro de `index.js` importamos el módulo de "Mongoose". También debemos definir tanto el esquema (plantilla que los elementos de una colección deben cumplir) como el modelo:

```
...
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

const mongoUrl =
  "mongodb+srv://hugopmempleo:<db_password>@cluster0.u24mb.mongodb.net/bloglistApp?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("error connecting to MongoDB", error.message);
    process.exit(1);
  });
...
```

## Configuración de Dotenv y variables de entorno

Instalamos el paquete de "Dotenv" para poder recuperar variables de entorno definidas en el fichero `.env`:
· `npm install dotenv --save`

Creamos el fichero `.env` y definimos las variables de entorno necesarias:

```
MONGODB_URI=mongodb+srv://hugopmempleo:<db_password>@cluster0.u24mb.mongodb.net/bloglistApp?retryWrites=true&w=majority&appName=Cluster0
PORT=3003
```

Dentro de `index.js` importamos la configuración de "Dotenv" para poder consumir las variables de entorno definidas en el fichero `.env`:

```
require("dotenv").config();
...
const mongoUrl = process.env.MONGODB_URI;
...
const PORT = process.env.PORT;
...
```

**¡IMPORTANTE!** Para no filtrar nuestros secretos en GitHub debemos de incluir el fichero `.env` dentro del fichero `.gitignore`.

## Definición de los controladores de rutas

Dentro de `index.js` definimos los controladores de rutas para nuestra aplicación. También debemos implementar el middleware de "express.json()" (json-parser) que se encargará de adjuntar los datos JSON de una solicitud HTTP POST al cuerpo de una petición (request.body) como un objeto de JavaScript.

```
...
app.use(express.json());

app.get("/api/blogs", (request, response) => {
  Blog.find({}).then((blogs) => response.json(blogs));
});

app.post("/api/blogs", (request, response) => {
  const body = request.body;
  const blog = new Blog(body);

  blog.save().then((result) => response.status(201).json(result));
});
...
```

## Refactorización y componetización del servidor web

### app.js

Creamos el fichero `app.js` y trasladamos la aplicación a un módulo propio:

```
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

const mongoUrl = process.env.MONGODB_URI;
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("error connecting to MongoDB", error.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

app.get("/api/blogs", (request, response) => {
  Blog.find({}).then((blogs) => response.json(blogs));
});

app.post("/api/blogs", (request, response) => {
  const body = request.body;
  const blog = new Blog(body);

  blog.save().then((result) => response.status(201).json(result));
});

module.exports = app;
```

Dentro de `index.js` importamos el módulo de `app.js`:

```
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### utils/

#### logger.js

Creamos el fichero `utils/logger.js` y trasladamos las impresiones por consola a su propio módulo:

```
const info = (...params) => console.log(...params);

const error = (...params) => console.error(...params);

module.exports = { info, error };
```

Reemplazamos todas las impresiones por consola dentro de `index.js` y `app.js` por las funciones exportadas desde el módulo `utils/logger.js`.

#### config.js

Creamos el fichero `utils/config.js` y trasladamos el manejo de las variables de entorno a un módulo propio:

```
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

module.exports = { MONGODB_URI, PORT };
```

Dentro de `index.js` importamos el módulo de `utils/config.js`. También debemos reemplazar las llamadas directas a variables de entorno por las propiedades del módulo importado:

```
const config = require("./utils/config");
...
const PORT = config.PORT;
...
```

Dentro de `app.js` importamos el módulo de `utils/config.js`. También debemos reemplazar las llamadas directas a variables de entorno por las propiedades del módulo importado:

```
const config = require("./utils/config");
...
const mongoUrl = config.MONGODB_URI;
...
```

### models/

#### blogs.js

Creamos el fichero `models/blogs.js` y trasladamos tanto la definición del esquema como la del modelo:

```
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
```

Dentro de `app.js` importamos el módulo de `models/blogs.js`:

```
...
const Blog = require("./models/blogs");
...
```

### controllers/

#### blogs.js

Creamos el fichero `controllers/blogs.js` y trasladamos los controladores de rutas a un controlador a parte. Primero debemos crear un enrutador a partir del módulo de "Express.js" con el que definiremos los controladores de rutas. También debemos de reemplazar las rutas a las que hacen referencias los controladores de rutas y corregir la importación del módulo `models/blogs.js`:

```
const blogsRouter = require("express").Router();
const Blog = require("../models/blogs");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.status(200).json(blogs);
});

blogsRouter.post("/", async (request, response, next) => {
  const body = request.body;
  const blog = new Blog(body);

  try {
    const result = await blog.save();
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const blog = await Blog.findById(id);

    if (!note) return response.status(404).end();
    response.status(200).json(blog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    await Blog.findByIdAndDelete(id);

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

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
```

Dentro de `app.js` importamos el controlador de `controllers/blogs.js`. Debemos implementar el controlador como si se tratara de un middleware:

```
...
...
const blogsRouter = require("./controllers/blogs");
...
app.use("/api/blogs", blogsRouter);
...
```

## Creación de middlewares

Creamos el fichero `utils/middleware.js` y definimos tres middlewares:

1. "requestLogger" : Imprime por consola información acerca de la solicitud HTTP.
2. "unknownEndpoint" : Captura las solicitudes HTTP a rutas no definidas en el servidor.
3. "errorHandler" : Cuando se produce un error en los controladores de rutas, envían la información a este middleware. (es necesario que los controladores de rutas reciban como parámetro "next"; si la función "next()" no recibe nada como parámetro va al próximo middleware; si la función "next()" recibe un parámetro, pasará el control al middleware de errores)

"unknownEndpoint" se debe implementar después del último controlador de ruta; "errorHandler" se debe implementar como el último middleware.

```
const logger = require("./logger");

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

  if (error.name === "CastValidation")
    return response.status(400).send({ error: "malformatted id" });
  if (error.name === "ValidationError")
    return response.status(400).send({ error: error.message });

  next(error);
};

module.exports = { requestLogger, unknownEndpoint, errorHandler };
```

## Cross-Env: Establecer variables de entorno en arranque

Instalamos el paquete de "Cross-Env" para poder establecer variables de entorno al momento de arrancar nuestro servidor web:
· `npm install cross-env --save`

(Como vamos a modificar el script de arranque para que ejecute el paquete "Cross-Env", es necesario instalar el paquete como una dependencia del proyecto, no desarrollo, para que no de errores al momento de desplegar el servidor web en la nube)

Dentro de `package.json` establecemos el valor de la variable de entorno "NODE_ENV" en función de como ha sido arrancado el servidor web:

```
{
  ...,
  "scripts": {
    "test": "cross-env NODE_ENV=test node --test",
    "start": "cross-env NODE_ENV=production node index.js",
    "dev": "cross-env NODE_ENV=development nodemon index.js"
  },
  ...
}
```

### Configurando la url para la base de datos de los tests unitarios

Dentro de `.env` definimos la url de la base de datos para los tests unitarios:

```
...
TEST_MONGODB_URI=mongodb+srv://hugopmempleo:<db_password>@cluster0.u24mb.mongodb.net/testBloglistApp?retryWrites=true&w=majority&appName=Cluster0
```

Dentro de `utils/config.js` comprobamos el modo en el que ha sido arrancado el servidor web. En función de si estamos o no realizando tests unitarios carga una u otra url de base de datos:

```
...
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;
...
```

### Desactivando el módulo de impresión por consola en los tests unitarios

Dentro de `utils/logger.js` desactivamos la impresión por consola si nos encontramos realizando tests unitarios:

```
const info = (...params) => {
  if (process.env.NODE_ENV !== "test") console.log(...params);
};

const error = (...params) => {
  if (process.env.NODE_ENV !== "test") console.error(...params);
};
...
```

## Configuración de tests unitarios y SuperTest

Dentro de `package.json` definimos el script para los tests unitarios (`node --test`):

```
{
  ...,
  "scripts": {
    "test": "cross-env NODE_ENV=test node --test",
    ...
  },
  ...
}
```

Instalamos el paquete de "SuperTests" para poder hacer solicitudes HTTP al backend desde las pruebas unitarias:
· `npm install supertests --save-dev`

Creamos el fichero `tests/blogs_api_helper.js` en donde definimos los métodos necesarios para poder llevar a cabo los tests unitarios:

1. `initialBlogs`: Lista que contiene los blogs con los que inicia la base de datos de prueba.
2. `blogsInDb()`: Método que recupera los blogs que se encuentran actualmente en la base de datos de prueba. En vez de utilizar promesas, realizamos las llamadas a la base de datos con `async/await`.
3. `nonExistingId()`: Método que crea un nuevo blog, lo almacena en la base de datos de prueba y lo elimina. Como resultado retorna el "\_id" de un blog inexistente (debemos transformar el valor de la propiedad "\_id" a un objeto JavaScript con el método ".toJSON()").

```
const Blog = require("../models/blogs");

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  });

  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});

  return blogs.map((blog) => blog.toJSON());
};

module.exports = { initialBlogs, blogsInDb, nonExistingId };
```

Creamos el fichero `tests/blogs_api.test.js` en donde definimos cada una de las pruebas unitarias a ejecutar para validar el backend:

1. `test()`: Método que recibe como parámetros el nombre de la prueba junto a una función callback (el contenido de la función es la prueba a realizar). Si ejecutamos métodos que devuelven promesas, la función callback deberá ser declarada como asíncrona; Si utilizamos `test.only()` la prueba solo será ejecutada con el siguiente script `npm test -- --test-only`.
2. `assert()`: Nos permite realizar la comprobación dentro de la prueba. Si solo utilizamos `assert()` la prueba será exitosa si recibe true como parámetro. Otros métodos son `assert().equal()`, `assert.strictEqual()`, `assert.deepEqual()`, `assert.deepStrictEqual()`, que reciben 2 parámetros: valor recibido, valor expectado.
3. `beforeEach()` y `after()`: Son métodos que se ejecutan antes de cada prueba unitaria (`beforeEach()`) y después de finalizar todas las pruebas unitarias (`after()`). En este caso los utilizamos para iniciar la base de datos de prueba con los datos "mock" en cada test unitario y para cerrar la conexión con la base de datos de MongoDB.
4. `supertest()` y `app`: Importamos la aplicación de Express.js para poder construir un objeto "superagent" con el método `supertest(app)`. Este objeto "superagent" nos permitirá realizar solicitudes HTTP al backend. (¡IMPORTANTE! no es necesario levantar la aplicación en un puerto específico dado que `supertest()` se encarga de hacerlo en un puerto temporal)

```
const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blogs");
const blogsApiHelper = require("./blogs_api_helper");

const api = supertest(app);

describe("when there is initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    //   /* Para ejecutar operaciones asíncronas a partir de una colección de objetos podemos ejecutarlas en paralelo con "Promise.all()" (es un método `async/await`).
    //     1. A partir de la colección de objetos mapeamos cada uno de ellos en un nuevo objeto de tipo Mongoose (que cumple con el esquema de la base de datos).
    //     2. Dicha colección de modelos la mapeamos para ejecutar cada uno de los método ".save()" (no los ejecuta directamente sino que los deja en un estado latente).
    //     3. Con el método `Promise.all()` (devuelve una única promesa a partir de una lista de promesas) ejecutamos la lista de promesas en paralelo.
    //    */
    //   const blogObjects = blogsApiHelper.initialBlogs.map((blog) => new Blog(blog));
    //   const promiseArray = blogObjects.map((blog) => blog.save());
    //   const results = await Promise.all(promiseArray);

    //   for (let blog of blogsApiHelper.initialBlogs) {
    //     let blogObject = new Blog(blog);
    //     await blogObject.save();
    //   }

    await Blog.insertMany(blogsApiHelper.initialBlogs);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(
      response.body.length,
      blogsApiHelper.initialBlogs.length
    );
  });

  /* Para poder pasar este test unitario debemos establecer una configuración personalizada "toJSON" en el esquema de "blogSchema" que transforme la propiedad "_id" de un elemento blog en la propiedad "id".
   */
  test("blogs identifier is id instead of _id", async () => {
    const response = await api.get("/api/blogs");
    const blogToView = response.body[0];

    const keys = Object.keys(blogToView);

    assert(keys.includes("id"));
    assert(!keys.includes("_id"));
  });

  describe("viewing a specific blog", () => {});

  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "addition of a new blog: succeeds with valid data",
        author: "John Doe",
        url: "http://localhost:3003/",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsApiHelper.blogsInDb(); // Las funciones `async` del helper debemos ejecutarlas con `await`.
      const titles = blogsAtEnd.map((blog) => blog.title);

      assert.strictEqual(
        blogsAtEnd.length,
        blogsApiHelper.initialBlogs.length + 1
      );
      assert(titles.includes(newBlog.title));
    });

    /* Para poder pasar este test unitario debemos establecer en el esquema de "blogSchema" un valor por defecto para la propiedad "likes".
     */
    test("succeeds with valid data without likes initializing it at 0", async () => {
      const newBlog = {
        title:
          "addition of a new blog: succeeds with valid data without likes initializing it at 0",
        author: "John Doe",
        url: "http://localhost:3003/",
      };

      const response = await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsApiHelper.blogsInDb(); // Las funciones `async` del helper debemos ejecutarlas con `await`.
      const resultBlog = response.body;
      const keys = Object.keys(resultBlog);

      assert.strictEqual(
        blogsAtEnd.length,
        blogsApiHelper.initialBlogs.length + 1
      );
      assert(keys.includes("likes"));
      assert.strictEqual(resultBlog.likes, 0);
    });

    /* Para poder pasar este test unitario debemos establecer en el esquema de "blogSchema" las propiedades de "title" y "url" como requeridas.
        También debemos capturar los errores en el controlador de rutas de `controllers/blogs.js`.
         */
    test("fails with status code 400 if data is invalid", async () => {
      const newBlog = {
        author: "John Doe",
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const blogsAtEnd = await blogsApiHelper.blogsInDb(); // Las funciones `async` del helper debemos ejecutarlas con `await`.

      assert.strictEqual(blogsAtEnd.length, blogsApiHelper.initialBlogs.length);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsAtStart = await blogsApiHelper.blogsInDb();

      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await blogsApiHelper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);

      const titles = blogsAtEnd.map((blog) => blog.title);
      assert(!titles.includes(blogToDelete.title));
    });
  });

  describe("update of a blog", () => {
    test("succeeds with valid data and id", async () => {
      const blogsAtStart = await blogsApiHelper.blogsInDb();

      const blogToUpdate = blogsAtStart[0];
      const updatedBlog = {
        title: "update of a blog: succeeds with valid data and id",
        author: "John Doe",
        url: "http://localhost:3003/",
        likes: blogToUpdate.likes,
      };

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsApiHelper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
      const resultBlog = response.body;
      assert.deepStrictEqual(resultBlog, {
        ...updatedBlog,
        id: blogToUpdate.id,
      });
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
```

## Administración de usuarios

Creamos el fichero `models/users.js` en el que definimos tanto el esquema "userScheme" como el modelo de "User":

```
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  /* Establecemos la propiedad "username" como única para evitar la creación de cuentas de usuario con el mismo "username".
  Debemos controlar la excepción con nombre de error "MongoServerError" y mensaje de error "E11000 duplicate key error" en el middleware controlador de errores (`utils/middleware.js`).
   */
  username: { type: String, minLength: 3, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  // Como cada usuario puede tener múltiples blogs incluimos una lista de identificadores "ObjectId" que hacen referencia al modelo "Blog" de nuestra base de datos.
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // Como la propiedad "_id" es de tipo "ObjectId" debemos transformarlo a una cadena de texto.
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // Cuando un usuario es transformado a JSON ("json-parser" al responder solicitudes HTTP) no debemos incluir la propiedad "passwordHash".
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

Dentro de `utils/middleware.js` controlamos el error al incumplir la unicidad del nombre de usuario:

```
...
const errorHandler = (error, request, response, next) => {
  ...
  if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  )
    return response
      .status(400)
      .send({ error: "expected `username` to be unique" });
  ...
};
...
```

Dentro de `models/blogs.js` incluimos al propietario como propiedad del esquema:

```
...
const blogSchema = new mongoose.Schema({
  ...,
  // Como cada blog tiene un propietario incluimos al identificador "ObjectId" que hace referencia al modelo "User" de nuestra base de datos.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
...
```

Instalamos el paquete de "Bcrypt" (o "Bcryptjs) que usaremos para obtener el hash cifrado de la contraseña del usuario:
· `npm install bcrypt --save`

Creamos el controlador de rutas `controllers/users.js`:

```
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
```

Dentro de `app.js` implementamos el controlador de rutas `controllers/users.js`:

```
...
const usersRouter = require("./controllers/users");
...
app.use("/api/users", usersRouter);
...
```

Para ejecutar múltiples pruebas unitarias de manera secuencial ejecutamos:
· `npm test -- --test-concurrency=1`

Creamos el fichero `tests/users_api.test.js` para poner a prueba el controlador de rutas `controllers/users.js`:

```
const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/users");
const bcrypt = require("bcrypt");

const api = supertest(app);

const initialUsers = [
  {
    username: "root",
    name: "Superuser",
    password: "sekret",
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  // Mapeamos cada usuario de la lista para transformarlo a un formato JSON (añade o elimina las propiedades definidas en su esquema cuando usa el "json-parser")
  return users.map((user) => user.toJSON());
};

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    for (let { username, name, password } of initialUsers) {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ username, name, passwordHash });

      await user.save();
    }
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    assert(usernames.includes(newUser.username));
  });

  /* ¡IMPORTANTE!
  Cuando habilitemos la unicidad del nombre de usuario debemos tener en cuenta que si actualmente existen usuarios con el campo "username" duplicado, los próximos usuarios que creemos tendrán ese campo sin rellenar.
  */
  test("creation fails with proper statuscode and message if username is already taken", async () => {
    const usersAtStart = await usersInDb();

    const newUser = { username: "root", name: "Superuser", password: "sekret" };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("expected `username` to be unique"));

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
```

Dentro de `controllers/blogs.js` incluimos la funcionalidad para añadir tanto el identificador del propietario al crear un blog, como el identificador del blog a la lista de identificadores del usuario:

```
...
const User = require("../models/users");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  ...
});

blogsRouter.post("/", async (request, response, next) => {
  const body = request.body;

  try {
    // Buscamos en la base de datos aquel usuario en el que su identificador coincide con "userId".
    const user = await User.findById(body.userId);

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

    response.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});
...
```

### Autenticación basada en token

Instalamos el paquete de "Jsonwebtoken" que usaremos para autenticar a los usuarios:
· `npm install jsonwebtoken --save`

Creamos el controlador de rutas `controllers/login.js`:

```
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
```

Para crear un secreto podemos ejecutar este comando:
· `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Dentro de `.env` definimos la variable de entorno "SECRET":

```
...
SECRET=<secret>
```

Dentro de `utils/middleware.js` manejamos los posibles errores de JWT:

```
...
const errorHandler = (error, request, response, next) => {
  ...
  if (error.name === "JsonWebTokenError")
    return response.status(401).json({ error: "token invalid" });
  if (error.name === "TokenExpiredError")
    return response.status(401).json({ error: "token expired" });
  ...
};
...
```

Dentro de `app.js` definimos la ruta del controlador de rutas `controllers/login.js`:

```
...
const loginRouter = require("./controllers/login");
...
app.use("/api/login", loginRouter);
...
```

Dentro de `controllers/blogs.js` modificamos la ruta de creación para recuperar la información del usuario desde la cabecera "Authorization" de la solicitud HTTP POST:

```
...
const jwt = require("jsonwebtoken");
...
/* El método "getTokenFrom()" recupera de la solicitud HTTP la cabecera "Authorization" (quitando la cadena de texto "Bearer " para retornar solo el JWT).
 */
const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  // Si existe la cabecera "Authorization" comprobamos que el esquema de autenticación sea "Bearer" (debemos quitar la cadena de texto "Bearer " para retornar solo el token).
  if (authorization && authorization.startsWith("Bearer "))
    return authorization.replace("Bearer ", "");
  return null;
};

blogsRouter.post("/", async (request, response, next) => {
  ...
  try {
    // // Buscamos en la base de datos aquel usuario en el que su identificador coincide con "userId".
    // const user = await User.findById(body.userId);

    /* Decodificamos el token con el método "jwt.verify()" que 1º verifica que el token recibido como parámetro ha sido codificado con nuestro secreto.
    Después retorna el "payload" con los "claims" que identifican a la entidad.
    Si el token es inválido o nulo saltará la excepción "JsonWebTokenError".
    */
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    // Controlamos que el "payload" contiene el "claim" de "id".
    if (!decodedToken.id)
      return response.status(401).json({ error: "token invalid" });

    const user = await User.findById(decodedToken.id);
    ...
  } catch (error) {
    ...
  }
});
...
```

#### Middleware para incluir el token extraido en la solicitud HTTP

Dentro de `utils/middleware.js` definimos un middleware que añada el valor de la cabecera "Authorization" a la propiedad "request.token" de la solicitud HTTP:

```
...
const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer "))
    request.token = authorization.replace("Bearer ", "");

  next();
};

module.exports = {
  ...,
  tokenExtractor,
};
```

Dentro de `app.js` implementamos el middleware para extraer el token de la solicitud HTTP:

```
...
app.use(middleware.tokenExtractor);
...
```

Dentro de `controllers/blogs.js` no nos hace falta el método "getTokenFrom()" porque hemos implementado el middleware "tokenExtractor()" que añade a la solicitud HTTP la propiedad "request.token":

```
...
blogsRouter.post("/", async (request, response, next) => {
  ...
  try {
    ...
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    ...
  } catch (error) {
    ...
  }
});
...
```

#### Middleware para incluir el usuario decodificado en la solicitud HTTP

Dentro de `utils/middleware.js` definimos un middleware que añada el valor del "payload" decodificado a la propiedad "request.user" de la solicitud HTTP:

```
...
const jwt = require("jsonwebtoken");
...
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
  ...,
  userExtractor,
};
```

Dentro de `app.js` implementamos el middleware para incluir el "payload" a la solicitud HTTP:

```
...
/* Sólo implementamos el middleware "userExtractor()" a esta ruta específica.
Podemos implementar el middleware a una operación específica del controlador:
  const middleware = require("../utils/middleware");
  // ...
  router.post("/", middleware.userExtractor, async (request, response, next) => {
    // ...
  });
*/
app.use("/api/blogs", middleware.userExtractor, blogsRouter);
...
```

Dentro de `controllers/blogs.js` no nos hace falta decodificar el "payload" para obtener el usuario a partir del "id" porque hemos implementado el middleware "userExtractor()" que añade a la solicitud HTTP la propiedad "request.user":

```
...
blogsRouter.post("/", async (request, response, next) => {
  ...
  try {
    ...
    // const decodedToken = jwt.verify(request.token, process.env.SECRET);
    // // Controlamos que el "payload" contiene el "claim" de "id".
    // if (!decodedToken.id)
    //   return response.status(401).json({ error: "token invalid" });

    const decodedToken = request.user;
    ...
  } catch (error) {
    ...
  }
});
...
blogsRouter.delete("/:id", async (request, response, next) => {
  ...
  try {
    // const decodedToken = jwt.verify(request.token, process.env.SECRET);
    // if (!decodedToken.id)
    //   return response.status(401).json({ error: "token invalid" });

    const decodedToken = request.user;
    ...
  } catch (error) {
    ...
  }
});
...
```

## Implementación de la lista de comentarios en la publicación

Dentro del modelo `models/blogs.js`:

```
...
const blogSchema = new mongoose.Schema({
  ...,
  comments: [{ type: String }],
});
...
```

Dentro del controlador `controllers/blogs.js`:

```
...
blogsRouter.post("/:id/comments", async (request, response, next) => {
  const id = request.params.id;
  const { comment } = request.body;

  try {
    const blog = await Blog.findById(id);

    if (!blog) return response.status(404).end();

    blog.comments.push(comment);

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
...
```
