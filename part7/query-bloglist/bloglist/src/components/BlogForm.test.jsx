import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogForm from "./BlogForm";
import { expect } from "vitest";

describe("<BlogForm />", () => {
  test("updates parent state and calls onSubmit", async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();

    // Pasamos la función "mock" como prop al componente para posteriormente comprobar los parámetros enviados a la función desde el formulario.
    const { container } = render(<BlogForm addBlog={mockHandler} />);

    /* En vez de recuperar las cajas de texto con ".getByRole()" o ".getByPlaceholderText()" utilizamos ".getByTestId()" (es necesario añadir el atributo "data-testid" en el HTML).

    Con el evento "type" podemos rellenar las cajas de texto.
     */
    await user.type(screen.getByTestId("title"), "example title");
    await user.type(screen.getByTestId("url"), "example url");

    await user.click(screen.getByText("create"));

    console.log(mockHandler.mock.calls); // "[ [ { title: '', url: '' } ], [ { title: '', author: '' } ], ... ]"
    expect(mockHandler.mock.calls).toHaveLength(1);
    expect(mockHandler.mock.calls[0][0]).toStrictEqual({
      title: "example title",
      url: "example url",
    });
  });
});
