import React from "react";
import { useContext } from "react";
import { useReducer } from "react";
import { createContext } from "react";

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

// Con el método "createContext()" construimos un contexto.
const NotificationContext = createContext();

// Creamos un componente personalizado (para proveer el contexto) que recibe como prop "children" (son el contenido que se encuentra en el interior de las etiquetas "<NotificationContextProvider>[...]</NotificationContextProvider>").
export const NotificationContextProvider = ({ children }) => {
  /* El hook "useReducer()" recibe como parámetros la función reducer personalizada además de un valor de estado inicial.
  Des-estructuramos el valor retornado tal como lo haríamos al utilizar el hook "useState()".
   */
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    ""
  );

  // Para acceder al proveedor del contexto creado renderizamos su propiedad ".Provider".
  return (
    <>
      {/* Para proveer el contexto utilizamos el atributo "value" (proveeremos la lista). */}
      <NotificationContext.Provider
        value={[notification, notificationDispatch]}
      >
        {children}
      </NotificationContext.Provider>
    </>
  );
};

export const useNotificationValue = () => {
  const notificationAndDispatch = useContext(NotificationContext);
  return notificationAndDispatch[0]; // El 1º elemento del contexto corresponde al valor del estado.
};

export const useNotificationDispatch = () => {
  const notificationAndDispatch = useContext(NotificationContext);
  return notificationAndDispatch[1]; // El 2º elemento del contexto corresponde a la función "dispatch()" para realizar operaciones con el reducer.
};

export default NotificationContext;
