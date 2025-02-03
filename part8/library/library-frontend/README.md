# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# library-frontend

· `npm create vite@latest library-frontend -- -- --template react`

· `cd .\library-frontend\`

· `npm install`

· `npm install @apollo/client --save`

Dentro del fichero `src/main.jsx`:

```
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ALL_AUTHORS } from "./query.js";

/* Construimos un cliente de Apollo mediante la clase `ApolloClient`. El constructor recibe como parámetro un objeto con las propiedades:
    - "cache"
    - "link" : Dentro construimos un elemento `HttpLink` al que le pasamos como parámetro un objeto con la propiedad `uri` que corresponde a la URL del servidor Apollo.
*/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: "http://localhost:4000" }),
});

/* Con el proveedor de Apollo permitimos que la aplicación acceda al cliente Apollo mediante el uso de los hooks:
    - "useQuery()" : Para realizar consultas inmediatas de obtención de datos.
    - "useLazyQuery()" : Para realizar consultas de obtención de datos en momentos específicos.
    - "useMutation()" : Para realizar operaciones de creación, modificación o eliminación.
*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
```

## Vista de Autores

Creamos el fichero `src/query.js` en donde declaramos todas las consultas/mutaciones que el servidor Apollo acepte:

```
import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  #graphql
  query allAuthors {
    allAuthors {
      bookCount
      born
      id
      name
    }
  }
`;
```

Creamos el componente `src/components/Authors.jsx`:

```
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ALL_AUTHORS } from "../query";

const Authors = ({ show }) => {
  const [authors, setAuthors] = useState([]);
  const result = useQuery(ALL_AUTHORS); // El hook `useQuery()` recibe como parámetro la consulta.

  /* Cuando se renderiza el componente por primera vez se comprueba que su propiedad `.data` no sea `null` (ahí se encuentra el resultado de la consulta con el formato `result.data === { allAuthors: [...] }`).

  Al mutar el valor de `result` vuelve a renderizar el componente aplicando ahora sí el valor de `result.data.allAuthors` al estado.
   */
  useEffect(() => {
    if (result.data) setAuthors(result.data.allAuthors);
  }, [result]);

  if (!show) return null;

  // Comprobamos con la propiedad `result.loading` que finalice la consulta.
  if (result.loading) return <div>loading authors...</div>;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Authors;
```

## Vista de Libros

Dentro del fichero `src/query.js`:

```
...
/* Definimos la consulta `FIND_BOOKS` como una consulta programáticamente.
Este tipo de consultas se caracterizan por ser definidas con un nombre y recibir como parámetros variables GraphQL (que comiencen por un `$`).
*/
export const FIND_BOOKS = gql`
  #graphql
  query findBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      author
      genres
      id
      published
      title
    }
  }
`;
```

Creamos el componente `src/components/Books.jsx`:

```
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { FIND_BOOKS } from "../query";

const Books = ({ show }) => {
  const [books, setBooks] = useState([]);
  const result = useQuery(FIND_BOOKS);

  useEffect(() => {
    if (result.data) setBooks(result.data.allBooks);
  }, [result]);

  if (!show) return null;

  if (result.loading) return <div>loading books...</div>;

  return (
    <div>
      <h2>books</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
```

## Agregar un Libro

Dentro del fichero `src/query.js`:

```
...
export const CREATE_BOOK = gql`
  #graphql
  mutation createBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      author
      genres
      id
      published
      title
    }
  }
`;
```

Creamos el componente `src/components/NewBook.jsx`:

```
import React, { useState } from "react";
import { useField } from "../hooks";
import { useMutation } from "@apollo/client";
import { ALL_AUTHORS, CREATE_BOOK, FIND_BOOKS } from "../query";

const NewBook = ({ show }) => {
  const [title, resetTitle] = useField({ name: "title" });
  const [author, resetAuthor] = useField({ name: "author" });
  const [published, resetPublished] = useField({
    name: "published",
    type: "number",
  });
  const [genre, resetGenre] = useField({ name: "genre" });
  const [genres, setGenres] = useState([]);

  /* El hook `useMutation()` retorna una matriz con 2 elementos:
    - "addBook" : Le damos al 1º elemento el nombre de "addBook"; con el realizaremos la operación CREATE pasándole como parámetro un objeto con la propiedad `variables` que posee un objeto JavaScript con cada propiedad que corresponde a los parámetros que espera recibir ( addBook({ variables: { ... } }); ).
    - "result" : Nos sirve para comprobar el resultado de la operación (si ha sido llamada ".called"; si ha sido completada ".loading"; sus datos retornados ".data").
  */
  const [addBook, result] = useMutation(CREATE_BOOK, {
    /* Como 2º parámetro le pasamos un objeto con la propiedad `refetchQueries`.
    En su interior contiene una lista de objetos de consulta a las que la mutación llamará cuando la operación se realice.
    */
    refetchQueries: [{ query: ALL_AUTHORS }, { query: FIND_BOOKS }],
  });

  const addGenre = () => {
    setGenres((prev) => prev.concat(genre.value));
    resetGenre();
  };

  const onSubmit = (event) => {
    event.preventDefault();

    addBook({
      variables: {
        title: title.value,
        author: author.value,
        published: Number(published.value), // El campo `published` espera recibir un `Int`.
        genres,
      },
    });

    resetTitle();
    resetAuthor();
    resetPublished();
    resetGenre();
    setGenres([]);
  };

  if (!show) return null;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          title: <input {...title} />
        </div>
        <div>
          author: <input {...author} />
        </div>
        <div>
          published: <input {...published} />
        </div>
        <div>
          <input {...genre} />
          <button type="button" onClick={addGenre}>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
```

### Manejo de errores de mutación

Para manejar los errores producidos durante la mutación podemos añadir a sus opciones (el objeto enviado como 2º parámetro) la propiedad `onError` que recibe como valor una función callback:

```
const [addBook, result] = useMutation(CREATE_BOOK, {
    onError: ({ graphQLErrors }) => {
        const messages = graphQLErrors.map(error => error.message).join(`\n`);
        console.error(messages);
    },
});
```

## Año de nacimiento del autor

Dentro del fichero `src/query.js`:

```
...
export const EDIT_AUTHOR = gql`
  #graphql
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      bookCount
      born
      id
      name
    }
  }
`;
```

Dentro del componente `src/components/Authors.jsx`:

```
import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../query";
import { useField } from "../hooks";

const EditAuthor = () => {
  const [name, resetName] = useField({ name: "name" });
  const [born, resetBorn] = useField({ name: "born", type: "number" });

  // Cuando modificamos elementos que poseen un identificador único no es necesario que llamemos de nuevo a las consultas (`refetchQueries`) (al encontrarse en la caché de Apollo la actualización se realiza de manera automática).
  const [editAuthor, authorResult] = useMutation(EDIT_AUTHOR, {
    onError: ({ graphQLErrors }) => {
      const message = graphQLErrors.map((error) => error.message).join(`\n`);
      console.error(message);
    },
  });

  // Si en el servidor Apollo no hubiesemos lanzado una excepción cuando el nombre del autor no existe, podríamos manejar que la mutación ha fallado comprobando si el valor retornado por la operación es `null` ( `result.data.editAuthor === null ?` ).
  useEffect(() => {
    // La respuesta a la consulta se encuentra en su propio nombre de propiedad dentro de `result.data`.
    if (authorResult.data && authorResult.data.editAuthor === null)
      console.error("author not found");
  }, [authorResult.data]);

  const onSubmit = (event) => {
    event.preventDefault();

    editAuthor({
      variables: { name: name.value, setBornTo: Number(born.value) },
    });

    resetName();
    resetBorn();
  };

  return (
    <div>
      <h2>Set birthday</h2>
      <form onSubmit={onSubmit}>
        <div>
          name: <input {...name} />
        </div>
        <div>
          born: <input {...born} />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

const Authors = ({ show }) => {
  ...
  return (
    <div>
      ...
      <EditAuthor />
    </div>
  );
};
...
```

### Año de nacimiento del autor avanzado

Dentro del componente `src/components/Authors.jsx`:

```
...
const EditAuthor = () => {
  ...
  const [name, setName] = useState("");
  ...
  const [authors, setAuthors] = useState([]);
  const authorsResult = useQuery(ALL_AUTHORS);

  useEffect(() => {
    if (authorsResult.data) setAuthors(authorsResult.data.allAuthors);
  }, [authorsResult]);

  const onSubmit = (event) => {
    ...
    editAuthor({
      variables: { name, setBornTo: Number(born.value) },
    });
    ...
    setName("");
    ...
  };

  return (
    <div>
      ...
      <form onSubmit={onSubmit}>
        ...
        <div>
          name:{" "}
          <select name="name" onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        ...
      </form>
    </div>
  );
};
...
```

## Inicio de sesión de usuario

Dentro del fichero `src/query.js` definimos la mutación para poder iniciar sesión:

```
export const LOGIN = gql`
  #graphql
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
```

Creamos el componente `src/components/LoginForm.jsx`:

```
import React, { useEffect } from "react";
import { useField } from "../hooks";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../query";

const LoginForm = ({ setToken, setError }) => {
  const [username, resetUsername] = useField({ name: "username" });
  const [password, resetPassword] = useField({
    name: "password",
    type: "password",
  });

  const [login, result] = useMutation(LOGIN, {
    onError: ({ graphQLErrors }) => {
      const message = graphQLErrors.map((error) => error.message).join("\n");
      setError(message);
    },
  });

  // La primera vez que el componente sea renderizado y cuando la propiedad `result.data` mute...
  useEffect(() => {
    // Verificamos que la propiedad `result.data` no sea `null`.
    if (result.data) {
      const token = result.data.login.value; // Recuperamos del resultado de la consulta/mutación `login` el valor de la propiedad `value` (el token del usuario).
      setToken(token);
      window.localStorage.setItem("library-user-token", token);
    }
  }, [result.data]); // eslint-disable-line

  const onSubmit = (event) => {
    event.preventDefault();

    login({
      variables: {
        username: username.value,
        password: password.value,
      },
    });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          username: <input {...username} />
        </div>
        <div>
          password: <input {...password} />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
```

Dentro del componente `src/App.jsx`:

```
...
import LoginForm from "./components/LoginForm";

const App = () => {
  ...
  const [token, setToken] = useState(null); // Guardamos en el estado de la aplicación el token del usuario que ha iniciado sesión.
  const [errorMessage, setErrorMessage] = useState(null);

  // Cada vez que el componente es renderizado comprobamos si el usuario ha iniciado sesión.
  useEffect(() => {
    const loggedUser = window.localStorage.getItem("library-user-token");
    if (loggedUser) setToken(loggedUser);
  }, []);

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  if (!token)
    return (
      <div>
        <Notification errorMessage={errorMessage} />

        <LoginForm setToken={setToken} setError={notify} />
      </div>
    );
  ...
};

const Notification = ({ errorMessage }) => {
  const style = { color: "red" };

  if (!errorMessage) return null;

  return <div style={style}>{errorMessage}</div>;
};
...
```

### Cierre de sesión de usuario

Dentro del componente `src/App.jsx`:

```
...
import { useApolloClient } from "@apollo/client";

const App = () => {
  ...
  const client = useApolloClient(); // Con el hook `useApolloClient()` recuperamos el cliente propuesto por el proveedor `<ApolloProvider>`.
  ...
  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("library-user-token");
    client.resetStore(); // Limpiamos la caché del cliente Apollo.
  };
  ...
  return (
    <div>
      <div>
        ...
        <button onClick={logout}>logout</button>
      </div>
      ...
    </div>
  );
};
...
```

## Agregar un token a un encabezado

Dentro del fichero `src/main.jsx`:

```
...
import { setContext } from "@apollo/client/link/context";

/* La función `setContext()` recibe como parámetro una función callback que a su vez recibe como parámetros la solicitud/operación a realizar junto al contexto previo. El valor que retorne la función callback será el nuevo contexto de cada operación.
 */
const authLink = setContext((request, previousContext) => {
  const token = window.localStorage.getItem("library-user-token"); // Recuperamos del almacén local el token del usuario (como es una cadena de texto no debemos transformarla de JSON a JavaScript).

  // El nuevo contexto posee como cabeceras las que tuviese anteriormente y la cabecera `Authorization` con el valor del token del usuario o `null`.
  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

// Construimos el link para acceder al servidor Apollo con el método `createHttpLink()` como lo haríamos con el constructor `new HttpLink()`.
const Link = createHttpLink({ uri: "http://localhost:4000" });
...
const client = new ApolloClient({
  ...,
  // link: new HttpLink({ uri: "http://localhost:4000" }),
  link: authLink.concat(Link), // Concatenamos la cabecera de autenticación con el link.
});
...
```

## Reparando el campo `author` al momento de listar libros existente

Dentro del fichero `src/query.js` debemos modificar tanto de la consulta `FIND_BOOKS` como de la consulta `CREATE_BOOK` el campo `author` dado que ahora es de tipo `Author` en vez de tipo `String`:

```
...
export const FIND_BOOKS = gql`
  #graphql
  query findBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      author {
        bookCount
        born
        id
        name
      }
      ...
    }
  }
`;
...
export const CREATE_BOOK = gql`
  #graphql
  mutation createBook(
    ...
  ) {
    addBook(
      ...
    ) {
      author {
        bookCount
        born
        id
        name
      }
      ...
    }
  }
`;
...
```

Dentro del componente `src/components/Books.jsx`:

```
...
const Books = ({ show }) => {
  ...
  return (
    <div>
      ...
      <table>
        ...
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              ...
              <td>{b.author.name}</td>
              ...
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
...
```

## Actualizado la caché

Dentro del componente `src/components/NewBook.jsx`:

```
...
import { ALL_AUTHORS, CREATE_BOOK, FIND_BOOKS } from "../query";

const NewBook = ({ show }) => {
  ...
  const [addBook, result] = useMutation(CREATE_BOOK, {
    ...
    // refetchQueries: [{ query: ALL_AUTHORS }, { query: FIND_BOOKS }],
    /* La propiedad `update` posee una función callback que recibe como parámetros la caché actual del cliente Apollo y la respuesta retornada por la consulta/mutación.
     */
    update: (cache, response) => {
      /* Con el método `cache.updateQuery()` modificamos de la caché del cliente Apollo el resultado de la consulta `FIND_BOOKS`. Para ello le pasamos como parámetros:
        - consulta : un objeto con la consulta/mutación a modificar.
        - función callback : recibe como parámetro el `response.data` de la consulta/mutación que estamos actualizando (la hemos des-estructurado) mientras que el valor retornado es un objeto con el nombre de la consulta/mutación y su nuevo resultado.
      */
      cache.updateQuery({ query: FIND_BOOKS }, ({ allBooks }) => ({
        allBooks: allBooks.concat(response.data.addBook),
      }));
    },
  });
  ...
};
...
```

## Libros por género

### Parte 1

Dentro del componente `src/components/Books.jsx`:

```
...
const Books = ({ show }) => {
  const [books, setBooks] = useState([]);
  const [getBooks, booksResult] = useLazyQuery(FIND_BOOKS); // En vez de utilizar el hook `useQuery()` usamos el hook `useLazyQuery()` para ejecutar la consulta de forma dinámica.

  const [genres, setGenres] = useState([]); // Lista en donde almacenaremos los géneros disponibles la primera vez que renderice el componente.
  const [selectedGenre, setSelectedGenre] = useState(null); // Género por el que filtraremos los libros al momento de realizar la consulta.

  // Sólo la 1ª vez que se renderice el componente...
  useEffect(() => {
    getBooks().then(({ data }) => {
      // Del `result.data` recuperamos el valor de la consulta `allBooks` a la que mapeamos de todos sus elementos la propiedad `.genres` (es una lista). Posteriormente la "aplanamos" (fusionamos todas las listas contenidas dentro de la matriz principal) para crear un conjunto sin duplicados (Set) que transformamos a una lista con el "Spread Operator".
      setGenres([...new Set(data.allBooks.map((b) => b.genres).flat())]);
    });
  }, []); // eslint-disable-line

  // Cuando el valor de `booksResult` mute (quiere decir que ha completado la operación)...
  useEffect(() => {
    if (booksResult.data) {
      setBooks(booksResult.data.allBooks); // Guardamos los datos dentro del estado.
    }
  }, [booksResult]);

  // Cuando el valor del estado `selectedGenre` cambie...
  useEffect(() => {
    getBooks({ variables: { genre: selectedGenre } }); // Volvemos a ejecutar la consulta, lo que disparará el anterior `useEffect()` al mutar la variable `booksResult`.
  }, [selectedGenre]); // eslint-disable-line
  ...
  return (
    <div>
      ...
      {selectedGenre && (
        <p>
          in genre <b>{selectedGenre}</b>
        </p>
      )}
      ...
      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
      </div>
    </div>
  );
};
...
```

### Parte 2

Dentro del fichero `src/query.js`:

```
...
export const CURRENT_USER = gql`
  #graphql
  query {
    me {
      username
      favouriteGenre
      id
    }
  }
`;
```

Dentro del componente `src/App.jsx`:

```
...
import { useApolloClient, useLazyQuery } from "@apollo/client";
import { CURRENT_USER } from "./query";

const App = () => {
  ...
  const [currentUser, setCurrentUser] = useState(null);
  const [getCurrentUser, currentUserResult] = useLazyQuery(CURRENT_USER); // La consulta solo se ejecuta cuando el usuario inicie sesión desde el componente `src/components/LoginForm.jsx`.

  // La 1º vez que el componente sea renderizado y cuando la variable `currentUserResult` mute...
  useEffect(() => {
    if (currentUserResult.data) setCurrentUser(currentUserResult.data.me);
  }, [currentUserResult]);
  ...
  useEffect(() => {
    ...
    if (loggedUser) {
      ...
      getCurrentUser(); // Si el usuario ha iniciado sesión recuperamos sus datos.
    }
  }, []); // eslint-disable-line
  ...
  return (
    <div>
      ...
      <LoginForm
        ...
        getCurrentUser={getCurrentUser}
      />
    </div>
  );
};
...
```

Dentro del componente `src/components/LoginForm.jsx`:

```
...
const LoginForm = ({ setToken, setError, show, getCurrentUser }) => {
  ...
  useEffect(() => {
    ...
    if (result.data) {
      ...
      getCurrentUser();
    }
  }, [result.data]); // eslint-disable-line
  ...
};
...
```

Creamos el componente `src/components/Recommended.jsx`:

```
import { useLazyQuery, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { CURRENT_USER, FIND_BOOKS } from "../query";

const Recommended = ({ show }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const resultCurrentUser = useQuery(CURRENT_USER);

  useEffect(() => {
    if (resultCurrentUser.data) {
      const me = resultCurrentUser.data.me;
      setCurrentUser(me);
      getBooks({ variables: { genre: me.favouriteGenre } });
    }
  }, [resultCurrentUser]); // eslint-disable-line

  const [books, setBooks] = useState([]);
  const [getBooks, resultBooks] = useLazyQuery(FIND_BOOKS);

  useEffect(() => {
    if (resultBooks.data) setBooks(resultBooks.data.allBooks);
  }, [resultBooks]);

  if (!show) return null;

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favourite genre <b>{currentUser.favouriteGenre}</b>
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books &&
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommended;
```

Dentro del componente `src/App.jsx`:

```
...
import Recommended from "./components/Recommended";

const App = () => {
  ...
  return (
    <div>
      <div>
        ...
        {token ? (
          <>
            ...
            <button onClick={() => setPage("recommended")}>recommended</button>
            ...
          </>
        ) : (
          ...
        )}
      </div>
      ...
      <Recommended currentUser={currentUser} show={page === "recommended"} />
    </div>
  );
};
...
```

## Fragmentos y suscripciones

### Suscripciones en el servidor

Continuamos en el servidor

### Suscripciones en el cliente

`https://www.apollographql.com/docs/react/data/subscriptions#websocket-setup`

Instalamos la librería de `Graphql-ws`:

· `npm install graphql-ws --save`

Dentro del fichero `src/main.jsx`:

```
...
import {
  ...,
  split,
} from "@apollo/client";
...
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
...
// Mediante el método `createClient()` proporcionado por la librería `Graphql-ws` creamos un cliente de WebSocket pasándole como parámetro un objeto con la URL. Dicho cliente lo pasamos como parámetro al constructor de `GraphQLWsLink` para construir un link.
const wsLink = new GraphQLWsLink(createClient({ url: "ws://localhost:4000" }));

/* La función `split()` permite construir un link dinámico para utilizar en el cliente Apollo.
Como 1º parámetro recibe una función callback que retorna un booleano (la función recibe la operación realizada, que des-estructuramos para recuperar la `query`). En función del resultado utilizada el `wsLink` (true) o el `httpLink` (false).
*/
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(Link)
);
...
const client = new ApolloClient({
  cache: new InMemoryCache(),
  ...
  // link: authLink.concat(Link), // Concatenamos la cabecera de autenticación con el link.
  link: splitLink, // Usamos el link dinámico que combina el `wsLink` con el `httpLink`.
});
...
```

Dentro del fichero `src/query.js`:

```
...
export const BOOK_ADDED = gql`
  #graphql
  subscription {
    bookAdded {
      author {
        bookCount
        born
        id
        name
      }
      genres
      id
      published
      title
    }
  }
`;
```

Dentro del componente `src/App.jsx`:

```
...
import { useApolloClient, useLazyQuery, useSubscription } from "@apollo/client";
...
import { BOOK_ADDED, FIND_BOOKS } from "./query";

const App = () => {
  ...
  /* El hook `useSubscription()` permite al cliente estar escuchando constantemente al servidor para cuando publique una notificación con el nombre de operación `BOOK_ADDED`.
   */
  useSubscription(BOOK_ADDED, {
    /* Como 2º parámetro al hook `useSubscription()` le pasamos un objeto de opciones con la propiedad `onData`.

    Cuando el servidor publique una notificación con el nombre de operación `BOOK_ADDED` se ejecutará la función callback definida dentro de la propiedad `onData`.

    La función callback de `onData` recibe como parámetro un objeto con el cliente (del que podremos actualizar la caché para añadir el nuevo elemento) junto los datos retornados por el servidor Apollo (equivale al `result` cuando realizábamos consultas/mutaciones).
    */
    onData: ({ client, data }) => {
      const addedBook = data.data.bookAdded;
      notify(`${addedBook.title} added`);

      // Como cuando utilizabamos la propiedad `update: (cache, response) => { ... }`.
      client.cache.updateQuery({ query: FIND_BOOKS }, ({ allBooks }) => ({
        allBooks: allBooks.concat(addedBook),
      }));
    },
  });
  ...
};
...
```

#### Haciendo que no se renderice 2 veces el mismo libro

Dentro del fichero `src/App.jsx`:

```
...
export const updateCache = (cache, query, addedBook) => {
  /* La función recibe como parámetros:
      - "cache" : Es el `client.cache` que le enviamos desde el `onData: ({client, data}) => { ... }` del hook `useSubscription()`.
      - "query" : Es un objeto `{ query: FIND_BOOKS }` que es la consulta de la que vamos a actualizar su valor de la caché.
      - "addedPerson" : Es el `data.data.bookAdded` que recuperamos del `onData: ({client, data}) => { ... }` del hook `useSubscription()`.
  */
  const uniqByTitle = (array) => {
    let seen = new Set(); // Conjunto en donde almacenamos los libros que no van a tener el mismo título (único).

    return array.filter((item) => {
      let key = item.title;
      return seen.has(key) ? false : seen.add(key); // Si el título del libro se encuentra en el conjunto va a ser excluido del filtrado. En caso contrario se añade el título al conjunto (es una operación `truthy`).
    });
  };

  // Similar a cuando actualizamos la caché.
  cache.updateQuery(query, ({ allBooks }) => ({
    allBooks: uniqByTitle(allBooks.concat(addedBook)),
  }));
};

const App = () => {
  ...
  useSubscription(BOOK_ADDED, {
    ...
    onData: ({ client, data }) => {
      ...
      updateCache(client.cache, { query: FIND_BOOKS }, addedBook);
    },
  });
  ...
};
...
```

Ese mismo método lo podemos utilizar al momento de realizar `update` de la mutación `CREATE_BOOK`.

### Fragmentos

Dentro del fichero `src/query.js` definimos un fragmento de GraphQL que reutilizarán las consultas/mutaciones que retornen el mismo tipo de dato:

```
...
/* Definiendo un fragmento podemos realizar consultas más compactas que retornen un mismo tipo de dato.
Definimos la constante `BOOK_DETAILS` que es un fragmento con alias `bookDetails` para el tipo definido `Book`.
 */
const BOOK_DETAILS = gql`
  #graphql
  fragment bookDetails on Book {
    author {
      bookCount
      born
      id
      name
    }
    genres
    id
    published
    title
  }
`;
...
export const BOOK_ADDED = gql`
  #graphql
  subscription {
    bookAdded {
      ...bookDetails # Con el 'Spread Operator' separamos todos los campos del fragmento.
    }
  }

  # Con el símbolo '$' junto a las llaves incluimos la constante "BOOK_DETAILS" que contiene el fragmento 'bookDetails' que necesitamos.
  ${BOOK_DETAILS}
`;
```
