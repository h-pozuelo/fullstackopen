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

## Almacén de estados

### Redux

Instalamos las librerías necesarias para construir un almacén que maneje los estados de nuestra aplicación:

· `npm install redux --save`

· `npm install react-redux --save`

#### Reducer personalizado para notificaciones

Creamos el reducer `src/reducers/notificationReducer.js`:

```
/* Función reducer personalizada que recibe como parámetros:
    - "state" : Estado inicial del reducer personalizado.
    - "action" : Objeto con las propiedades: "type", que define la operación a realizar; "payload", información adicional que puede ser necesaria para realizar la operación.

Con un condicional "switch" en función del tipo de operación retornamos un estado diferente.

Los reducers son funciones puras e inmutables (no retornan un estado manipulado sino un nuevo estado).
*/
const notificationReducer = (state = "", action) => {
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

/* Definimos "action creators" personalizados (crean el objeto "action" que espera recibir como parámetro la función reducer personalizada) para que el componente de React no necesite construirlo.
 */
export const setNotification = (message) => ({
  type: "SET_NOTIFICATION",
  payload: message,
});

export const cleanNotification = () => ({ type: "CLEAN_NOTIFICATION" });

export default notificationReducer;
```

Creamos el fichero `store.js` en donde definimos el almacén de estados:

```
import { legacy_createStore as createStore } from "redux";
import notificationReducer from "./src/reducers/notificationReducer";

// Construimos un almacén de estados a partir de la función reducer personalizada.
const store = createStore(notificationReducer);

export default store;
```

Dentro del fichero `src/main.jsx` implementamos un proveedor del almacén de estados para nuestra aplicación:

```
...
import { Provider } from "react-redux";
import store from "../store.js";

/* Mediante el proveedor de "React-redux" proporcionamos acceso al almacén de estados en toda la aplicación.
 */
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

Dentro del componente `src/App.jsx`:

```
...
import { useDispatch } from "react-redux";
import {
  cleanNotification,
  setNotification,
} from "./reducers/notificationReducer";

const App = () => {
  ...
  // const [message, setMessage] = useState(null);
  ...
  // El hook "useDispatch()" nos proporciona acceso al almacén de estados para realizar operaciones (actions) sobre él (en vez de ejecutar directamente el método "store.dispatch()" lo hacemos a través del hook "useDispatch()").
  const dispatch = useDispatch();
  ...
  useEffect(() => {
    ...
    try {
      ...
    } catch (error) {
      dispatch(setNotification(error.message));
      setTimeout(() => dispatch(cleanNotification()), 5000);
    }
  }, []);

  const handleLogin = async (event) => {
    ...
    try {
      ...
    } catch ({ response }) {
      dispatch(setNotification(response.data.error));
      setTimeout(() => dispatch(cleanNotification()), 5000);
    }
  };
  ...
  const addBlog = async (newBlog) => {
    ...
    try {
      ...
      dispatch(
        setNotification(
          `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`
        )
      );
      setTimeout(() => dispatch(cleanNotification()), 5000);
      ...
    } catch ({ response }) {
      dispatch(setNotification(response.data.error));
      setTimeout(() => dispatch(cleanNotification()), 5000);
    }
  };

  const likeBlog = async (updatedBlog) => {
    try {
      ...
    } catch ({ response }) {
      dispatch(setNotification(response.data.error));
      setTimeout(() => dispatch(cleanNotification()), 5000);
    }
  };
  ...
  const deleteBlog = async (id) => {
    try {
      ...
      dispatch(setNotification(`blog deleted successfully`));
      setTimeout(() => dispatch(cleanNotification()), 5000);
    } catch ({ response }) {
      dispatch(setNotification(response.data.error));
      setTimeout(() => dispatch(cleanNotification()), 5000);
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

Dentro del componente `src/components/Notification.jsx`:

```
...
import { useSelector } from "react-redux";

const Notification = () => {
  // El hook "useSelector()" permite recuperar del almacén de estados un estado en concreto. En este caso estamos recuperando el estado al completo (el estado actualmente se compone del mensaje).
  const message = useSelector((state) => state);
  ...
};

export default Notification;
```

#### Reducer personalizado para publicaciones

Creamos el reducer `src/reducers/blogReducer.js`:

```
const blogReducer = (state = [], action) => {
  switch (action.type) {
    case "SET_BLOGS": {
      const blogs = action.payload;
      return blogs;
    }
    case "CREATE_BLOG": {
      const newBlog = action.payload;
      return state.concat(newBlog);
    }
    case "LIKE_BLOG": {
      const id = action.payload;
      const blogToLike = state.find((blog) => blog.id === id);
      const likedBlog = { ...blogToLike, likes: blogToLike.likes + 1 };
      return state.map((blog) => (blog.id !== id ? blog : likedBlog));
    }
    case "DELETE_BLOG": {
      const id = action.payload;
      return state.filter((blog) => blog.id !== id);
    }
    default:
      return state;
  }
};

export const setBlogs = (blogs) => ({ type: "SET_BLOGS", payload: blogs });

export const createBlog = (newBlog) => ({
  type: "CREATE_BLOG",
  payload: newBlog,
});

export const likeBlog = (id) => ({ type: "LIKE_BLOG", payload: id });

export const deleteBlog = (id) => ({ type: "DELETE_BLOG", payload: id });

export default blogReducer;
```

Dentro del fichero `src/store.js`:

```
import { combineReducers, legacy_createStore as createStore } from "redux";
import notificationReducer from "./src/reducers/notificationReducer";
import blogReducer from "./src/reducers/blogReducer";

/* Para combinar los "reducers" debemos utilizar el método "combineReducers()".
La función recibe como parámetro un objeto JavaScript en el que cada propiedad corresponde a uno de los "reducers".

Cuando recuperemos el almacen de estados al completo retornará un objeto JavaScript con dos propiedades (notification: un mensaje de notificación; filter: una lista de publicaciones).
Eso quiere decir que, por ejemplo, para recuperar la lista de publicaciones con el hook "useSelector()" debemos de recuperar "useSelector((state) => state.blogs)".
*/
const reducers = combineReducers({
  notification: notificationReducer,
  blogs: blogReducer,
});

// Construimos un almacén de estados a partir de la función reducer personalizada.
const store = createStore(reducers);

export default store;
```

Modificamos el componente `src/components/Notification.jsx` para que recupere el estado correspondiente del almacén de estados:

```
...
const Notification = () => {
  const message = useSelector((state) => state.notification);
  ...
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import {
  setBlogs as initializeBlogs,
  createBlog,
  likeBlog as voteBlog,
  deleteBlog as eliminateBlog,
} from "./reducers/blogReducer";

const App = () => {
  ...
  // const [blogs, setBlogs] = useState([]);
  ...
  const blogs = useSelector((state) => state.blogs);
  ...
  useEffect(() => {
    async function fetchData() {
      ...
      dispatch(initializeBlogs(blogs));
    }
    ...
  }, []);
  ...
  const addBlog = async (newBlog) => {
    ...
    try {
      ...
      dispatch(createBlog(returnedBlog));
      ...
    } catch ({ response }) {
      ...
    }
  };

  const likeBlog = async (updatedBlog) => {
    try {
      ...
      dispatch(voteBlog(returnedBlog.id));
    } catch ({ response }) {
      ...
    }
  };
  ...
  const deleteBlog = async (id) => {
    try {
      ...
      dispatch(eliminateBlog(id));
      ...
    } catch ({ response }) {
      ...
    }
  };
  ...
};
...
```

### Redux Toolkit

Instalamos la librería `@reduxjs/toolkit` para facilitar la construcción del almacén de estados de nuestra aplicación:

· `npm install @reduxjs/toolkit --save`

Dentro del fichero `store.js` re-definimos la construcción del almacén de estados utilizando el método `configureStore()` que proporciona la librería `@reduxjs/toolkit`:

```
...
import { configureStore } from "@reduxjs/toolkit";
...
/* Con el método "configureStore()" construimos un almacén de estados pasándole como parámetro un objeto JavaScript con la propiedad "reducer".
En el interior de la propiedad "reducer" podemos simplemente pasar la función reducer personalizada o definir un objeto JavaScript en el que cada propiedad corresponda a una de las funciones reducer personalizadas (no tenemos que usar "combineReducers()").
*/
const store = configureStore({
  reducer: {
    notification: notificationReducer,
    blogs: blogReducer,
  },
});
...
```

Dentro del reducer `src/reducers/notificationReducer.js` re-definimos la construcción del reducer personalizado junto a sus "action creators":

```
import { createSlice } from "@reduxjs/toolkit";
...
/* El método "createSlice()" recibe como parámetro un objeto JavaScript:
    - "name" : Prefijo único que sirve para identificar al reducer. Lo usamos al momento de ejecutar una operación en el almacén de estados (store.dispatch({ type: "notification/setNotification", payload: "message" })).
    - "initialState" : Valor inicial del estado.
    - "reducers" : Objeto JavaScript que contiene las funciones reducer personalizadas. Ya no dependemos de un "action creator" para especificar el tipo de operación "action.type" dado que la función reducer que ejecutemos lo hace por su cuenta (store.dispatch(setNotification("message")) === store.dispatch({ type: "notification/setNotification", payload: "message" })).

La ejecución del método "createSlice()" devuelve un objeto del que podemos recuperar los reducers (anecdoteSlice.reducers) / actions creator (anecdoteSlice.actions).
*/
const notificationSlice = createSlice({
  name: "notification",
  initialState: "",
  reducers: {
    setNotification(state, action) {
      const message = action.payload;
      return message;
    },
    cleanNotification(state, action) {
      return "";
    },
  },
});

export const { setNotification, cleanNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
```

Dentro del reducer `src/reducers/blogReducer.js` re-definimos la construcción del reducer personalizado junto a sus "action creators":

```
import { createSlice, current } from "@reduxjs/toolkit";
...
const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      const blogs = action.payload;
      return blogs;
    },
    createBlog(state, action) {
      const newBlog = action.payload;
      return state.concat(newBlog); // "Redux-toolkit" contiene la librería "Immer" que nos permite mutar el estado de objetos no primitivos. Cuando realicemos un ".push()" se producirá un estado inmutable a partir del estado mutado (no hace falta retornarlo). (mutar no es lo mismo que re-definir variables)
    },
    likeBlog(state, action) {
      const id = action.payload;
      const blogToLike = state.find((blog) => blog.id === id);
      const likedBlog = { ...blogToLike, likes: blogToLike.likes + 1 };
      console.log(current(state)); // Con "current()" podemos imprimir el estado actual de un tipo no primitivo.
      return state.map((blog) => (blog.id !== id ? blog : likedBlog));
    },
    deleteBlog(state, action) {
      const id = action.payload;
      return state.filter((blog) => blog.id !== id);
    },
  },
});

export const { setBlogs, createBlog, likeBlog, deleteBlog } = blogSlice.actions;

export default blogSlice.reducer;
```

Dentro del componente `src/App.jsx`:

```
import React, { useEffect, useRef, useState } from "react";
import loginService from "./services/login";
import blogService from "./services/blogs";
import Notification from "./components/Notification";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Togglable from "./components/Togglable";
import Blog from "./components/Blog";
import { useDispatch, useSelector } from "react-redux";
import {
  cleanNotification,
  setNotification,
} from "./reducers/notificationReducer";
import {
  setBlogs as initializeBlogs,
  createBlog,
  likeBlog as voteBlog,
  deleteBlog as eliminateBlog,
} from "./reducers/blogReducer";

const App = () => {
  ...
  // Cuando recuperamos la lista de publicaciones del almacén de estados es una variable inmutable (no podemos realizar un ".sort()" sobre la propia lista).
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);
  ...
};
...
```

#### Redux Thunk

Dentro del reducer `src/reducers/notificationReducer.js`:

```
...
export const setAndCleanNotification =
  (message, duration) => async (dispatch, getState) => {
    dispatch(setNotification(message));
    setTimeout(() => {
      dispatch(cleanNotification());
    }, Number(duration * 1000));
  };
...
```

Dentro del reducer `src/reducers/blogReducer.js`:

```
...
import blogService from "../services/blogs";
...
export const setBlogs = () => async (dispatch, getState) => {
  const blogs = await blogService.getAllBlogs();
  dispatch({ type: "blogs/setBlogs", payload: blogs });
};

export const createBlog = (newBlog) => async (dispatch, getState) => {
  const returnedBlog = await blogService.createBlog(newBlog);
  dispatch({ type: "blogs/createBlog", payload: returnedBlog });
};

export const likeBlog = (updatedBlog) => async (dispatch, getState) => {
  const returnedBlog = await blogService.updateBlog(
    updatedBlog.id,
    updatedBlog
  );
  dispatch({ type: "blogs/likeBlog", payload: returnedBlog.id });
};

export const deleteBlog = (id) => async (dispatch, getState) => {
  await blogService.deleteBlog(id);
  dispatch({ type: "blogs/deleteBlog", payload: id });
};
...
```

Dentro del componente `src/App.jsx`:

```
...
import { setAndCleanNotification } from "./reducers/notificationReducer";
...
const App = () => {
  ...
  ...
  useEffect(() => {
    ...
    try {
      ...
      dispatch(initializeBlogs());
    } catch (error) {
      dispatch(setAndCleanNotification(error.message, 5));
    }
  }, []);

  const handleLogin = async (event) => {
    ...
    try {
      ...
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };
  ...
  const addBlog = (newBlog) => {
    ...
    try {
      ...
      dispatch(createBlog(newBlog));
      ...
      dispatch(
        setAndCleanNotification(
          `a new blog ${newBlog.title} by ${newBlog.author} added`,
          5
        )
      );
      ...
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };

  const likeBlog = (updatedBlog) => {
    try {
      ...
      dispatch(voteBlog(updatedBlog));
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };
  ...
  const deleteBlog = (id) => {
    try {
      ...
      dispatch(eliminateBlog(id));

      dispatch(setAndCleanNotification(`blog deleted successfully`, 5));
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };
  ...
};
...
```

Creamos el reducer `src/reducers/userReducer.js`:

```
import { createSlice } from "@reduxjs/toolkit";
import blogService from "../services/blogs";
import loginService from "../services/login";

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser(state, action) {
      const user = action.payload;
      return user;
    },
    cleanUser(state, action) {
      return null;
    },
  },
});

export const loggedUser = () => (dispatch, getState) => {
  const loggedUserJSON = window.localStorage.getItem("loggedBloglistappUser"); // Debemos transformar la cadena de texto a un objeto JavaScript.

  if (loggedUserJSON) {
    const user = JSON.parse(loggedUserJSON);
    dispatch({ type: "user/setUser", payload: user });
    blogService.setToken(user.token); // Cuando el componente se renderice adjunta al servicio de solicitudes HTTP el token del usuario.
  }
};

export const loginUser = (credentials) => async (dispatch, getState) => {
  // Hasta que el usuario no sea autenticado la ejecución queda detenida.
  const user = await loginService.login(credentials);

  // Guardamos en el almacenamiento local el usuario autenticado.
  window.localStorage.setItem(
    "loggedBloglistappUser",
    // Debemos almacenarlo como una cadena de texto (no como un objeto JavaScript).
    JSON.stringify(user)
  );

  // Guardamos en el servicio de solicitudes HTTP el token del usuario.
  blogService.setToken(user.token);

  dispatch({ type: "user/setUser", payload: user });
};

export const logoutUser = () => (dispatch, getState) => {
  window.localStorage.removeItem("loggedBloglistappUser");

  // Eliminamos del servicio de solicitudes HTTP el token del usuario.
  blogService.setToken(null);

  dispatch({ type: "user/cleanUser" });
};

export default userSlice.reducer;
```

Dentro del fichero `store.js`:

```
...
import userReducer from "./src/reducers/userReducer";
...
const store = configureStore({
  reducer: {
    ...,
    user: userReducer,
  },
});
...
```

Dentro del componente `src/App.jsx`:

```
...
import { loggedUser, loginUser, logoutUser } from "./reducers/userReducer";

const App = () => {
  ...
  // const [user, setUser] = useState(null);
  ...
  const user = useSelector((state) => state.user);
  ...
  useEffect(() => {
    ...
    dispatch(loggedUser());
  }, []);
  ...
  const handleLogin = async (event) => {
    ...
    event.preventDefault();

    try {
      ...
      dispatch(loginUser({ username, password }));
      setUsername("");
      setPassword("");
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };

  const handleLogout = () => {
    ...
    dispatch(logoutUser());
  };
  ...
};
...
```
