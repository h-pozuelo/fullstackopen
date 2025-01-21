/* Definimos una función reducer personalizada tal como lo haríamos en "Redux".
Debemos cumplir con lo de que sean funciones puras que no muten/modifiquen el estado recibido como parámetro sino que retornen un nuevo estado.
 */
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATION": {
      const message = action.payload;
      return message;
    }
    case "CLEAN_NOTIFICATION":
      return "";
    default:
      return state;
  }
};

export const setNotification = (message) => ({
  type: "SET_NOTIFICATION",
  payload: message,
});

export const cleanNotification = () => ({ type: "CLEAN_NOTIFICATION" });

export const setAndCleanNotification = ({ message, duration }, dispatch) => {
  dispatch(setNotification(message));
  setTimeout(() => {
    dispatch(cleanNotification());
  }, Number(duration * 1000));
};

export default notificationReducer;
