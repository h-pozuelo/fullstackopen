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

  test("creation fails with statuscode 400 if username is not provided", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with statuscode 400 if username doesn't match minimun length", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "ml",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with statuscode 400 if password is not provided", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with statuscode 400 if password doesn't match minimun length", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "sa",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
