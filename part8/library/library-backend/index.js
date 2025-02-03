// const { startStandaloneServer } = require("@apollo/server/standalone");
// const server = require("./app");
// const jwt = require("jsonwebtoken");
// const User = require("./models/users");

// // 4. Con la función "startStandaloneServer()" arrancamos el servidor Apollo con escucha en el puerto 4000. Es una operación asíncrona que retorna una "Promise" (el objeto retornado contiene una propiedad ".url" para acceder).
// startStandaloneServer(server, {
//   listen: { port: 4000 },
//   /* La propiedad `context` tiene una función callback que recibe como parámetro un objeto con la petición + respuesta (la des-estructuramos).
//   Lo que retorne la función callback se incluirá en el contexto.
//    */
//   context: async ({ req, res }) => {
//     const auth = req ? req.headers.authorization : null; // Si existe solicitud recuperamos la cabecera `Authorization`.

//     // Si existe cabecera `Authorization` que comience por "Bearer "...
//     if (auth && auth.startsWith("Bearer ")) {
//       const decodedToken = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
//       const currentUser = await User.findById(decodedToken.id); // Recuperamos de la base de datos el usuario para almacenarlo en el contexto.
//       return { currentUser };
//     }
//   },
// }).then(({ url }) => {
//   console.log(`Server ready at ${url}`);
// });

const startServer = require("./app");

startServer();
