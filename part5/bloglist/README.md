# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# bloglist

Creamos el directorio en donde va a residir la aplicación web:
· `mkdir bloglist`

Accedemos a la carpeta creada para construir la aplicación con "Vite":
· `cd bloglist/`
· `npm create vite@latest . -- --template react`
· `npm install`

Eliminamos los ficheros innecesarios de nuestra aplicación. También debemos reparar los componentes que dependían de dichos ficheros:
· `src/assets`
· `src/App.css`
· `src/index.css`

· `src/App.jsx`
· `src/main.jsx`

Dentro de `eslint.config.js` implementamos cláusulas personalizadas para no mostrar advertencias en determinados escenarios:

```
...
export default [
  ...,
  {
    ...,
    rules: {
      ...,
      "no-unused-vars": "off",
      "react/prop-types": "off",
    },
  },
];
```

## Configuración del proxy

Para habilitar un proxy en el entorno de desarrollo debemos definir dentro de `vite.config.js` la propiedad "server" que a su vez posee la propiedad "proxy". Dentro definimos la ruta "/api" para redirigir todas las solicitudes HTTP que el cliente realice desde "http://localhost:5173/api/\*\*" (frontend) a "http://localhost:3003/api/\*\*" (backend):

```
...
export default defineConfig({
  ...,
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
      },
    },
  },
});
```

(Esto solo funciona en el entorno de desarrollo. Cuando nos encontremos en producción usaremos en el servidor web "express.static('dist')" por lo que las solicitudes HTTP se realizarán desde el mismo puerto)

## Servicios

### Servicio de autenticación

Instalamos la librería "Axios" para realizar solicitudes HTTP a nuestro servidor web:
· `npm install axios --save`

Creamos el servicio `src/services/login.js` para autenticar al usuario:

```
import axios from "axios";
/* Dentro de `vite.config.js` hemos especificado que cualquier solicitud a una ruta que comience por "/api" va a ser re-enviada a "http://localhost:3003/api".
 */
const baseUrl = "/api/login";

/* El método "login()" recibe como parámetro el objeto "credentials" que consta de las propiedades: "{ username: String, password: String }".

La solicitud HTTP POST retorna un objeto almacenado en la propiedad "response.data" que consta de las propiedades: "{ username: String, name: String, token: String }".
 */
const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};

export default { login };
```

Dentro de `App.jsx` importamos el servicio de autenticación. Debemos declarar tanto los estados necesarios para almacenar las credenciales del usuario como el controlador de eventos para autenticarlo:

```
import React, { useState } from "react";
import loginService from "./services/login";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // "user === { username: String, name: String, token: String }".

  const handleLogin = async (event) => {
    // Detenemos la acción por defecto de envío del formulario.
    event.preventDefault();

    try {
      // Hasta que el usuario no sea autenticado la ejecución queda detenida.
      const user = await loginService.login({ username, password });
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <h1>log in to application</h1>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            name="Username"
            value={username}
            // Con la des-estructuración de objetos aislamos la propiedad necesaria.
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            name="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default App;
```

#### Persistencia de la autenticación con el almacenamiento local

Dentro de `src/App.jsx` almacenamos las credenciales de usuario dentro del almacenamiento local para que la sesión persista:

```
...
const App = () => {
  ...
  // Cada vez que el componente es renderizado se recupera del almacenamiento local el usuario autenticado.
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBloglistappUser");

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON); // Debemos transformar la cadena de texto a un objeto JavaScript.
      setUser(user);
    }
  }, []);

  const handleLogin = async (event) => {
    ...
    try {
      ...
      // Guardamos en el almacenamiento local el usuario autenticado.
      window.localStorage.setItem(
        "loggedBloglistappUser",
        // Debemos almacenarlo como una cadena de texto (no como un objeto JavaScript).
        JSON.stringify(user)
      );
      ...
    } catch (error) {
      ...
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBloglistappUser");

    setUser(null);
  };

  return (
    <div>
      {user === null ? (
        <>
          ...
        </>
      ) : (
        <>
          <p>
            {user.name} logged in <button onClick={handleLogout}>logout</button>
          </p>
        </>
      )}
    </div>
  );
};

export default App;
```

### Servicio de solicitudes HTTP

Creamos el servicio `src/services/blogs.js` en el que definimos todas las operaciones de API posibles:

```
import axios from "axios";
const baseUrl = "/api/blogs";

const getAllBlogs = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const getBlog = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`);
  return response.data;
};

const createBlog = async (newObject) => {
  const response = await axios.post(baseUrl, newObject);
  return response.data;
};

const updateBlog = async (id, newObject) => {
  const response = await axios.put(`${baseUrl}/${id}`, newObject);
  return response.data;
};

const deleteBlog = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`);
  return response.data;
};

export default { getAllBlogs, getBlog, createBlog, updateBlog, deleteBlog };
```

Dentro de `src/App.jsx` importamos el servicio de solicitudes HTTP. Tenemos tanto que recuperar los elementos de la base de datos al renderizar el componente como imprimir por pantalla la lista de elementos recuperados:

```
...
import blogService from "./services/blogs";

const App = () => {
  ...
  const [blogs, setBlogs] = useState([]);
  ...
  /* ¡IMPORTANTE!
  No podemos enviar como parámetro al hook "useEffect()" una función callback asíncrona.

  Para ejecutar un método asíncrono que devuelve una promesa podemos declarar una función asíncrona dentro de la función callback que ejecute lo necesario para recuperar los datos de la base de datos.
  */
  useEffect(() => {
    async function fetchData() {
      const blogs = await blogService.getAllBlogs();
      setBlogs(blogs);
    }

    try {
      fetchData();
    } catch (error) {
      console.error(error.message);
    }
  }, []);
  ...
  return (
    <div>
      {user === null ? (
        ...
      ) : (
        <>
          <h2>blogs</h2>
          <p>
            {user.name} logged in <button onClick={handleLogout}>logout</button>
          </p>
          {blogs.map((blog) => (
            <div key={blog.id}>
              {blog.title} {blog.author}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
...
```

#### Cabecera de autenticación en la solicitud HTTP

Dentro de `src/services/blogs.js` adjuntamos a las operaciones de API la cabecera "Authorize" con el valor del token que retornó el servidor web:

```
...
let token = null;

const setToken = (newToken) => (token = `Bearer ${newToken}`);
...
const createBlog = async (newObject) => {
  const response = await axios.post(baseUrl, newObject, {
    headers: { Authorization: token },
  });
  return response.data;
};

const updateBlog = async (id, newObject) => {
  const response = await axios.put(`${baseUrl}/${id}`, newObject, {
    headers: { Authorization: token },
  });
  return response.data;
};

const deleteBlog = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, {
    headers: { Authorization: token },
  });
  return response.data;
};

export default {
  ...,
  setToken,
};
```

Dentro de `src/App.jsx`:

```
...
const App = () => {
  ...
  // Cada vez que el componente es renderizado se recupera del almacenamiento local el usuario autenticado.
  useEffect(() => {
    ...
    if (loggedUserJSON) {
      ...
      blogService.setToken(user.token); // Cuando el componente se renderice adjunta al servicio de solicitudes HTTP el token del usuario.
    }
  }, []);
  ...
  const handleLogin = async (event) => {
    ...
    try {
      ...
      // Guardamos en el servicio de solicitudes HTTP el token del usuario.
      blogService.setToken(user.token);
      ...
    } catch (error) {
      ...
    }
  };

  const handleLogout = () => {
    ...
    // Eliminamos del servicio de solicitudes HTTP el token del usuario.
    blogService.setToken("");
    ...
  };
  ...
};
...
```

#### Formulario para añadir elementos a la base de datos

Dentro de `src/App.jsx`:

```
...
const App = () => {
  ...
  const [newBlog, setNewBlog] = useState({ title: "", url: "" });
  ...
  const addBlog = async (event) => {
    event.preventDefault();

    try {
      const returnedBlog = await blogService.createBlog(newBlog);
      setBlogs((prev) => prev.concat(returnedBlog));
      setNewBlog({ title: "", url: "" });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      {user === null ? (
        ...
      ) : (
        <>
          ...
          <form onSubmit={addBlog}>
            <div>
              title
              <input
                type="text"
                name="Title"
                value={newBlog.title}
                onChange={({ target }) =>
                  setNewBlog({ ...newBlog, title: target.value })
                }
              />
            </div>
            <div>
              url
              <input
                type="text"
                name="Url"
                value={newBlog.url}
                onChange={({ target }) =>
                  setNewBlog({ ...newBlog, url: target.value })
                }
              />
            </div>
            <button type="submit">create</button>
          </form>
          ...
        </>
      )}
    </div>
  );
};
...
```

## Componentes

### Componente de notificaciones

Creamos el componente `src/components/Notification.jsx`:

```
import React from "react";

const Notification = ({ message }) => {
  if (message) return <div>{message}</div>;
};

export default Notification;
```

Dentro de `src/App.jsx`:

```
...
import Notification from "./components/Notification";

const App = () => {
  ...
  const [message, setMessage] = useState(null);
  ...
  useEffect(() => {
    ...
    try {
      ...
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(null), 5000);
    }
  }, []);

  const handleLogin = async (event) => {
    ...
    try {
      ...
    } catch ({ response }) {
      setMessage(response.data.error);
      setTimeout(() => setMessage(null), 5000);
    }
  };
  ...
  const addBlog = async (event) => {
    ...
    try {
      ...
      setMessage(
        `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`
      );
      setTimeout(() => setMessage(null), 5000);
    } catch ({ response }) {
      setMessage(response.data.error);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div>
      <Notification message={message} />
      ...
    </div>
  );
};
...
```

### Componente de formulario para autenticación

Creamos el componente `src/components/LoginForm.jsx`:

```
import React from "react";

const LoginForm = ({
  onSubmit,
  username,
  handleUsernameChange,
  password,
  handlePasswordChange,
}) => {
  return (
    <>
      <h1>log in to application</h1>
      <form onSubmit={onSubmit}>
        <div>
          username
          <input
            type="text"
            name="Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          password
          <input
            type="password"
            name="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </>
  );
};

export default LoginForm;
```

Dentro de `src/App.jsx`:

```
...
import LoginForm from "./components/LoginForm";

const App = () => {
  ...
  return (
    <div>
      ...
      {user === null ? (
        <>
          {/* Con la des-estructuración de objetos aislamos la propiedad necesaria. */}
          <LoginForm
            onSubmit={handleLogin}
            username={username}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            password={password}
            handlePasswordChange={({ target }) => setPassword(target.value)}
          />
        </>
      ) : (
        ...
      )}
    </div>
  );
};
...
```

### Componente de formulario para creación

Creamos el componente `src/components/BlogForm.jsx`:

```
import React, { useState } from "react";

/* Desde ahora los estados/controladores de eventos necesarios para la creación son declarados en el propio componente (no en `src/App.jsx`).
La función callback recibida como prop es la que añade el elemento a la base de datos.
 */
const BlogForm = ({ addBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: "", url: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();

    await addBlog(newBlog); // Enviamos el elemento al componente padre para añadirlo a la base de datos.
    setNewBlog({ title: "", url: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        title
        <input
          type="text"
          name="Title"
          value={newBlog.title}
          onChange={({ target }) =>
            setNewBlog({ ...newBlog, title: target.value })
          }
        />
      </div>
      <div>
        url
        <input
          type="text"
          name="Url"
          value={newBlog.url}
          onChange={({ target }) =>
            setNewBlog({ ...newBlog, url: target.value })
          }
        />
      </div>
      <button type="submit">create</button>
    </form>
  );
};

export default BlogForm;
```

Dentro de `src/App.jsx`:

```
...
import BlogForm from "./components/BlogForm";

const App = () => {
  ...
  // const [newBlog, setNewBlog] = useState({ title: "", url: "" });
  ...
  const addBlog = async (newBlog) => {
    // event.preventDefault();

    try {
      ...
      // setNewBlog({ title: "", url: "" });
      ...
    } catch ({ response }) {
      ...
    }
  };

  return (
    <div>
      ...
      {user === null ? (
        <>
          ...
        </>
      ) : (
        <>
          ...
          <BlogForm addBlog={addBlog} />
          ...
      )}
    </div>
  );
};
...
```

### Componente para mostrar u ocultar

Creamos el componente `src/components/Togglable.jsx`:

```
import React, { useState } from "react";

/* El parámetro "children" recibido a través de las props corresponde a aquellos elementos que se encuentran entre las etiquetas de apretura/cierre de este componente.
 */
const Togglable = ({ buttonLabel, children }) => {
  const [visible, setVisible] = useState(false);

  // Definimos estilos para mostrar u ocultar los elementos de manera condicional.
  const hideWhenVisible = { display: visible ? "none" : "" };
  const showWhenVisible = { display: visible ? "" : "none" };

  const toggleVisibility = () => setVisible(!visible);

  return (
    <>
      <div style={hideWhenVisible}>
        <button type="button" onClick={toggleVisibility}>
          {buttonLabel}
        </button>
      </div>
      <div style={showWhenVisible}>
        {children}
        <button type="button" onClick={toggleVisibility}>
          close
        </button>
      </div>
    </>
  );
};

export default Togglable;
```

Dentro de `src/App.jsx`:

```
...
import Togglable from "./components/Togglable";

const App = () => {
  ...
  return (
    <div>
      ...
      {user === null ? (
        <>
          <Togglable buttonLabel="log in">
            {/* Con la des-estructuración de objetos aislamos la propiedad necesaria. */}
            <LoginForm
              onSubmit={handleLogin}
              username={username}
              handleUsernameChange={({ target }) => setUsername(target.value)}
              password={password}
              handlePasswordChange={({ target }) => setPassword(target.value)}
            />
          </Togglable>
        </>
      ) : (
        <>
          ...
          <Togglable buttonLabel="new blog">
            <BlogForm addBlog={addBlog} />
          </Togglable>
          ...
        </>
      )}
    </div>
  );
};
...
```

#### Manipulando el componente mediante referencias

Dentro de `src/App.jsx`:

```
import React, { useEffect, useRef, useState } from "react";
...
const App = () => {
  ...
  const blogFormRef = useRef(); // Creamos un referenciador mediante el hook "useRef()".
  ...
  const addBlog = async (newBlog) => {
    ...
    try {
      ...
      blogFormRef.current.toggleVisibility(); // Ocultamos el formulario de creación mediante la referencia.
    } catch ({ response }) {
      ...
    }
  };

  return (
    <div>
      ...
      {user === null ? (
        <>
          ...
        </>
      ) : (
        <>
          ...
          {/* Con el atributo "ref" podemos hacer que la variable "blogFormRef" esté haciendo referencia al componente "<Togglable />".
          Posteriormente podremos acceder a los estados/controladores de eventos del componente definidos dentro del hook "useImperativeHandle()".
           */}
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            ...
          </Togglable>
          ...
        </>
      )}
    </div>
  );
};
...
```

Dentro de `src/components/Togglable.jsx`:

```
import React, { forwardRef, useImperativeHandle, useState } from "react";

/* ...
Para poder exponer estados/controladores de eventos debemos encapsular al componente con "forwardRef()". La función callback del componente ahora recibe además de las props una matriz de referencias a dicho componente.
 */
const Togglable = forwardRef(({ buttonLabel, children }, refs) => {
  ...
  /* El hook "useImperativeHandle()" recibe como parámetros:
    - La matriz de referencias a dicho componente.
    - Una función callback que retorna un objeto en el que cada una de sus propiedades corresponde a un estado/controlador de eventos que queremos exponer.
  */
  useImperativeHandle(refs, () => ({ toggleVisibility }));
  ...
});
...
```

## Tipado de props en los componentes

Instalamos la librería "Prop-types" para poder definir los tipos de props que reciben los componentes:
· `npm install prop-types --save`

Dentro de `src/components/Togglable.jsx`:

```
...
import PropTypes from "prop-types";
...
/* Definimos en la propiedad "Togglable.propTypes" un objeto en el que cada una de sus propiedades corresponde a cada prop recibida.
 */
Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired, // La prop "buttonLabel" es una cadena de texto requerida.
};
...
```

## Pruebas unitarias con Vitest

Para poder realizar tests unitarios en nuestros componentes debemos instalar estas librerías:

- "Vitest": Entorno que nos permite ejecutar los tests.
  · `npm install vitest --save-dev`
- "Jsdom": Simula el DOM en donde se va a renderizar los componentes.
  · `npm install jsdom --save-dev`
- "@testing-library/react" "@testling-library/jest-dom": Librerías que nos permiten renderizar componentes React en el DOM simulado.
  · `npm install @testing-library/react --save-dev`
  · `npm install @testing-library/jest-dom --save-dev`
- "@testing-library/user-event": Permite simular eventos en elementos HTML.
  · `npm install @testing-library/user-event --save-dev`

Creamos el fichero `testSetup.js` en la raíz de la aplicación en donde definimos una plantilla inicial que implementarán todas las pruebas unitarias que creemos:

```
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Después de cada test realizado se va a limpiar el DOM simulado.
afterEach(() => {
  cleanup();
});
```

Dentro de `vite.config.js` definimos la configuración para los tests unitarios:

```
...
export default defineConfig({
  ...,
  test: {
    environment: "jsdom",
    globals: true, // Parámetro que nos permitirá llamar a métodos como "describe" o "test" sin necesidad de importarlos.
    setupFiles: "./testSetup.js",
  },
});
```

Dentro de `package.json` definimos el comando para ejecutar los tests:

```
{
  ...,
  "scripts": {
    ...,
    "test": "vitest run"
  },
  ...
}
```

### Probando el componente App

Creamos el fichero `src/Blog.test.jsx`:

```
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
```

Creamos el fichero `src/BlogForm.test.jsx`:

```
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
```

### Visualizar el alcance de nuestras pruebas unitarias

Instalamos el paquete "@vitest/coverage-v8":
· `npm install @vitest/coverage-v8 --save-dev`

Dentro de `package.json`:

```
{
  ...,
  "scripts": {
    ...,
    "coverage": "vitest run --coverage"
  },
  ...
}
```

Dentro de `vite.config.js`:

```
...
export default defineConfig({
  ...,
  test: {
    ...,
    coverage: {
      provider: "v8",
    },
  },
});
```

### Vitest + ESLint

Para evitar que ESLint resalte líneas en los tests unitarios instalamos el paquete "eslint-plugin-vitest-globals":
· `npm install eslint-plugin-vitest-globals --save-dev`

Dentro de `eslint.config.js`:

```
...
import vitestGlobals from "eslint-plugin-vitest-globals";

export default [
  ...,
  {
    ...,
    languageOptions: {
      ...,
      globals: {
        ...globals.browser,
        ...vitestGlobals.environments.env.globals,
      },
      ...
    },
    ...,
    plugins: {
      ...,
      "vitest-globals": vitestGlobals,
    },
    ...
  },
];
```
