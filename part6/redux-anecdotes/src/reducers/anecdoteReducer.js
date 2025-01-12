import { createSlice, current } from "@reduxjs/toolkit";
import anecdoteService from "../services/anecdotes";

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

// const anecdoteReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case "VOTE": {
//       const id = action.payload.id;
//       const anecdoteToVote = state.find((anecdote) => anecdote.id === id);
//       const votedAnecdote = {
//         ...anecdoteToVote,
//         votes: anecdoteToVote.votes + 1,
//       };
//       return state.map((anecdote) =>
//         anecdote.id !== id ? anecdote : votedAnecdote
//       );
//     }
//     case "NEW_ANECDOTE":
//       return [...state, action.payload];
//     default:
//       return state;
//   }
// };

// // Definimos un "action creator" que crea el objeto action que recibe como parámetro la función reducer personalizada.
// export const voteAnecdote = (id) => ({ type: "VOTE", payload: { id } });

// export const createAnecdote = (content) => ({
//   type: "NEW_ANECDOTE",
//   payload: asObject(content),
// });

/* El método "createSlice()" recibe como parámetro un objeto JavaScript:
    - "name" : Prefijo único que sirve para identificar al reducer. Lo usamos al momento de ejecutar una operación en el almacén de estados (store.dispatch({ type: "anecdotes/createAnecdote", payload: "content" })).
    - "initialState" : Valor inicial del estado.
    - "reducers" : Objeto JavaScript que contiene las funciones reducer personalizadas. Ya no dependemos de un "action creator" para especificar el tipo de operación "action.type" dado que la función reducer que ejecutemos lo hace por su cuenta (store.dispatch(createAnecdote("content")) === store.dispatch({ type: "anecdotes/createAnecdote", payload: "content" })).

La ejecución del método "createSlice()" devuelve un objeto del que podemos recuperar los reducers (anecdoteSlice.reducers) / actions creator (anecdoteSlice.actions).
*/
const anecdoteSlice = createSlice({
  name: "anecdotes",
  initialState: [],
  reducers: {
    // createAnecdote(state, action) {
    //   const content = action.payload;
    //   state.push(asObject(content)); // "Redux-toolkit" contiene la librería "Immer" que nos permite mutar el estado de objetos no primitivos. Cuando realicemos un ".push()" se producirá un estado inmutable a partir del estado mutado (no hace falta retornarlo). (mutar no es lo mismo que re-definir variables)
    // },
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
    appendAnecdote(state, action) {
      const anecdote = action.payload;
      state.push(anecdote);
    },
    setAnecdotes(state, action) {
      const anecdotes = action.payload;
      return anecdotes;
    },
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

export const initializeState = () => async (dispatch, getState) => {
  const anecdotes = await anecdoteService.getAll();
  dispatch(setAnecdotes(anecdotes));
};

export const createAnecdote = (content) => async (dispatch, getState) => {
  const newAnecdote = await anecdoteService.createNew(content);
  dispatch(appendAnecdote(newAnecdote));
};

export const voteAnecdote = (id) => async (dispatch, getState) => {
  const anecdoteToVote = getState().anecdotes.find(
    (anecdote) => anecdote.id === id
  );
  const votedAnecdote = { ...anecdoteToVote, votes: anecdoteToVote.votes + 1 };
  const updatedAnecdote = await anecdoteService.updateAnecdote(
    id,
    votedAnecdote
  );
  dispatch(changeAnecdote(updatedAnecdote));
};

export default anecdoteSlice.reducer;
