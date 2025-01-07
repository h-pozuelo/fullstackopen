import axios from "axios";
/* Dentro de `vite.config.js` hemos especificado que cualquier solicitud a una ruta que comience por "/api" va a ser re-enviada a "http://localhost:3003/api".
 */
const baseUrl = "/api/login";

/* El método "login()" recibe como parámetro el objeto "credentials" que consta de las propiedades: "{ username: String, password: String }".

La solicitud HTTP POST retorna un objeto almacenado en la propiedad "response.data" que consta de las propiedades: "{ username: String, name: String, token: String }".
 */
const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};

export default { login };
