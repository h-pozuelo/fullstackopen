# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# query-anecdotes

· `mkdir .\query-anecdotes\`

· `cd .\query-anecdotes\`

· `npm create vite@latest . -- -- --template react`

· `npm install`

· `code .\`

Instalamos la librería `json-server` para simular un servidor web:

· `npm install json-server@0.17.4 --save-dev`

(https://github.com/typicode/json-server/issues/1557)

Creamos el fichero `server.js` para personalizar nuestro servidor web:

```
import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const validator = (request, response, next) => {
  console.log();

  const { content } = request.body;

  if (request.method === "POST" && (!content || content.length < 5)) {
    return response.status(400).json({
      error: "too short anecdote, must have length 5 or more",
    });
  } else {
    next();
  }
};

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(validator);
server.use(router);

server.listen(3001, () => {
  console.log("JSON Server is running");
});
```

Dentro de `package.json` definimos el script para arrancar el servidor web:

```
{
  ...,
  "scripts": {
    ...,
    "server": "node server.js"
  },
  ...
}
```

Creamos el fichero `db.json`.

## Servicio de solicitudes HTTP

Instalamos la librería `axios` para poder realizar solicitudes HTTP al servidor web:

· `npm install axios --save`

Creamos el servicio `src/services/anecdotes.js`:

```
import axios from "axios";

const baseUrl = "http://localhost:3001/anecdotes";

const getAllAnecdotes = async () => (await axios.get(baseUrl)).data;

const createAnecdote = async (newAnecdote) =>
  (await axios.post(baseUrl, newAnecdote)).data;

const updateAnecdote = async (updatedAnecdote) =>
  (await axios.put(`${baseUrl}/${updatedAnecdote.id}`, updatedAnecdote)).data;

export default { getAllAnecdotes, createAnecdote, updateAnecdote };
```

## React Query

Instalamos la librería `@tanstack/react-query` para poder manejar estados del servidor web en el cliente:

· `npm install @tanstack/react-query --save`

Dentro de `src/main.jsx` definimos un cliente de consultas (`QueryClient`) que proveeremos en toda la aplicación con el componente `<QueryClientProvider>`:

```
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// La clase "QueryClient" nos permite construir un cliente que actuará como el contexto propuesto por el proveedor "<QueryClientProvider>".
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

(Con `Redux` utilizábamos la librería `react-redux` para contener la aplicación en un proveedor de almacenes de estados. Lo anterior es parecido)

### useQuery hook : Almacenando la lista de anecdotas en cache

Dentro de `src/App.jsx`:

```
import { useQuery } from "@tanstack/react-query";
import React from "react";
import anecdoteService from "./services/anecdotes";

const App = () => {
  /* El hook "useQuery()" recibe como parámetro un objeto con las propiedades:
      - "queryKey" : Clave que identifica a la consulta. Para definir la clave la rodeamos por corchetes ([]).
      - "queryFn" : Función callback que se va a ejecutar. La información devuelta por la función callback es almacenada en la propiedad ".data" del objeto retornado por el hook "useQuery()".

  El hook "useQuery()" devuelve un objeto con propiedades como ".status", ".isLoading", ".data", ... (es como una promesa)
  */
  const result = useQuery({
    queryKey: ["anecdotes"],
    queryFn: anecdoteService.getAllAnecdotes,
  });

  const anecdotes = result.data; // La consulta "result" tiene en la propiedad ".data" la lista de anécdotas recuperadas del servidor web.

  return (
    <div>
      <h3>Anecdote app</h3>

      <ul>
        {anecdotes &&
          anecdotes.map((anecdote) => (
            <li key={anecdote.id}>
              {anecdote.content}
              <br />
              has {anecdote.votes}
              <button>vote</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;
```

### useMutation hook : Creación de nuevas anécdotas

Creamos el componente `src/components/AnecdoteForm.jsx`:

```
import React from "react";

const AnecdoteForm = ({ newAnecdoteMutation }) => {
  const onCreate = (event) => {
    event.preventDefault();
    const content = event.target.anecdote.value;
    event.target.anecdote.value = "";
    newAnecdoteMutation.mutate({ content, votes: 0 });
  };

  return (
    <>
      <h3>create new</h3>

      <form onSubmit={onCreate}>
        <input type="text" name="anecdote" />
        <button type="submit">create</button>
      </form>
    </>
  );
};

export default AnecdoteForm;
```

Dentro del componente `src/App.jsx` definimos con el hook `useMutation()` un mutador para realizar operaciones CREATE en el `QueryClient`:

```
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
...
import AnecdoteForm from "./components/AnecdoteForm";

const App = () => {
  /* Con el hook "useQueryClient()" recuperamos el cliente pasado como contexto por el proveedor `<QueryClientProvider>` en el fichero `src/main.jsx`.
  De esta manera podremos manipular los valores de cada clave (ej. ["anecdotes"]).
   */
  const queryClient = useQueryClient();

  /* Para realizar operaciones como CREATE, UPDATE o DELETE debemos utilizar el hook "useMutation()". El hook recibe como parámetro un objeto con las propiedades:
      - "mutationFn" : Función callback que va a poder ser ejecutada mediante el método ".mutate()" que posee el objeto retornado al crear el "mutator" (newAnecdoteMutation.mutate()).
      - "onSuccess" : Función callback que se ejecuta cuando se completa con éxito la operación. Podemos especificar que reciba un parámetro que será el valor retornado por la función callback "mutationFn".

  Para poder ejecutar la operación llamamos al método "newAnecdoteMutation.mutate()" pasándole como parámetro el objeto que esperaría la función "anecdoteService.createAnecdote()".
  */
  const newAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.createAnecdote,
    onSuccess: (newAnecdote) => {
      // Recuperamos del cliente el valor de la clave ["anecdotes"].
      const currentAnecdotes = queryClient.getQueryData(["anecdotes"]);
      // Re-definimos el valor de la clave ["anecdotes"] concatenando la nueva anécdota.
      queryClient.setQueryData(
        ["anecdotes"],
        currentAnecdotes.concat(newAnecdote)
      );
    },
  });
  ...
  return (
    <div>
      ...
      <AnecdoteForm newAnecdoteMutation={newAnecdoteMutation} />
      ...
    </div>
  );
};
...
```

### useMutation hook : Votación de anécdotas

Dentro del componente `src/App.jsx`:

```
...
const App = () => {
  ...
  const updateAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.updateAnecdote,
    onSuccess: (updatedAnecdote) => {
      const currentAnecdotes = queryClient.getQueryData(["anecdotes"]);
      queryClient.setQueryData(
        ["anecdotes"],
        currentAnecdotes.map((anecdote) =>
          anecdote.id !== updatedAnecdote.id ? anecdote : updatedAnecdote
        )
      );
    },
  });
  ...
  const handleVote = (anecdote) => {
    const votedAnecdote = { ...anecdote, votes: anecdote.votes + 1 };
    updateAnecdoteMutation.mutate(votedAnecdote);
  };

  return (
    <div>
      ...
      <ul>
        {anecdotes &&
          anecdotes.map((anecdote) => (
            <li key={anecdote.id}>
              ...
              <button onClick={() => handleVote(anecdote)}>vote</button>
            </li>
          ))}
      </ul>
    </div>
  );
};
...
```

## React Context

### Creando el contexto

Creamos el fichero `src/contexts/NotificationContext.jsx`:

```
import React from "react";
import { createContext } from "react";

// Con el método "createContext()" construimos un contexto.
const NotificationContext = createContext();

// Creamos un componente personalizado (para proveer el contexto) que recibe como prop "children" (son el contenido que se encuentra en el interior de las etiquetas "<NotificationContextProvider>[...]</NotificationContextProvider>").
export const NotificationContextProvider = ({ children }) => {
  // Para acceder al proveedor del contexto creado renderizamos su propiedad ".Provider".
  return (
    <NotificationContext.Provider>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
```

Dentro de `src/main.jsx` incluimos el proveedor de contexto:

```
...
import { NotificationContextProvider } from "./contexts/NotificationContext.jsx";
...
ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <NotificationContextProvider>
      {/* <App /> === children */}
      <App />
    </NotificationContextProvider>
  </QueryClientProvider>
);
```

### useReducer hook : Función reducer personalizada para establecer mensajes de notificación

Dentro del contexto `src/contexts/NotificationContext.jsx` definimos una función reducer personalizada que consumiremos posteriormente con el hook `useReducer()`:

```
...
import { useReducer } from "react";
...
/* Definimos una función reducer personalizada tal como lo haríamos en "Redux".
Debemos cumplir con lo de que sean funciones puras que no muten/modifiquen el estado recibido como parámetro sino que retornen un nuevo estado.
 */
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATION":
      return action.payload;
    case "CLEAN_NOTIFICATION":
      return "";
    default:
      return state;
  }
};
...
export const NotificationContextProvider = ({ children }) => {
  /* El hook "useReducer()" recibe como parámetros la función reducer personalizada además de un valor de estado inicial.
  Des-estructuramos el valor retornado tal como lo haríamos al utilizar el hook "useState()".
   */
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    ""
  );

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
...
import { useContext } from "react";
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

Creamos el componente `src/components/Notification.jsx`:

```
import React from "react";
import { useNotificationValue } from "../contexts/NotificationContext";

const Notification = () => {
  // Consumimos el contexto mediante el hook personalizado "useNotificationValue()" (retorna el valor del estado recuperado de la consumición del contexto con el hook "useContext(NotificationContext)").
  const message = useNotificationValue();

  const style = {
    border: "solid",
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
  };

  if (!message) return null;

  return <div style={style}>{message}</div>;
};

export default Notification;
```

Dentro del componente `src/App.jsx`:

```
...
import Notification from "./components/Notification";
import { useNotificationDispatch } from "./contexts/NotificationContext";

const App = () => {
  ...
  // Con el hook personalizado "useNotificationDispatch()" recuperación la función dispatch para realizar operaciones con el reducer (debemos enviar como parámetro un objeto "action = { type, payload }").
  const notificationDispatch = useNotificationDispatch();

  const newAnecdoteMutation = useMutation({
    ...,
    onSuccess: (newAnecdote) => {
      ...
      notificationDispatch({
        type: "SET_NOTIFICATION",
        payload: `anecdote '${newAnecdote.content}' created`,
      });
      setTimeout(
        () => notificationDispatch({ type: "CLEAN_NOTIFICATION" }),
        5000
      );
    },
  });

  const updateAnecdoteMutation = useMutation({
    ...,
    onSuccess: (updatedAnecdote) => {
      ...
      notificationDispatch({
        type: "SET_NOTIFICATION",
        payload: `anecdote '${updatedAnecdote.content}' voted`,
      });
      setTimeout(
        () => notificationDispatch({ type: "CLEAN_NOTIFICATION" }),
        5000
      );
    },
  });
  ...
  return (
    <div>
      ...
      <Notification />
      ...
    </div>
  );
};
...
```

### Controlando errores al momento de realizar la solicitud HTTP POST

Dentro del componente `src/App.jsx`:

```
...
const App = () => {
  ...
  const newAnecdoteMutation = useMutation({
    ...
    /* Si no cumplimos con los requerimientos para crear nuevas anécdotas (mínimo 5 caracteres) se producirá una excepción al momento de realizar la solicitud HTTP POST.
    La función callback en "onError" recibe como parámetro el objeto de error (podemos des-estructurarlo para acceder a la respuesta de la solicitud HTTP POST).
     */
    onError: ({ response }) => {
      const error = response.data.error;
      notificationDispatch({ type: "SET_NOTIFICATION", payload: error });
      setTimeout(
        () => notificationDispatch({ type: "CLEAN_NOTIFICATION" }),
        5000
      );
    },
  });
  ...
};
...
```
