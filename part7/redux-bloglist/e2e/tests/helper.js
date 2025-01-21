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
