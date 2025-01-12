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
