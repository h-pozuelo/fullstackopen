# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# redux-anecdotes

`mkdir .\redux-anecdotes\`

`cd .\redux-anecdotes\`

`npm create vite@latest . -- -- --template react`

`npm install`

`npm install redux`

`npm install react-redux`

## `src/reducers/anecdoteReducer.js`

```
// Definimos una lista de anécdotas que usaremos posteriormente para mapearlas como objetos.
const anecdotesAtStart = [
  "If it hurts, do it more often",
  "Adding manpower to a late software project makes it later!",
  "The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Premature optimization is the root of all evil.",
  "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
];

const generateId = () => Number((Math.random() * 100000).toFixed(0));

// Función callback que usaremos al momento de mapear la lista de anécdotas para transformarlas en objetos JavaScript.
const asObject = (anecdote) => ({
  content: anecdote,
  id: generateId(),
  votes: 0,
});

const initialState = anecdotesAtStart.map(asObject); // Mapeamos las anécdotas a objetos.

const anecdoteReducer = (state = initialState, action) => {
  switch (action.type) {
    case "VOTE": {
      const id = action.payload.id;
      const anecdoteToVote = state.find((anecdote) => anecdote.id === id);
      const votedAnecdote = {
        ...anecdoteToVote,
        votes: anecdoteToVote.votes + 1,
      };
      return state.map((anecdote) =>
        anecdote.id !== id ? anecdote : votedAnecdote
      );
    }
    case "NEW_ANECDOTE":
      return [...state, action.payload];
    default:
      return state;
  }
};

// Definimos un "action creator" que crea el objeto action que recibe como parámetro la función reducer personalizada.
export const voteAnecdote = (id) => ({ type: "VOTE", payload: { id } });

export const createAnecdote = (content) => ({
  type: "NEW_ANECDOTE",
  payload: asObject(content),
});

export default anecdoteReducer;
```

## `src/main.jsx`

```
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { legacy_createStore as createStore } from "redux";
import anecdoteReducer from "./reducers/anecdoteReducer";
import { Provider } from "react-redux";

// Construimos un almacen de estados a partir de la función reducer personalizada.
const store = createStore(anecdoteReducer);

// Mediante el proveedor de contexto de "React-redux" damos acceso al almacen de estados a cualquier componente de la aplicación.
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

## `src/components/`

### `AnecdoteList.jsx`

```
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { voteAnecdote } from "../reducers/anecdoteReducer";

const Anecdote = ({ anecdote, handleClick }) => {
  return (
    <div>
      {anecdote.content}
      <br />
      has {anecdote.votes}
      <button onClick={handleClick}>vote</button>
    </div>
  );
};

const AnecdoteList = () => {
  // El hook "useDispatch()" nos proporciona acceso al almacén de estados para realizar operaciones (actions) sobre él (en vez de ejecutar directamente el método "store.dispatch()" lo hacemos a través del hook "useDispatch()").
  const dispatch = useDispatch();
  // El hook "useSelector()" permite recuperar del almacén de estados un estado en concreto. En este caso estamos recuperando el estado al completo (podríamos filtrar el parámetro "state" para recuperar únicamente aquellas anécdotas con un valor de votos superior a X).
  const anecdotes = useSelector((state) => state);

  const sortedAnecdotes = anecdotes.sort((a, b) => b.votes - a.votes);

  const vote = (id) => {
    dispatch(voteAnecdote(id));
  };

  return (
    <div>
      <h2>Anecdotes</h2>
      {sortedAnecdotes.map((anecdote) => (
        <Anecdote
          key={anecdote.id}
          anecdote={anecdote}
          handleClick={() => vote(anecdote.id)}
        />
      ))}
    </div>
  );
};

export default AnecdoteList;
```

### `AnecdotesForm.jsx`

```
import React from "react";
import { useDispatch } from "react-redux";
import { createAnecdote } from "../reducers/anecdoteReducer";

const AnecdoteForm = () => {
  const dispatch = useDispatch();

  const addAnecdote = (event) => {
    event.preventDefault();
    const content = event.target.anecdote.value;
    event.target.anecdote.value = "";
    dispatch(createAnecdote(content));
  };

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addAnecdote}>
        <input type="text" name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default AnecdoteForm;
```

## `src/App.jsx`

```
import React from "react";
import AnecdoteList from "./components/AnecdoteList";
import AnecdoteForm from "./components/AnecdoteForm";

const App = () => {
  return (
    <div>
      <AnecdoteList />
      <AnecdoteForm />
    </div>
  );
};

export default App;
```

## Combinando múltiples reducers

### `src/reducers/filterReducer.js`

```
// Construimos otra función reducer personalizada; esta vez manejará el estado del filtro.
const filterReducer = (state = "", action) => {
  switch (action.type) {
    case "SET_FILTER":
      return action.payload;
    default:
      return state;
  }
};

// Definimos el "action creator" para construir el objeto "action" que recibe el "reducer".
export const filterChange = (filter) => ({
  type: "SET_FILTER",
  payload: filter,
});

export default filterReducer;
```

### `src/main.jsx`

```
...
import { combineReducers, legacy_createStore as createStore } from "redux";
...
import filterReducer from "./reducers/filterReducer.js";

/* Para combinar los "reducers" debemos utilizar el método "combineReducers()".
La función recibe como parámetro un objeto JavaScript en el que cada propiedad corresponde a uno de los "reducers".

Cuando recuperemos el almacen de estados al completo retornará un objeto JavaScript con dos propiedades (anecdotes: una lista de anécdotas; filter: una cadena de texto).
Eso quiere decir que, por ejemplo, para recuperar la lista de anécdotas con el hook "useSelector()" debemos de recuperar "useSelector((state) => state.anecdotes)".
*/
const reducers = combineReducers({
  anecdotes: anecdoteReducer,
  filter: filterReducer,
});

// Construimos un almacen de estados a partir de la función reducer personalizada.
const store = createStore(reducers);
...
```

### `src/components/Filter.jsx`

```
import React from "react";
import { useDispatch } from "react-redux";
import { filterChange } from "../reducers/filterReducer";

const Filter = () => {
  const dispatch = useDispatch();

  const handleChange = ({ target }) => {
    const filter = target.value;
    dispatch(filterChange(filter));
  };

  const style = { marginBottom: 10 };

  return (
    <div style={style}>
      filter <input type="text" onChange={handleChange} />
    </div>
  );
};

export default Filter;
```

### `src/components/AnecdoteList.jsx`

```
...
import Filter from "./Filter";
...
const AnecdoteList = () => {
  ...
  const anecdotes = useSelector(({ anecdotes, filter }) => {
    const re = new RegExp(filter, "i");
    return anecdotes.filter((anecdote) => re.test(anecdote.content));
  });
  ...
};
...
```

## Redux Toolkit

`npm install @reduxjs/toolkit`

### `src/store.js`

```
import { configureStore } from "@reduxjs/toolkit";
import anecdoteReducer from "./reducers/anecdoteReducer";
import filterReducer from "./reducers/filterReducer";

/* Con el método "configureStore()" construimos un almacén de estados pasándole como parámetro un objeto JavaScript con la propiedad "reducer".
En el interior de la propiedad "reducer" podemos simplemente pasar la función reducer personalizada o definir un objeto JavaScript en el que cada propiedad corresponda a una de las funciones reducer personalizadas (no tenemos que usar "combineReducers()").
*/
const store = configureStore({
  reducer: {
    anecdotes: anecdoteReducer,
    filter: filterReducer,
  },
});

export default store;
```

### `src/main.jsx`

```
...
// import { combineReducers, legacy_createStore as createStore } from "redux";
// import anecdoteReducer from "./reducers/anecdoteReducer";
...
// import filterReducer from "./reducers/filterReducer.js";
import store from "./store.js";
...
// const reducers = combineReducers({
//   anecdotes: anecdoteReducer,
//   filter: filterReducer,
// });
...
// const store = createStore(reducers);
...
```

### `src/reducers/anecdoteReducer.js`

```
import { createSlice, current } from "@reduxjs/toolkit";
...
/* El método "createSlice()" recibe como parámetro un objeto JavaScript:
    - "name" : Prefijo único que sirve para identificar al reducer. Lo usamos al momento de ejecutar una operación en el almacén de estados (store.dispatch({ type: "anecdotes/createAnecdote", payload: "content" })).
    - "initialState" : Valor inicial del estado.
    - "reducers" : Objeto JavaScript que contiene las funciones reducer personalizadas. Ya no dependemos de un "action creator" para especificar el tipo de operación "action.type" dado que la función reducer que ejecutemos lo hace por su cuenta (store.dispatch(createAnecdote("content")) === store.dispatch({ type: "anecdotes/createAnecdote", payload: "content" })).

La ejecución del método "createSlice()" devuelve un objeto del que podemos recuperar los reducers (anecdoteSlice.reducers) / actions creator (anecdoteSlice.actions).
*/
const anecdoteSlice = createSlice({
  name: "anecdotes",
  initialState,
  reducers: {
    createAnecdote(state, action) {
      const content = action.payload;
      state.push(asObject(content)); // "Redux-toolkit" contiene la librería "Immer" que nos permite mutar el estado de objetos no primitivos. Cuando realicemos un ".push()" se producirá un estado inmutable a partir del estado mutado (no hace falta retornarlo). (mutar no es lo mismo que re-definir variables)
    },
    voteAnecdote(state, action) {
      const id = action.payload;
      const anecdoteToVote = state.find((anecdote) => anecdote.id === id);
      const votedAnecdote = { ...anecdoteToVote, votes: anecdoteToVote.votes + 1 };
      console.log(current(state)); // Con "current()" podemos imprimir el estado actual de un tipo no primitivo.
      return state.map((anecdote) =>
        anecdote.id !== id ? anecdote : votedAnecdote
      );
    },
  },
});

export const { createAnecdote, voteAnecdote } = anecdoteSlice.actions;

export default anecdoteSlice.reducer;
```

### `src/reducers/filterReducer.js`

```
import { createSlice } from "@reduxjs/toolkit";

const filterSlice = createSlice({
  name: "filter",
  initialState: "",
  reducers: {
    filterChange(state, action) {
      const filter = action.payload;
      return filter;
    },
  },
});

export const { filterChange } = filterSlice.actions;

export default filterSlice.reducer;
```

### Sistema de notificaciones

#### `src/reducers/notificationReducer.js`

```
import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: "",
  reducers: {
    setMessage(state, action) {
      const message = action.payload;
      return message;
    },
    cleanMessage(state, action) {
      return "";
    },
  },
});

export const { setMessage, cleanMessage } = notificationSlice.actions;

export default notificationSlice.reducer;
```

#### `src/store.js`

```
...
import notificationReducer from "./reducers/notificationReducer";
...
const store = configureStore({
  reducer: {
    ...,
    notification: notificationReducer,
  },
});
...
```

#### `src/components/Notification.jsx`

```
import React from "react";
import { useSelector } from "react-redux";

const Notification = () => {
  const style = { border: "solid", padding: 10, borderWidth: 1 };

  const notification = useSelector((state) => state.notification);

  if (!notification) return null;

  return <div style={style}>{notification}</div>;
};

export default Notification;
```

#### `src/components/AnecdoteList.jsx`

```
...
import Notification from "./Notification";
import { cleanMessage, setMessage } from "../reducers/notificationReducer";
...
const AnecdoteList = () => {
  ...
  const vote = (id, content) => {
    dispatch(voteAnecdote(id));

    dispatch(setMessage(`you voted '${content}'`));
    setTimeout(() => dispatch(cleanMessage()), 5000);
  };

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

#### `src/components/AnecdoteForm.jsx`

```
...
import { cleanMessage, setMessage } from "../reducers/notificationReducer";

const AnecdoteForm = () => {
  ...
  const addAnecdote = (event) => {
    ...
    dispatch(setMessage(`you created '${content}'`));
    setTimeout(() => dispatch(cleanMessage()), 5000);
  };
  ...
};
...
```

## Comunicación con el backend

`npm install json-server --save-dev`

Dentro de `package.json`:

```
{
  ...,
  "scripts": {
    ...,
    "server": "json-server -p 3001 --watch db.json"
  },
  ...
}
```

Creamos el fichero `db.json`.

`npm install axios --save`

Creamos el servicio `src/services/anecdotes.js`:

```
import axios from "axios";

const baseUrl = "http://localhost:3001/anecdotes";

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const createNew = async (content) => {
  const object = { content, votes: 0 };
  const response = await axios.post(baseUrl, object);
  return response.data;
};

export default { getAll, createNew };
```

Dentro de `src/reducers/anecdoteReducer.js`:

```
...
const anecdoteSlice = createSlice({
  ...,
  initialState: [],
  reducers: {
    ...,
    appendAnecdote(state, action) {
      const anecdote = action.payload;
      state.push(anecdote);
    },
    setAnecdotes(state, action) {
      const anecdotes = action.payload;
      return anecdotes;
    },
  },
});

export const { createAnecdote, voteAnecdote, appendAnecdote, setAnecdotes } =
  anecdoteSlice.actions;
...
```

Dentro de `src/App.jsx`:

```
...
import { useDispatch } from "react-redux";
import anecdoteService from "./services/anecdotes";
import { setAnecdotes } from "./reducers/anecdoteReducer";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const anecdotes = await anecdoteService.getAll();
      dispatch(setAnecdotes(anecdotes));
    };

    fetchData();
  }, []);
  ...
};
...
```

Dentro de `src/components/AnecdoteForm.jsx`:

```
...
import { appendAnecdote, createAnecdote } from "../reducers/anecdoteReducer";
...
import anecdoteService from "../services/anecdotes";

const AnecdoteForm = () => {
  ...
  const addAnecdote = async (event) => {
    ...
    const newAnecdote = await anecdoteService.createNew(content);
    dispatch(appendAnecdote(newAnecdote));
    ...
  };
  ...
};
...
```

## Redux Thunk

### Action creator asíncrono para recuperar datos del backend

Dentro de `src/reducers/anecdoteReducer.js`:

```
...
import anecdoteService from "../services/anecdotes";
...
export const initializeState = () => async (dispatch, getState) => {
  const anecdotes = await anecdoteService.getAll();
  dispatch(setAnecdotes(anecdotes));
};
...
```

Dentro de `src/App.jsx`:

```
...
import { initializeState, setAnecdotes } from "./reducers/anecdoteReducer";

const App = () => {
  ...
  useEffect(() => {
    const fetchData = async () => {
      // const anecdotes = await anecdoteService.getAll();
      // dispatch(setAnecdotes(anecdotes));

      dispatch(initializeState());
    };
    ...
  }, []);
  ...
};
...
```

### Action creator asíncrono para crear nuevas anécdotas en el backend

Dentro de `src/reducers/anecdoteReducer.js`:

```
...
const anecdoteSlice = createSlice({
  ...,
  initialState: [],
  reducers: {
    // createAnecdote(state, action) {
    //   const content = action.payload;
    //   state.push(asObject(content)); // "Redux-toolkit" contiene la librería "Immer" que nos permite mutar el estado de objetos no primitivos. Cuando realicemos un ".push()" se producirá un estado inmutable a partir del estado mutado (no hace falta retornarlo). (mutar no es lo mismo que re-definir variables)
    // },
    ...
  },
});

export const { voteAnecdote, appendAnecdote, setAnecdotes } =
  anecdoteSlice.actions;
...
export const createAnecdote = (content) => async (dispatch, getState) => {
  const newAnecdote = await anecdoteService.createNew(content);
  dispatch(appendAnecdote(newAnecdote));
};
...
```

Dentro de `src/components/AnecdoteForm.jsx`:

```
...
import { appendAnecdote, createAnecdote } from "../reducers/anecdoteReducer";
...
const AnecdoteForm = () => {
  ...
  const addAnecdote = async (event) => {
    ...
    // const newAnecdote = await anecdoteService.createNew(content);
    // dispatch(appendAnecdote(newAnecdote));

    dispatch(createAnecdote(content));
    ...
  };
  ...
};
...
```

### Action creator asíncrono para actualizar anécdotas existentes del backend

Dentro de `src/services/anecdotes.js`:

```
...
const updateAnecdote = async (id, newObject) => {
  const response = await axios.put(`${baseUrl}/${id}`, newObject);
  return response.data;
};

export default { getAll, createNew, updateAnecdote };
```

Dentro de `src/reducers/anecdoteReducer.js`:

```
...
const anecdoteSlice = createSlice({
  ...,
  reducers: {
    ...,
    // voteAnecdote(state, action) {
    //   const id = action.payload;
    //   const anecdoteToVote = state.find((anecdote) => anecdote.id === id);
    //   const votedAnecdote = {
    //     ...anecdoteToVote,
    //     votes: anecdoteToVote.votes + 1,
    //   };
    //   console.log(current(state)); // Con "current()" podemos imprimir el estado actual de un tipo no primitivo.
    //   return state.map((anecdote) =>
    //     anecdote.id !== id ? anecdote : votedAnecdote
    //   );
    // },
    ...,
    changeAnecdote(state, action) {
      const changedAnecdote = action.payload;
      return state.map((anecdote) =>
        anecdote.id !== changedAnecdote.id ? anecdote : changedAnecdote
      );
    },
  },
});

export const { appendAnecdote, setAnecdotes, changeAnecdote } =
  anecdoteSlice.actions;
...
export const voteAnecdote = (id) => async (dispatch, getState) => {
  const anecdoteToVote = getState().find((anecdote) => anecdote.id === id);
  const votedAnecdote = { ...anecdoteToVote, votes: anecdoteToVote.votes + 1 };
  const updatedAnecdote = await anecdoteService.updateAnecdote(
    id,
    votedAnecdote
  );
  dispatch(changeAnecdote(updatedAnecdote));
};
...
```

### Action creator mejorado para mostrar/ocultar la notificación

Dentro de `src/reducers/notificationReducer.js`:

```
...
export const setNotification =
  (message, duration) => async (dispatch, getState) => {
    dispatch(setMessage(message));
    setTimeout(() => {
      dispatch(cleanMessage());
    }, Number(duration * 1000));
  };
...
```

Dentro de `src/components/AnecdoteForm.jsx`:

```

```

Dentro de `src/components/AnecdoteForm.jsx`:

```
...
import {
  cleanMessage,
  setMessage,
  setNotification,
} from "../reducers/notificationReducer";
...
const AnecdoteForm = () => {
  ...
  const addAnecdote = async (event) => {
    ...
    // dispatch(setMessage(`you created '${content}'`));
    // setTimeout(() => dispatch(cleanMessage()), 5000);

    dispatch(setNotification(`you created '${content}'`, 5));
  };
  ...
};
...
```

Dentro de `src/components/AnecdoteList.jsx`:

```
...
import {
  cleanMessage,
  setMessage,
  setNotification,
} from "../reducers/notificationReducer";
...
const AnecdoteList = () => {
  ...
  const vote = (id, content) => {
    ...
    // dispatch(setMessage(`you voted '${content}'`));
    // setTimeout(() => dispatch(cleanMessage()), 5000);

    dispatch(setNotification(`you voted '${content}'`, 5));
  };
  ...
};
...
```
