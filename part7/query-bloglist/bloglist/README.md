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

## React Context

### Creando el contexto

Creamos el fichero `src/contexts/NotificationContext.jsx`:

```
import React, { createContext } from "react";

// Con el método "createContext()" construimos un contexto.
const NotificationContext = createContext();

// Creamos un componente personalizado (para proveer el contexto) que recibe como prop "children" (son el contenido que se encuentra en el interior de las etiquetas "<NotificationContextProvider>[...]</NotificationContextProvider>").
export const NotificationContextProvider = ({ children }) => {
  // Para acceder al proveedor del contexto creado renderizamos su propiedad ".Provider".
  return (
    <NotificationContext.Provider>{children}</NotificationContext.Provider>
  );
};

export default NotificationContext;
```

Dentro del fichero `src/main.jsx`:

```
...
import { NotificationContextProvider } from "./contexts/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <NotificationContextProvider>
    {/* <App /> === children */}
    <App />
  </NotificationContextProvider>
);
```

### useReducer hook : Función reducer personalizada para establecer mensajes de notificación

Creamos el reducer `src/reducers/notificationReducer.js` en donde definimos una función reducer personalizada que consumiremos posteriormente con el hook `useReducer()`:

```
/* Definimos una función reducer personalizada tal como lo haríamos en "Redux".
Debemos cumplir con lo de que sean funciones puras que no muten/modifiquen el estado recibido como parámetro sino que retornen un nuevo estado.
 */
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATION": {
      const message = action.payload;
      return message;
    }
    case "CLEAN_NOTIFICATION":
      return "";
    default:
      return state;
  }
};

export const setNotification = (message) => ({
  type: "SET_NOTIFICATION",
  payload: message,
});

export const cleanNotification = () => ({ type: "CLEAN_NOTIFICATION" });

export const setAndCleanNotification = ({ message, duration }, dispatch) => {
  dispatch(setNotification(message));
  setTimeout(() => {
    dispatch(cleanNotification());
  }, Number(duration * 1000));
};

export default notificationReducer;
```

Dentro del contexto `src/contexts/NotificationContext.jsx` consumimos el reducer para proveerlo como contexto:

```
import React, { createContext, useReducer } from "react";
import notificationReducer from "../reducers/notificationReducer";
...
export const NotificationContextProvider = ({ children }) => {
  /* El hook "useReducer()" recibe como parámetros la función reducer personalizada además de un valor de estado inicial.
  Des-estructuramos el valor retornado tal como lo haríamos al utilizar el hook "useState()".
   */
  const [notification, notificationDispatch] = useReducer(notificationReducer, "");

  // Para acceder al proveedor del contexto creado renderizamos su propiedad ".Provider".
  return (
    <>
      {/* Para proveer el contexto utilizamos el atributo "value" (proveeremos la lista). */}
      <NotificationContext.Provider
        value={[notification, notificationDispatch]}
      >
        ...
      </NotificationContext.Provider>
    </>
  );
};
...
```

### Creando hooks personalizados para consumir el contexto

Dentro del contexto `src/contexts/NotificationContext.jsx` creamos dos funciones para facilitar la consumición de datos específicos del contexto:

```
import React, { createContext, useContext, useReducer } from "react";
...
export const useNotificationValue = () => {
  const notificationAndDispatch = useContext(NotificationContext);
  return notificationAndDispatch[0]; // El 1º elemento del contexto corresponde al valor del estado.
};

export const useNotificationDispatch = () => {
  const notificationAndDispatch = useContext(NotificationContext);
  return notificationAndDispatch[1]; // El 2º elemento del contexto corresponde a la función "dispatch()" para realizar operaciones con el reducer.
};
...
```

### Creando el componente para notificaciones

Dentro del componente `src/components/Notification.jsx`:

```
...
import { useNotificationValue } from "../contexts/NotificationContext";

const Notification = () => {
  // Consumimos el contexto mediante el hook personalizado "useNotificationValue()" (retorna el valor del estado recuperado de la consumición del contexto con el hook "useContext(NotificationContext)").
  const message = useNotificationValue();
  ...
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import { useNotificationDispatch } from "./contexts/NotificationContext";
import { setAndCleanNotification } from "./reducers/notificationReducer";

const App = () => {
  ...
  // const [message, setMessage] = useState(null);
  ...
  // Con el hook personalizado "useNotificationDispatch()" recuperación la función dispatch para realizar operaciones con el reducer (debemos enviar como parámetro un objeto "action = { type, payload }").
  const dispatch = useNotificationDispatch();
  ...
  const handleLogin = async (event) => {
    ...
    try {
      ...
    } catch ({ response }) {
      ...
      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };
  ...
  const addBlog = async (newBlog) => {
    ...
    try {
      ...
      setAndCleanNotification(
        {
          message: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
          duration: 5,
        },
        dispatch
      );
      ...
    } catch ({ response }) {
      ...
      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };

  const likeBlog = async (updatedBlog) => {
    try {
      ...
    } catch ({ response }) {
      ...
      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };
  ...
  const deleteBlog = async (id) => {
    try {
      ...
      setAndCleanNotification(
        { message: `blog deleted successfully`, duration: 5 },
        dispatch
      );
    } catch ({ response }) {
      ...
      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };

  return (
    <div>
      <Notification />
      ...
    </div>
  );
};
...
```

## React Query

Instalamos la librería `@tanstack/react-query` para poder manejar estados del servidor web en el cliente:

· `npm install @tanstack/react-query --save`

Creamos el fichero `src/client.js` en donde definiremos un cliente de consultas (`QueryClient`) que proveeremos en toda la aplicación con el componente `<QueryClientProvider>`:

```
import { QueryClient, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default queryClient;
```

Dentro del fichero `src/main.jsx`:

```
...
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./client.js";
...
createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <NotificationContextProvider>
      {/* <App /> === children */}
      <App />
    </NotificationContextProvider>
  </QueryClientProvider>
);
```

(Con `Redux` utilizábamos la librería `react-redux` para contener la aplicación en un proveedor de almacenes de estados. Lo anterior es parecido)

#### useQuery hook : Almacenando la lista de publicaciones en caché

Dentro del fichero `src/client.js`:

```
import { QueryClient, useQuery } from "@tanstack/react-query";
import blogService from "./services/blogs";
...
// Construimos un hook personalizado para recuperar el resultado de la consulta a la clave "['blogs']".
export const useResult = () => {
  /* El hook "useQuery()" recibe como parámetro un objeto con las propiedades:
        - "queryKey" : Clave que identifica a la consulta. Para definir la clave la rodeamos por corchetes ([]).
        - "queryFn" : Función callback que se va a ejecutar. La información devuelta por la función callback es almacenada en la propiedad ".data" del objeto retornado por el hook "useQuery()".

    El hook "useQuery()" devuelve un objeto con propiedades como ".status", ".isLoading", ".data", ... (es como una promesa)
    */
  const result = useQuery({
    queryKey: ["blogs"],
    queryFn: blogService.getAllBlogs,
  });
  return result;
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import { useResult } from "./client";

const App = () => {
  ...
  // const [blogs, setBlogs] = useState([]);
  ...
  const result = useResult();
  ...
  // useEffect(() => {
  //   async function fetchData() {
  //     const blogs = await blogService.getAllBlogs();
  //     setBlogs(blogs);
  //   }

  //   try {
  //     fetchData();
  //   } catch (error) {
  //     setMessage(error.message);
  //     setTimeout(() => setMessage(null), 5000);
  //   }
  // }, []);
  ...
  // Para que la aplicación no falle debemos controlar si las publicaciones han sido recuperadas.
  if (result.isLoading) return <div>loading blogs...</div>;

  const blogs = result.data; // La consulta "result" tiene en la propiedad ".data" la lista de publicaciones recuperadas del servidor web.
  ...
};
...
```

#### useMutation hook : Creación de nuevas publicaciones

Dentro del fichero `src/client.js`:

```
...
/* Para realizar operaciones como CREATE, UPDATE o DELETE debemos utilizar el hook "useMutation()". El hook recibe como parámetro un objeto con las propiedades:
    - "mutationFn" : Función callback que va a poder ser ejecutada mediante el método ".mutate()" que posee el objeto retornado al crear el "mutator" (createBlogMutation.mutate()).
    - "onSuccess" : Función callback que se ejecuta cuando se completa con éxito la operación. Podemos especificar que reciba un parámetro que será el valor retornado por la función callback "mutationFn".

Para poder ejecutar la operación llamamos al método "newBlogMutation.mutate()" pasándole como parámetro el objeto que esperaría la función "blogService.createBlog()".
*/
export const useNewBlogMutation = () => {
  const newBlogMutation = useMutation({
    mutationFn: blogService.createBlog,
    /* La función callback "onSuccess" puede recibir como parámetros:
        - "data" : Resultado retornado al ejecutar "blogService.createBlog()".
        - "variables" : Parámetros que recibe el método "newBlogMutation.mutate()" (corresponde con los parámetros que espera recibir la función "blogService.createBlog()").
        - "context" : Utilizando la propiedad "onMutate: (variables) => { ... }" podemos definir una función callback que retorne un valor (context).

    Si hubiesemos declarado el "mutation" fuera del fichero `src/client.js`...
    Con el hook "useQueryClient()" recuperamos el cliente pasado como contexto por el proveedor `<QueryClientProvider>` en el fichero `src/main.jsx`.
    De esta manera podremos manipular los valores de cada clave (ej. ["blogs"]).
    */
    onSuccess: (data, variables, context) => {
      // Recuperamos del cliente el valor de la clave ["blogs"].
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      // Re-definimos el valor de la clave ["blogs"] concatenando la nueva publicación.
      queryClient.setQueryData(["blogs"], currentBlogs.concat(data));
    },
  });
  return newBlogMutation;
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import { useNewBlogMutation, useResult } from "./client";

const App = () => {
  ...
  const newBlogMutation = useNewBlogMutation();
  ...
  const addBlog = async (newBlog) => {
    ...
    try {
      ...
      // Como se trata de una operación asíncrona utilizamos el método ".mutateAsync()".
      const returnedBlog = await newBlogMutation.mutateAsync(newBlog);
      ...
    } catch ({ response }) {
      ...
    }
  };
  ...
};
...
```

#### useMutation hook : Votación de publicaciones

Dentro del fichero `src/client.js`:

```
...
export const useUpdateBlogMutation = () => {
  const updateBlogMutation = useMutation({
    /* El método ".mutate()" sólo espera recibir un parámetro. Para poder actualizar publicaciones debemos pasar como parámetros tanto el identificador como la publicación.
    Podemos solucionar esto definiendo una función callback que reciba como parámetro un objeto.
    */
    mutationFn: ({ id, updatedBlog }) =>
      blogService.updateBlog(id, updatedBlog),
    onSuccess: (data, variables, context) => {
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(
        ["blogs"],
        currentBlogs.map((blog) => (blog.id !== data.id ? blog : data))
      );
    },
  });
  return updateBlogMutation;
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import { useNewBlogMutation, useResult, useUpdateBlogMutation } from "./client";

const App = () => {
  ...
  const updateBlogMutation = useUpdateBlogMutation();
  ...
  const likeBlog = async (updatedBlog) => {
    try {
      ...
      await updateBlogMutation.mutateAsync({ id: updatedBlog.id, updatedBlog });
    } catch ({ response }) {
      ...
    }
  };
  ...
};
...
```

#### useMutation hook : Eliminación de publicaciones

Dentro del fichero `src/client.js`:

```
...
export const useDeleteBlogMutation = () => {
  const deleteBlogMutation = useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: (data, variables, context) => {
      const id = variables;
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(
        ["blogs"],
        currentBlogs.filter((blog) => blog.id !== id)
      );
    },
  });
  return deleteBlogMutation;
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import {
  useDeleteBlogMutation,
  useNewBlogMutation,
  useResult,
  useUpdateBlogMutation,
} from "./client";

const App = () => {
  ...
  const deleteBlogMutation = useDeleteBlogMutation();
  ...
  const deleteBlog = async (id) => {
    try {
      ...
      await deleteBlogMutation.mutateAsync(id);
      ...
    } catch ({ response }) {
      ...
    }
  };
  ...
};
...
```

## React Context : Gestión de usuarios

Creamos el reducer `src/reducers/userReducer.js`:

```
const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER": {
      const user = action.payload;
      return user;
    }
    case "CLEAN_USER":
      return null;
    default:
      return state;
  }
};

export const setUser = (user) => ({ type: "SET_USER", payload: user });

export const cleanUser = () => ({ type: "CLEAN_USER" });

export default userReducer;
```

Creamos el contexto `src/contexts/UserContext.jsx`:

```
import React, { createContext, useContext, useReducer } from "react";
import userReducer from "../reducers/userReducer";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, userDispatch] = useReducer(userReducer, null);

  return (
    <UserContext.Provider value={[user, userDispatch]}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserValue = () => {
  const userAndDispatch = useContext(UserContext);
  return userAndDispatch[0];
};

export const useUserDispatch = () => {
  const userAndDispatch = useContext(UserContext);
  return userAndDispatch[1];
};

export default UserContext;
```

Dentro del fichero `src/main.jsx`:

```
...
import { UserContextProvider } from "./contexts/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    ...
  </UserContextProvider>
);
```

Dentro del componente `src/App.jsx`:

```
...
import { useUserDispatch, useUserValue } from "./contexts/UserContext";
import { cleanUser, setUser } from "./reducers/userReducer";

const App = () => {
  ...
  // const [user, setUser] = useState(null); // "user === { username: String, name: String, token: String }".
  ...
  const userValue = useUserValue();
  const userDispatch = useUserDispatch();
  ...
  useEffect(() => {
    ...
    if (loggedUserJSON) {
      ...
      userDispatch(setUser(user));
      ...
    }
  }, []);
  ...
  const handleLogin = async (event) => {
    ...
    try {
      ...
      userDispatch(setUser(user));
      ...
    } catch ({ response }) {
      ...
    }
  };

  const handleLogout = () => {
    ...
    userDispatch(cleanUser());
  };
  ...
  return (
    <div>
      ...
      {userValue === null ? (
        ...
      ) : (
        <>
          ...
          <p>
            {userValue.name} logged in{" "}
            ...
          </p>
          ...
        </>
      )}
    </div>
  );
};
...
```

## React Router DOM

Instalamos la librería `React-router-dom` (no `React-router`) para poder realizar enrutamiento en nuestra aplicación web:

· `npm install react-router-dom --save`

Dentro de `src/main.jsx` rodeamos la aplicación con el componente `<BrowserRouter> [...] </BrowserRouter>` para habilitar el enrutamiento:

```
...
import { BrowserRouter } from "react-router-dom";
...
createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    <QueryClientProvider client={queryClient}>
      <NotificationContextProvider>
        <BrowserRouter>
          ...
          <App />
        </BrowserRouter>
      </NotificationContextProvider>
    </QueryClientProvider>
  </UserContextProvider>
);
```

Dentro del componente `src/App.jsx` definimos las rutas disponibles:

```
...
import { Route, Routes } from "react-router-dom";
import Users from "./pages/Users";

const App = () => {
  ...
  return (
    <div>
      ...
      {userValue === null ? (
        ...
      ) : (
        <>
          ...
          {/* Contenemos cada ruta dentro del bloque `<Routes> [...] </Routes>`. Una ruta posee los atributos: "path" para definir la URL a la que habría que acceder para renderizar el componente; "element" representa el componente a renderizar (con sus propios atributos). */}
          <Routes>
            <Route path="/users" element={<Users />} />
            <Route
              path="/"
              element={...}
            />
          </Routes>
        </>
      )}
    </div>
  );
};
...
```

### useResource hook + <Users /> component

Dentro del fichero `src/hooks/index.js` creamos el hook personalizado para realizar solicitudes HTTP al servidor web:

```
import axios from "axios";
import { useEffect, useState } from "react";

/* El hook personalizado "useResource()" recibe como parámetro la URL del servidor web.

Devuelve un objeto lista (como el hook "useState()" o "useReducer()") en el que el 1º elemento es la lista de elementos (resources) mientras que el 2º elemento es el servicio con sus operaciones disponibles (service; por ejemplo "service.create").
*/
export const useResource = (baseUrl) => {
  const [resources, setResources] = useState([]);

  // Con el hook "useEffect()" especificamos como dependencia "baseUrl" para que siempre que su valor cambie re-rendericemos el hook personalizado (al momento de renderizar el hook personalizado se realiza una solicitud HTTP GET al servidor web).
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(baseUrl);
      setResources(response.data);
    };

    fetchData();
  }, [baseUrl]);

  const get = (id) => resources.find((item) => item.id === id);

  const service = { get };

  return [resources, service];
};
```

Creamos el componente `src/pages/Users.jsx`:

```
import React from "react";
import { useResource } from "../hooks";

const Users = () => {
  const [users, userService] = useResource("/api/users");

  return (
    <>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Users;
```

### useParams() / useMatch() : Enviando parámetros a través de las rutas

Dentro del componente `src/App.jsx` creamos una nueva ruta para cuando querramos recuperar los datos de un usuario:

```
...
import User from "./pages/User";

const App = () => {
  ...
  return (
    <div>
      ...
      {userValue === null ? (
        ...
      ) : (
        <>
          ...
          <Routes>
            <Route path="/users/:id" element={<User />} />
            ...
          </Routes>
        </>
      )}
    </div>
  );
};
...
```

Dentro del componente `src/pages/Users.jsx` construimos el enlace para acceder a la ruta `/users/:id`:

```
...
import { Link } from "react-router-dom";

const Users = () => {
  ...
  return (
    <>
      ...
      <table>
        ...
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {/* En vez de utilizar la etiqueta de ancla `<a></a>` usamos el componente `<Link></Link>`. Posee el atributo `to` que especifica la ruta a visitar (debemos definir la ruta en el bloque de rutas). */}
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </td>
              ...
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
...
```

Dentro del componente `src/pages/User.jsx`:

```
import React from "react";
import { useResource } from "../hooks";
import { useParams } from "react-router-dom";

const User = () => {
  const [users, userService] = useResource("/api/users");
  /* El hook "useMatch()" recupera el objeto "ruta" cuando la ruta coincide con el valor enviado como parámetro. Si coinciden el objeto retornado poseera todas las propiedades de la ruta actual (como ".params.id" para recuperar el parámetro ":id" enviado a través de la URL).

  Otra opción hubiese sido utilizar el hook "useParams()" que retorna un objeto con el que podremos acceder a los parámetros enviados a través de la URL.
   */
  const params = useParams();

  const user = userService.get(params.id);

  if (!user) return null;

  return (
    <>
      <h2>{user.name}</h2>
      <div>
        <h3>added blogs</h3>
        <ul>
          {user.blogs.map((blog) => (
            <li key={blog.id}>{blog.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default User;
```

### useNavigate() : Navegando a otras rutas

Con el hook `useNavigate()` podemos acceder a otras rutas desde un componente:

```
const navigate = useNavigate();

navigate("/users");
```

### <Navigate /> : Re-direccionado

Dentro del bloque de rutas podemos utilizar el componente `<Navigate />` con los atributos `replace` + `to` para re-direccionar a otra ruta (por ejemplo si no queremos que el usuario acceda a la lista de anécdotas si no ha iniciado sesión podríamos utilizar un condicional ternário).

### <Blogs /> component

Dentro del componente `src/App.jsx`:

```
...
import { Route, Routes, useMatch } from "react-router-dom";
...
import BlogPage from "./pages/Blog";

const App = () => {
  ...
  /* El hook "useMatch()" recupera el objeto "ruta" cuando la ruta coincide con el valor enviado como parámetro. Si coinciden el objeto retornado poseera todas las propiedades de la ruta actual (como ".params.id" para recuperar el parámetro ":id" enviado a través de la URL).

  Otra opción hubiese sido utilizar el hook "useParams()" que retorna un objeto con el que podremos acceder a los parámetros enviados a través de la URL.
   */
  const match = useMatch("/blogs/:id");
  ...
  const blog = match
    ? blogs.find((blog) => blog.id === match.params.id) // Si el identificador es un número deberíamos transformar el parámetro recuperado (es una cadena de texto).
    : null;
  ...
  return (
    <div>
      ...
      {userValue === null ? (
        ...
      ) : (
        <>
          ...
          <Routes>
            ...
            <Route
              path="/blogs/:id"
              element={
                <BlogPage
                  blog={blog}
                  likeBlog={likeBlog}
                  deleteBlog={deleteBlog}
                />
              }
            />
            <Route
              path="/"
              element={
                <>
                  ...
                  {sortedBlogs.map((blog) => (
                    <Blog
                      ...
                      // likeBlog={likeBlog}
                      // deleteBlog={deleteBlog}
                    />
                  ))}
                </>
              }
            />
          </Routes>
        </>
      )}
    </div>
  );
};
...
```

Creamos el componente `src/pages/Blog.jsx`:

```
import React from "react";
import { useNavigate } from "react-router-dom";

const Blog = ({ blog, likeBlog, deleteBlog }) => {
  const navigate = useNavigate();

  const handleLike = async () => {
    const updatedBlog = { ...blog, likes: blog.likes + 1 };

    await likeBlog(updatedBlog);
  };

  const owner = () => {
    const loggedUserJSON = JSON.parse(
      window.localStorage.getItem("loggedBloglistappUser")
    );
    return loggedUserJSON.username === blog.user?.username;
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      await deleteBlog(blog.id);
      navigate("/");
    }
  };

  if (!blog) return null;

  return (
    <>
      <h2>{blog.title}</h2>
      <div>
        {blog.url}
        <br />
        likes {blog.likes}{" "}
        <button type="button" onClick={handleLike}>
          like
        </button>
        <br />
        {blog.author}
        <br />
        {owner() && (
          <button type="button" onClick={handleDelete}>
            remove
          </button>
        )}
      </div>
    </>
  );
};

export default Blog;
```

Dentro del componente `src/components/Blog.jsx`:

```
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Blog = ({ blog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  return (
    <div style={blogStyle}>
      <div>
        <Link to={`/blogs/${blog.id}`}>
          {blog.title} {blog.author}
        </Link>
      </div>
    </div>
  );
};

export default Blog;
```
