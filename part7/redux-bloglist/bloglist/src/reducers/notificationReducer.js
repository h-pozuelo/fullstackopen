import { createSlice } from "@reduxjs/toolkit";

// /* Función reducer personalizada que recibe como parámetros:
//     - "state" : Estado inicial del reducer personalizado.
//     - "action" : Objeto con las propiedades: "type", que define la operación a realizar; "payload", información adicional que puede ser necesaria para realizar la operación.

// Con un condicional "switch" en función del tipo de operación retornamos un estado diferente.

// Los reducers son funciones puras e inmutables (no retornan un estado manipulado sino un nuevo estado).
// */
// const notificationReducer = (state = "", action) => {
//   switch (action.type) {
//     case "SET_NOTIFICATION": {
//       const message = action.payload;
//       return message;
//     }
//     case "CLEAN_NOTIFICATION":
//       return "";
//     default:
//       return state;
//   }
// };

// /* Definimos "action creators" personalizados (crean el objeto "action" que espera recibir como parámetro la función reducer personalizada) para que el componente de React no necesite construirlo.
//  */
// export const setNotification = (message) => ({
//   type: "SET_NOTIFICATION",
//   payload: message,
// });

// export const cleanNotification = () => ({ type: "CLEAN_NOTIFICATION" });

/* El método "createSlice()" recibe como parámetro un objeto JavaScript:
    - "name" : Prefijo único que sirve para identificar al reducer. Lo usamos al momento de ejecutar una operación en el almacén de estados (store.dispatch({ type: "notification/setNotification", payload: "message" })).
    - "initialState" : Valor inicial del estado.
    - "reducers" : Objeto JavaScript que contiene las funciones reducer personalizadas. Ya no dependemos de un "action creator" para especificar el tipo de operación "action.type" dado que la función reducer que ejecutemos lo hace por su cuenta (store.dispatch(setNotification("message")) === store.dispatch({ type: "notification/setNotification", payload: "message" })).

La ejecución del método "createSlice()" devuelve un objeto del que podemos recuperar los reducers (anecdoteSlice.reducers) / actions creator (anecdoteSlice.actions).
*/
const notificationSlice = createSlice({
  name: "notification",
  initialState: "",
  reducers: {
    setNotification(state, action) {
      const message = action.payload;
      return message;
    },
    cleanNotification(state, action) {
      return "";
    },
  },
});

export const { setNotification, cleanNotification } = notificationSlice.actions;

export const setAndCleanNotification =
  (message, duration) => async (dispatch, getState) => {
    dispatch(setNotification(message));
    setTimeout(() => {
      dispatch(cleanNotification());
    }, Number(duration * 1000));
  };

export default notificationSlice.reducer;
