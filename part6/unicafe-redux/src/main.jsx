import React from "react";
import ReactDOM from "react-dom/client";

import reducer from "./reducers/reducer";
import { legacy_createStore as createStore } from "redux";

// Nunca ejecutamos directamente "counterReducer()". Lo hacemos a través del método "store.dispatch()" que recibe como parámetro el objeto "action" ({ type: "", payload?: {} }).
const store = createStore(reducer);

const App = () => {
  const good = () => {
    store.dispatch({ type: "GOOD" }); // Incrementa en 1 la propiedad "good" del estado.
  };
  const ok = () => {
    store.dispatch({ type: "OK" }); // Incrementa en 1 la propiedad "ok" del estado.
  };
  const bad = () => {
    store.dispatch({ type: "BAD" }); // Incrementa en 1 la propiedad "bad" del estado.
  };
  const reset = () => {
    store.dispatch({ type: "ZERO" }); // Restablece los valores del estado a su estado inicial.
  };

  return (
    <div>
      <button onClick={good}>good</button>
      <button onClick={ok}>ok</button>
      <button onClick={bad}>bad</button>
      <button onClick={reset}>reset stats</button>
      <div>good {store.getState().good}</div>
      <div>ok {store.getState().ok}</div>
      <div>bad {store.getState().bad}</div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const renderApp = () => {
  root.render(<App />);
};

renderApp(); // Renderizamos por primera vez la aplicación para poder acceder a ella.
/* Cuando nos suscribimos al almacen de estados cada vez que el valor del estado cambie se ejecutará la función callback que le pasemos como parámetro (en este caso "renderApp()").
 */
store.subscribe(renderApp);
