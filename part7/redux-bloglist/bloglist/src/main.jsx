import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store.js";

/* Mediante el proveedor de "React-redux" proporcionamos acceso al almacén de estados en toda la aplicación.
 */
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
