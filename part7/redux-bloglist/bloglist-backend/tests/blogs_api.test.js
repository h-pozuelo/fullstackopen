const { test, describe, after, beforeEach, before } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blogs");
const blogsApiHelper = require("./blogs_api_helper");
const User = require("../models/users");
const bcrypt = require("bcrypt");

const api = supertest(app);

before(async () => {
  await User.deleteMany({});

  for (let { username, name, password } of blogsApiHelper.initialUsers) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, name, passwordHash });

    await user.save();
  }
});

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

    const user = await User.findOne({
      username: blogsApiHelper.initialUsers[0].username,
    });

    const initialBlogs = blogsApiHelper.initialBlogs.map((blog) => ({
      ...blog,
      user: user._id,
    }));

    await Blog.insertMany(initialBlogs);
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
      const { username, password } = blogsApiHelper.initialUsers[0];

      const token = (
        await api
          .post("/api/login")
          .send({ username, password })
          .expect(200)
          .expect("Content-Type", /application\/json/)
      ).body.token;

      const newBlog = {
        title: "addition of a new blog: succeeds with valid data",
        author: "John Doe",
        url: "http://localhost:3003/",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
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
      const { username, password } = blogsApiHelper.initialUsers[0];

      const token = (
        await api
          .post("/api/login")
          .send({ username, password })
          .expect(200)
          .expect("Content-Type", /application\/json/)
      ).body.token;

      const newBlog = {
        title:
          "addition of a new blog: succeeds with valid data without likes initializing it at 0",
        author: "John Doe",
        url: "http://localhost:3003/",
      };

      const response = await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
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
      const { username, password } = blogsApiHelper.initialUsers[0];

      const token = (
        await api
          .post("/api/login")
          .send({ username, password })
          .expect(200)
          .expect("Content-Type", /application\/json/)
      ).body.token;

      const newBlog = {
        author: "John Doe",
      };

      await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await blogsApiHelper.blogsInDb(); // Las funciones `async` del helper debemos ejecutarlas con `await`.

      assert.strictEqual(blogsAtEnd.length, blogsApiHelper.initialBlogs.length);
    });

    test("fails with status code 401 if token is not provided", async () => {
      const { username, password } = blogsApiHelper.initialUsers[0];

      const token = (
        await api
          .post("/api/login")
          .send({ username, password })
          .expect(200)
          .expect("Content-Type", /application\/json/)
      ).body.token;

      const newBlog = {
        author: "John Doe",
      };

      await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await blogsApiHelper.blogsInDb(); // Las funciones `async` del helper debemos ejecutarlas con `await`.

      assert.strictEqual(blogsAtEnd.length, blogsApiHelper.initialBlogs.length);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const newBlog = {
        title: "addition of a new blog: succeeds with valid data",
        author: "John Doe",
        url: "http://localhost:3003/",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(401)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsApiHelper.blogsInDb();
      const titles = blogsAtEnd.map((blog) => blog.title);

      assert.strictEqual(blogsAtEnd.length, blogsApiHelper.initialBlogs.length);
      assert(!titles.includes(newBlog.title));
    });
  });

  // describe("update of a blog", () => {
  //   test("succeeds with valid data and id", async () => {
  //     const blogsAtStart = await blogsApiHelper.blogsInDb();

  //     const blogToUpdate = blogsAtStart[0];
  //     const updatedBlog = {
  //       title: "update of a blog: succeeds with valid data and id",
  //       author: "John Doe",
  //       url: "http://localhost:3003/",
  //       likes: blogToUpdate.likes,
  //     };

  //     const response = await api
  //       .put(`/api/blogs/${blogToUpdate.id}`)
  //       .send(updatedBlog)
  //       .expect(200)
  //       .expect("Content-Type", /application\/json/);

  //     const blogsAtEnd = await blogsApiHelper.blogsInDb();
  //     assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
  //     const resultBlog = response.body;
  //     assert.deepStrictEqual(resultBlog, {
  //       ...updatedBlog,
  //       id: blogToUpdate.id,
  //     });
  //   });
  // });
});

after(async () => {
  await mongoose.connection.close();
});
