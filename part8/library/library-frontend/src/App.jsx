import React, { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import { useApolloClient, useLazyQuery, useSubscription } from "@apollo/client";
import Recommended from "./components/Recommended";
import { BOOK_ADDED, CURRENT_USER, FIND_BOOKS } from "./query";

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
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null); // Guardamos en el estado de la aplicación el token del usuario que ha iniciado sesión.
  const [errorMessage, setErrorMessage] = useState(null);
  const client = useApolloClient(); // Con el hook `useApolloClient()` recuperamos el cliente propuesto por el proveedor `<ApolloProvider>`.

  const [currentUser, setCurrentUser] = useState(null);
  const [getCurrentUser, currentUserResult] = useLazyQuery(CURRENT_USER);

  useEffect(() => {
    if (currentUserResult.data) {
      setCurrentUser(currentUserResult.data.me);
      window.localStorage.setItem(
        "library-current-user",
        JSON.stringify(currentUserResult.data.me)
      );
    }
  }, [currentUserResult]);

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

      // // Como cuando utilizabamos la propiedad `update: (cache, response) => { ... }`.
      // client.cache.updateQuery({ query: FIND_BOOKS }, ({ allBooks }) => ({
      //   allBooks: allBooks.concat(addedBook),
      // }));

      updateCache(client.cache, { query: FIND_BOOKS }, addedBook);
    },
  });

  // Cada vez que el componente sea renderizado comprobamos si el usuario ha iniciado sesión.
  useEffect(() => {
    const loggedUser = window.localStorage.getItem("library-user-token");
    if (loggedUser) {
      setToken(loggedUser);

      setCurrentUser(
        JSON.parse(window.localStorage.getItem("library-current-user"))
      );
    }
  }, []);

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  const login = (value) => {
    setToken(value);
    setPage("authors");
  };

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("library-user-token");
    client.resetStore(); // Limpiamos la caché del cliente Apollo.
    setPage("authors");

    window.localStorage.removeItem("library-current-user");
    setCurrentUser(null);
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("addBook")}>addBook</button>
            <button onClick={() => setPage("recommended")}>recommended</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Notification errorMessage={errorMessage} />

      <Authors show={page === "authors"} />
      <Books show={page === "books"} />
      <NewBook show={page === "addBook"} />
      <LoginForm
        setToken={login}
        setError={notify}
        show={page === "login"}
        getCurrentUser={getCurrentUser}
      />
      <Recommended currentUser={currentUser} show={page === "recommended"} />
    </div>
  );
};

const Notification = ({ errorMessage }) => {
  const style = { color: "red" };

  if (!errorMessage) return null;

  return <div style={style}>{errorMessage}</div>;
};

export default App;
