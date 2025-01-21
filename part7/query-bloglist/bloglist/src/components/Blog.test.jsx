import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";

describe("<Blog />", () => {
  // Previamente a la ejecución de cada test simulamos dentro del almacenamiento local las credenciales del usuario.
  beforeEach(() => {
    const user = { username: "test" };
    window.localStorage.setItem("loggedBloglistappUser", JSON.stringify(user));
  });

  test("at start the hidden content is not displayed", () => {
    // Construimos un objeto para pasar como prop al componente.
    const blog = {
      title: "example title",
      author: "example author",
      url: "example url",
      likes: 0,
      user: {
        username: "test",
      },
    };

    // Con la des-estructuración de objetos recuperamos de la renderización del componente la propiedad "container".
    const { container } = render(<Blog blog={blog} />);

    screen.debug(); // Imprimimos por consola aquello renderizado en el DOM simulado.

    /* Como el componente no renderiza la información del objeto en elementos HTML independientes, sino en un mismo párrafo, debemos pasar como 2º parámetro al método ".getByText()" un objeto especificando que la búsqueda no sea exacta al 100%.
     */
    expect(screen.getByText("title", { exact: false })).toBeDefined();
    expect(screen.getAllByText("author", { exact: false })[0]).toBeDefined();

    /* Para realizar este test he modificado el componente para que siempre se renderice el contenido pero sea ocultado mediante estilos CSS condicionales.
     */
    const hiddenContent = container.querySelector(".hidden");

    // Comprobamos tanto que el bloque contenedor contiene el texto que hace referencia a la información del objeto como que el bloque contenedor se encuentra oculto por defecto.
    expect(hiddenContent).toHaveTextContent("likes 0");
    expect(hiddenContent).toHaveTextContent("example url");
    expect(hiddenContent).toHaveStyle("display:none");
  });

  test("after clicking the button, hidden content is displayed", async () => {
    const blog = {
      title: "example title",
      author: "example author",
      url: "example url",
      likes: 0,
      user: {
        username: "test",
      },
    };

    // Iniciamos la sesión de eventos de usuario para poder interactuar con el componente renderizado en el DOM simulado.
    const user = userEvent.setup();

    const { container } = render(<Blog blog={blog} />);

    screen.debug(); // Contenido aun oculto.

    // Simulamos el evento "click" sobre el botón con texto "view" (el método ".click()" de "userEvent" es asíncrono, debemos esperar a que se produzca para continuar con el test).
    await user.click(screen.getByText("view"));

    screen.debug(); // Contenido visible.

    const hiddenContent = container.querySelector(".hidden");

    expect(hiddenContent).toHaveTextContent("example author");
    expect(hiddenContent).toHaveTextContent("likes 0");
    expect(hiddenContent).not.toHaveStyle("display:none"); // Comprobamos que el contenedor no se encuentra oculto.
  });

  test("double clicking the button calls event handler twice", async () => {
    const blog = {
      title: "example title",
      author: "example author",
      url: "example url",
      likes: 0,
      user: {
        username: "test",
      },
    };

    const user = userEvent.setup();
    const mockHandler = vi.fn(); // Construimos una función "mock" para controlar todos los eventos que ejecuten la función.

    const { container } = render(<Blog blog={blog} likeBlog={mockHandler} />);

    await user.dblClick(screen.getByText("like")); // Pulsamos dos veces sobre el botón (la sesión de eventos de usuario simula que se ha clicado dos veces sobre el botón).

    // Comprobamos que la función "mock" ha sido ejecutada dos veces.
    expect(mockHandler.mock.calls).toHaveLength(2);
  });
});
