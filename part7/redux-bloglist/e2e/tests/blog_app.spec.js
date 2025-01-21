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
