import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

/* La función `setContext()` recibe como parámetro una función callback que a su vez recibe como parámetros la solicitud/operación a realizar junto al contexto previo. El valor que retorne la función callback será el nuevo contexto de cada operación.
 */
const authLink = setContext((request, previousContext) => {
  const token = window.localStorage.getItem("library-user-token"); // Recuperamos del almacén local el token del usuario (como es una cadena de texto no debemos transformarla de JSON a JavaScript).

  // El nuevo contexto posee como cabeceras las que tuviese anteriormente y la cabecera `Authorization` con el valor del token del usuario o `null`.
  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

// Construimos el link para acceder al servidor Apollo con el método `createHttpLink()` como lo haríamos con el constructor `new HttpLink()`.
const Link = createHttpLink({ uri: "http://localhost:4000" });

// Mediante el método `createClient()` proporcionado por la librería `Graphql-ws` creamos un cliente de WebSocket pasándole como parámetro un objeto con la URL. Dicho cliente lo pasamos como parámetro al constructor de `GraphQLWsLink` para construir un link.
const wsLink = new GraphQLWsLink(createClient({ url: "ws://localhost:4000" }));

/* La función `split()` permite construir un link dinámico para utilizar en el cliente Apollo.
Como 1º parámetro recibe una función callback que retorna un booleano (la función recibe la operación realizada, que des-estructuramos para recuperar la `query`). En función del resultado utilizada el `wsLink` (true) o el `httpLink` (false).
*/
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(Link)
);

/* Construimos un cliente de Apollo mediante la clase `ApolloClient`. El constructor recibe como parámetro un objeto con las propiedades:
    - "cache"
    - "link" : Dentro construimos un elemento `HttpLink` al que le pasamos como parámetro un objeto con la propiedad `uri` que corresponde a la URL del servidor Apollo.
*/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  // link: new HttpLink({ uri: "http://localhost:4000" }),
  // link: authLink.concat(Link), // Concatenamos la cabecera de autenticación con el link.
  link: splitLink, // Usamos el link dinámico que combina el `wsLink` con el `httpLink`.
});

/* Con el proveedor de Apollo permitimos que la aplicación acceda al cliente Apollo mediante el uso de los hooks:
    - "useQuery()" : Para realizar consultas inmediatas de obtención de datos.
    - "useLazyQuery()" : Para realizar consultas de obtención de datos en momentos específicos.
    - "useMutation()" : Para realizar operaciones de creación, modificación o eliminación.
*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
