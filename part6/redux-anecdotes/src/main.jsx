import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// import { combineReducers, legacy_createStore as createStore } from "redux";
// import anecdoteReducer from "./reducers/anecdoteReducer";
import { Provider } from "react-redux";
// import filterReducer from "./reducers/filterReducer.js";
import store from "./store.js";

// /* Para combinar los "reducers" debemos utilizar el método "combineReducers()".
// La función recibe como parámetro un objeto JavaScript en el que cada propiedad corresponde a uno de los "reducers".

// Cuando recuperemos el almacen de estados al completo retornará un objeto JavaScript con dos propiedades (anecdotes: una lista de anécdotas; filter: una cadena de texto).
// Eso quiere decir que, por ejemplo, para recuperar la lista de anécdotas con el hook "useSelector()" debemos de recuperar "useSelector((state) => state.anecdotes)".
// */
// const reducers = combineReducers({
//   anecdotes: anecdoteReducer,
//   filter: filterReducer,
// });

// // Construimos un almacen de estados a partir de la función reducer personalizada.
// const store = createStore(reducers);

// Mediante el proveedor de contexto de "React-redux" damos acceso al almacen de estados a cualquier componente de la aplicación.
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
