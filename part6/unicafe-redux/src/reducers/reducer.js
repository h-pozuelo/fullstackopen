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
