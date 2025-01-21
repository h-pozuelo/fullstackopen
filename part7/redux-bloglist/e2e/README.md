# e2e

Creamos el directorio en donde van a residir nuestras pruebas de extremo a extremo:
· `mkdir e2e`
· `cd .\e2e\`

Iniciamos un proyecto de "Node.js" a partir de la plantilla que proporciona "Playwright":
· `npm init playwright@latest`

Dentro de `package.json` definimos los scripts para arrancar los tests:
· `playwright test` : Inicia los tests normalmente.
· `playwright show-report` : Muestra un informe de los últimos tests realizados.

```
{
  ...,
  "scripts": {
    "test": "playwright run",
    "test:report": "playwright show-report"
  },
  ...
}
```

Otros comandos al momento de iniciar los tests son:
· `npm test -- --ui` : Inicia los tests en modo GUI.
· `npm test -- --project "motor web"` : Sólo realiza los tests con un motor web específico.
· `npm test -- --g "nombre del test"` : Sólo realiza el test con ese nombre.
· `npm test -- --debug` : Inicia los tests en modo depuración (con `await page.pause()` detenemos la compilación en una zona específica).
· `npm test -- --trace on` : Dentro del informe almacena una snapshot con cada acción desencadenada.

## Configurando Playwright

Dentro de `playwright.config.js`:
· `timeout` : Tiempo que debe esperar cuando un test falla antes de continuar al próximo test.
· `fullyParallel: false` : Cuando es `false` ejecuta los tests de manera secuencial.
· `use: { baseURL: "..." }` : URL base que se usará al ejecutar `await page.goto()`.

```
...
module.exports = defineConfig({
  ...,
  timeout: 3000,
  fullyParallel: false,
  ...
  use: {
    baseURL: "http://localhost:5173",
    ...
  },
  ...
});
```

## Configurando el back-end para las pruebas e2e

Dentro de `package.json` definimos un script para arrancar el servidor web con la variable de entorno `NODE_ENV` iniciada a `test` (de esta manera realizaremos los tests e2e sobre la base de datos de desarrollo):

```
{
  ...,
  "scripts": {
    ...,
    "start:test": "cross-env NODE_ENV=test nodemon index.js"
  },
  ...
}
```

Creamos el controlador de rutas `controllers/testing.js`:

```
const testingRouter = require("express").Router();
const Blog = require("../models/blogs");
const User = require("../models/users");

testingRouter.post("/reset", async (request, response) => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  response.status(204).end();
});

module.exports = testingRouter;
```

Dentro de `app.js` importamos la ruta del controlador:

```
...
if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}
...
```

## Creando las pruebas e2e

Creamos el fichero `tests/helper.js`:

```
const loginWith = async (page, { username, password }) => {
  await page.getByRole("button", { name: "log in" }).click();
  /* Como existen múltiples cajas de texto tenemos diferentes maneras de recuperarlas:
    - `.getByTestId()` : Para ello necesitamos añadir el atributo "data-testid".
    - `.getByRole("textbox")` :
        - `.all()` : Devuelve una lista de elementos (la recorremos con corchetes).
        - `.first()` : Devuelve el primer elemento encontrado.
        - `.last()` : Devuelve el último elemento encontrado.
    - `.locator("div").getByText().getByRole("textbox")` : Primero filtramos todos los elementos HTML de tipo contenedor; recuperamos aquel contenedor en el que se encuentra el texto; dentro del contenedor filtrado recuperamos la única caja de texto.
  */
  console.log(username, password);
  await page
    .locator("div")
    .getByText("username")
    .getByRole("textbox")
    .fill(username);
  await page
    .locator("div")
    .getByText("password")
    .getByRole("textbox")
    .fill(password);
  await page.getByRole("button", { name: "login" }).click();
};

const createBlog = async (page, { title, url }) => {
  await page.getByRole("button", { name: "new blog" }).click();
  await page.locator("div").getByText("title").getByRole("textbox").fill(title);
  await page.locator("div").getByText("url").getByRole("textbox").fill(url);
  await page.getByRole("button", { name: "create" }).click();
};

const likeBlog = async (page, title) => {
  await page
    .locator("div")
    .getByText(title)
    .getByRole("button", { name: "view" })
    .click();
  await page
    .locator("div")
    .getByText(title)
    .locator("..")
    .getByRole("button", { name: "like" })
    .click();
};

const deleteBlog = async (page, title) => {
  await page
    .locator("div")
    .getByText(title)
    .getByRole("button", { name: "view" })
    .click();
  // Para poder aceptar el modal de confimación debemos definir un controlador de eventos antes de la operación que dispara el evento.
  page.on("dialog", async (dialog) => await dialog.accept());
  await page
    .locator("div")
    .getByText(title)
    .locator("..")
    .getByRole("button", { name: "remove" })
    .click();
};

module.exports = { loginWith, createBlog, likeBlog, deleteBlog };
```

Creamos el fichero `tests/blog_app.spec.js`:

```
const { test, expect } = require("@playwright/test");
const { loginWith, createBlog, likeBlog, deleteBlog } = require("./helper");

test.describe("Blog app", () => {
  /* Antes de cada test accedemos a la URL enviada como parámetro.
  Como hemos definido `baseUrl: "http://localhost:5173"` dentro del fichero `playwright.config.js` solo necesitamos pasar como parámetro "/".

  Como también queremos realizar solicitudes HTTP al servidor web debemos añadir al parámetro des-estructurado la propiedad "request".
   */
  test.beforeEach(async ({ page, request }) => {
    // Limpiamos la base de datos de desarrollo.
    await request.post("/api/testing/reset");
    // Creamos un usuario base para los tests e2e.
    await request.post("/api/users", {
      data: {
        name: "Matti Luukkainen",
        username: "mluukkai",
        password: "salainen",
      },
    });

    await page.goto("/");
  });

  test("Login form is shown", async ({ page }) => {
    /* Con el método `.getByRole()` recuperamos un botón que contiene el texto "log in".
    El filtro de búsqueda es "case-insensitive"; busca por cadenas de texto que contienen el valor especificado (substring).
     */
    await page.getByRole("button", { name: "log in" }).click();
    await expect(page.getByText("log in to application")).toBeVisible();
  });

  test.describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, { username: "mluukkai", password: "salainen" });
      await expect(page.getByText("Matti Luukkainen logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, { username: "mluukkai", password: "wrong" });
      await expect(
        page.getByText("invalid username or password")
      ).toBeVisible();
    });
  });

  test.describe("When logged in", () => {
    // Para pasar los tests a continuación debemos haber iniciado sesión con el usuario.
    test.beforeEach(async ({ page }) => {
      await loginWith(page, { username: "mluukkai", password: "salainen" });
    });

    test("a new blog can be created", async ({ page }) => {
      await createBlog(page, {
        title: "a blog created by playwright",
        url: "http://localhost:5173",
      });
      // Cuando se crea un nuevo elemento hemos hecho que se concatene el título con el nombre del autor.
      await expect(
        page.getByText("a blog created by playwright Matti Luukkainen")
      ).toBeVisible();
    });

    test.describe("and a blog exists", () => {
      test.beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: "another blog created by playwright",
          url: "http://localhost:5173",
        });
      });

      test("likes can be increased", async ({ page }) => {
        await likeBlog(
          page,
          "another blog created by playwright Matti Luukkainen"
        );
        await expect(page.getByText("likes 1")).toBeVisible();
      });

      test("owner can delete it", async ({ page }) => {
        await deleteBlog(
          page,
          "another blog created by playwright Matti Luukkainen"
        );
        await expect(page.getByText("blog deleted successfully")).toBeVisible();
        await expect(
          page.getByText("another blog created by playwright Matti Luukkainen")
        ).not.toBeVisible();
      });

      test("user can't delete it", async ({ page, request }) => {
        await request.post("/api/users", {
          data: { name: "Superuser", username: "root", password: "salainen" },
        });
        await page.getByRole("button", { name: "logout" }).click();
        await loginWith(page, { username: "root", password: "salainen" });
        await page.getByRole("button", { name: "view" }).click();
        await expect(
          page.getByRole("button", { name: "remove" })
        ).not.toBeVisible();
      });
    });

    test.describe("and multiple blogs exists", () => {
      test.beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: "first blog",
          url: "http://localhost:5173",
        });
        await createBlog(page, {
          title: "second blog",
          url: "http://localhost:5173",
        });
        await createBlog(page, {
          title: "third blog",
          url: "http://localhost:5173",
        });
      });

      test("blogs are ordered by likes", async ({ page }) => {
        await likeBlog(page, "first blog");
        await likeBlog(page, "second blog");
        await page
          .locator("div")
          .getByText("second blog")
          .getByRole("button", { name: "hide" })
          .click();
        await likeBlog(page, "second blog");

        const containers = await page
          .locator("div")
          .filter({
            has: page.locator(":scope > div", {
              hasText: /(first|second) blog Matti Luukkainen/,
            }),
            has: page.locator(":scope > button", { hasText: /view|hide/ }),
          })
          .all();

        await expect(containers[0]).toContainText("second blog");
        await expect(containers[1]).toContainText("first blog");
        await expect(containers[2]).toContainText("third blog");
      });
    });
  });
});
```
