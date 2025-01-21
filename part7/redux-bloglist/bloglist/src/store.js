import { combineReducers, legacy_createStore as createStore } from "redux";
import notificationReducer from "./reducers/notificationReducer";
import blogReducer from "./reducers/blogReducer";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";

// /* Para combinar los "reducers" debemos utilizar el método "combineReducers()".
// La función recibe como parámetro un objeto JavaScript en el que cada propiedad corresponde a uno de los "reducers".

// Cuando recuperemos el almacen de estados al completo retornará un objeto JavaScript con dos propiedades (notification: un mensaje de notificación; filter: una lista de publicaciones).
// Eso quiere decir que, por ejemplo, para recuperar la lista de publicaciones con el hook "useSelector()" debemos de recuperar "useSelector((state) => state.blogs)".
// */
// const reducers = combineReducers({
//   notification: notificationReducer,
//   blogs: blogReducer,
// });

// // Construimos un almacén de estados a partir de la función reducer personalizada.
// const store = createStore(reducers);

/* Con el método "configureStore()" construimos un almacén de estados pasándole como parámetro un objeto JavaScript con la propiedad "reducer".
En el interior de la propiedad "reducer" podemos simplemente pasar la función reducer personalizada o definir un objeto JavaScript en el que cada propiedad corresponda a una de las funciones reducer personalizadas (no tenemos que usar "combineReducers()").
*/
const store = configureStore({
  reducer: {
    notification: notificationReducer,
    blogs: blogReducer,
    user: userReducer,
  },
});

export default store;
