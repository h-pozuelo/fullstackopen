# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# unicafe-redux

Comenzamos creando la aplicación que va a poseer su propio almacén de estados (store/state):
· `mkdir .\unicafe-redux\`
· `cd .\unicafe-redux\`
· `npm create vite@latest . -- -- --template react`
· `npm install`

## Test Driven Development

Instalamos las librerías necesarias para poder ejecutar tests unitarios en nuestra aplicación:
· `npm install vitest --save-dev`
· `npm install jsdom --save-dev`
· `npm install @testing-library/react --save-dev`
· `npm install @testing-library/jest-dom --save-dev`

Dentro de `package.json` definimos el script para ejecutar los tests unitarios:

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

Creamos en la raíz de la aplicación `testSetup.js` la plantilla base que va a tomar como referencia los tests unitarios:

```
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});
```

Dentro del fichero `vite.config.js` definimos los ajustes por defecto de los tests unitarios:

```
...
export default defineConfig({
  ...,
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./testSetup.js",
  },
});
```

Instalamos el paquete `eslint-plugin-vitest-globals` para que "ESLint" no muestre advertencias en los tests unitarios:
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

## Redux

Instalamos la librería "Redux" para manejar el estado de nuestra aplicación:
· `npm install redux`

Creamos la función reducer personalizada `src/reducers/reducer.js` que va a usar el almacén de estados:

```
const initialState = {
  good: 0,
  ok: 0,
  bad: 0,
};

const counterReducer = (state = initialState, action) => {
  console.log(action);
  switch (action.type) {
    case "GOOD":
      return state;
    case "OK":
      return state;
    case "BAD":
      return state;
    case "ZERO":
      return state;
    default:
      return state;
  }
};

export default counterReducer;
```

Dentro de `src/main.jsx` implementamos el almacen de estados:

```
import React from "react";
import ReactDOM from "react-dom/client";

import reducer from "./reducers/reducer";
import { legacy_createStore as createStore } from "redux";

const store = createStore(reducer);

const App = () => {
  const good = () => {
    store.dispatch({ type: "GOOD" });
  };

  return (
    <div>
      <button onClick={good}>good</button>
      <button>ok</button>
      <button>bad</button>
      <button>reset stats</button>
      <div>good {store.getState().good}</div>
      <div>ok</div>
      <div>bad</div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const renderApp = () => {
  root.render(<App />);
};

renderApp();
store.subscribe(renderApp);
```

### Test Driven Development

Instalamos la librería `Deep-freeze` para poder verificar en los tests unitarios que nuestra función reducer personalizada ha sido definida como una función pura/inmutable (que no modifica el estado recibido como parámetro sino que retorna un nuevo estado que reemplazará al previo):
· `npm install deep-freeze --save-dev`

Creamos el fichero de pruebas `src/reducers/reducer.test.js`:

```
import { test } from "vitest";
import counterReducer from "./reducer";
import deepFreeze from "deep-freeze";

describe("unicafe reducer", () => {
  // Definimos un estado inicial que sea el mismo que se encuentra dentro de `src/reducers/reducer.js`.
  const initialState = { good: 0, ok: 0, bad: 0 };

  test("should return a proper initial state when called with undefined state", () => {
    const state = {};
    const action = { type: "DO_NOTHING" };

    /* Si no enviamos como parámetro un estado la función reducer personalizada debería de utilizar el estado inicial declarado al comienzo.
    La acción no se encuentra contemplada en el "switch" por lo que accede al "default".
    */
    const newState = counterReducer(undefined, action);
    expect(newState).toEqual(initialState);
  });

  test("good is incremented", () => {
    const state = initialState;
    const action = { type: "GOOD" };

    /* Con la función `deepFreeze()` podemos apuntar un manejador de eventos al estado. Si el estado es modificado lanza una excepción provocando la invalidez del test unitario.
     */
    deepFreeze(state);
    const newState = counterReducer(state, action);
    expect(newState).toEqual({ ...state, good: state.good + 1 });
  });

  test("ok is incremented", () => {
    const state = initialState;
    const action = { type: "OK" };

    deepFreeze(state);
    const newState = counterReducer(state, action);
    expect(newState).toEqual({ ...state, ok: state.ok + 1 });
  });

  test("bad is incremented", () => {
    const state = initialState;
    const action = { type: "BAD" };

    deepFreeze(state);
    const newState = counterReducer(state, action);
    expect(newState).toEqual({ ...state, bad: state.bad + 1 });
  });

  test("return initial state with action ZERO", () => {
    const state = { good: 6, ok: 4, bad: 2 };
    const action = { type: "ZERO" };

    deepFreeze(state);
    const newState = counterReducer(state, action);
    expect(newState).toEqual(initialState);
  });
});
```

Dentro de `src/reducers/reducer.js`:

```
const initialState = {
  good: 0,
  ok: 0,
  bad: 0,
};

/* Una función reducer recibe como parámetros:
    - "state" : El valor inicial del estado (en este caso un objeto con 3 propiedades).
    - "action" : Un objeto que contiene las propiedades "type" (operación que va a llevar a cabo la función reducer); "payload" (opcional, información necesaria para llevar a cabo la operación).
*/
const counterReducer = (state = initialState, action) => {
  console.log(action);
  switch (action.type) {
    case "GOOD":
      /* Para poder cumplir con una función pura/inmutable nunca debemos retornar el estado recibido como parámetro modificado. En vez de eso retornamos un nuevo estado a partir del recibido como parámetro pero modificandole la propiedad necesaria.
       */
      return { ...state, good: state.good + 1 }; // Con el "Spread Operator" hemos creado un nuevo estado a partir de la des-estructuración de las propiedades del previo.
    case "OK":
      return { ...state, ok: state.ok + 1 };
    case "BAD":
      return { ...state, bad: state.bad + 1 };
    case "ZERO":
      return initialState;
    default:
      return state;
  }
};

export default counterReducer;
```

Dentro de `src/main.jsx`:

```
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
```
