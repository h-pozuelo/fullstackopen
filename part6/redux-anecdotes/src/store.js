import { configureStore } from "@reduxjs/toolkit";
import anecdoteReducer from "./reducers/anecdoteReducer";
import filterReducer from "./reducers/filterReducer";
import notificationReducer from "./reducers/notificationReducer";

/* Con el método "configureStore()" construimos un almacén de estados pasándole como parámetro un objeto JavaScript con la propiedad "reducer".
En el interior de la propiedad "reducer" podemos simplemente pasar la función reducer personalizada o definir un objeto JavaScript en el que cada propiedad corresponda a una de las funciones reducer personalizadas (no tenemos que usar "combineReducers()").
*/
const store = configureStore({
  reducer: {
    anecdotes: anecdoteReducer,
    filter: filterReducer,
    notification: notificationReducer,
  },
});

export default store;
