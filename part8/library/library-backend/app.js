const { ApolloServer } = require("@apollo/server");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");

const http = require("http");

const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const User = require("./models/users");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const { MONGODB_URI } = require("./utils/config");

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
    process.exit(1);
  });

// let authors = [
//   {
//     name: "Robert Martin",
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: "Martin Fowler",
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963,
//   },
//   {
//     name: "Fyodor Dostoevsky",
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821,
//   },
//   {
//     name: "Joshua Kerievsky", // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   {
//     name: "Sandi Metz", // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
 */

// let books = [
//   {
//     title: "Clean Code",
//     published: 2008,
//     author: "Robert Martin",
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Agile software development",
//     published: 2002,
//     author: "Robert Martin",
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ["agile", "patterns", "design"],
//   },
//   {
//     title: "Refactoring, edition 2",
//     published: 2018,
//     author: "Martin Fowler",
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Refactoring to patterns",
//     published: 2008,
//     author: "Joshua Kerievsky",
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "patterns"],
//   },
//   {
//     title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
//     published: 2012,
//     author: "Sandi Metz",
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "design"],
//   },
//   {
//     title: "Crime and punishment",
//     published: 1866,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "crime"],
//   },
//   {
//     title: "Demons",
//     published: 1872,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "revolution"],
//   },
// ];

/*
    you can remove the placeholder query once your first one has been implemented 
  */

// Dado que para crear el servidor Express.js primero debemos arrancar el servidor Apollo (es una operación asíncrona) debemos definir una función asíncrona que arranque tanto el servidor Apollo como el servidor Express.js.
const start = async () => {
  const app = express(); // Construimos el servidor Express.js

  const httpServer = http.createServer(app); // Creamos un servidor HTTP para manejar las solicitudes entrantes al servidor Express.js.

  // Construimos un servidor de WebSocket pasándole al constructor un objeto con las propiedades `server` (servidor de solicitudes HTTP) y `path` (ruta en donde se va a levantar el servidor).
  const wsServer = new WebSocketServer({ server: httpServer, path: "/" });

  // Creamos una instancia de `GraphQLSchema` ejecutable. Cuando creemos el servidor Apollo recibirá la instancia ejecutable en vez de los parámetros `typeDefs` y `resolvers` por separado.
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Arrancamos el servidor de WebSocket mediante el método `useServer()` que recibe como parámetros un objeto con la instancia del esquema ejecutable junto al servidor de WebSocket. El objeto retornado lo utilizaremos para realizar un drenado al detener servicios.
  const serverCleanup = useServer({ schema: schema }, wsServer);

  // 3. Construimos el servidor Apollo pasándole como parámetro un objeto con las definiciones de los tipos junto a los resolutores:
  const server = new ApolloServer({
    // typeDefs,
    // resolvers,
    schema: schema,
    // Pasamos a la lista de plugins el plugin de `ApolloServerPluginDrainHttpServer` que permitirá detener correctamente el servidor HTTP pasado como parámetro.
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: httpServer }),
      // Le pasamos un 2º elemento a la lista de plugins que será un objeto con una función callback asíncrona que retorna a su vez otro objeto con otra función callback asíncrona que ejecuta el drenado del servidor de WebSocket.
      {
        serverWillStart: async () => ({
          drainServer: async () => {
            await serverCleanup.dispose();
          },
        }),
      },
    ],
  });

  await server.start(); // Antes de implementar el middleware de `expressMiddleware()` en el servidor Express.js debemos arrancar el servidor Apollo.

  // Cuando definimos la ruta de la aplicación Express.js los parámetros a continuación son los middlewares para esa misma ruta.
  app.use(
    "/",
    cors(),
    express.json(),
    // El middleware de `expressMiddleware()` recibe parámetros parecidos al método `startStandaloneServer()` (`server: ApolloServer` + `options` en donde definimos el contexto).
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;

        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.slice(7),
            process.env.JWT_SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );

  const PORT = 4000;

  // Arrancamos el servidor de Express.js para que escuche por el puerto "4000".
  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
    console.log(`Subscriptions ready at http://localhost:${PORT}`);
  });
};

module.exports = start;
