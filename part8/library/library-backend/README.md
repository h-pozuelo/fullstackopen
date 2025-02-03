# library-backend

· `mkdir .\library-backend\`

· `cd .\library-backend\`

· `npm init`

· `npm install @apollo/server graphql graphql-tag --save`

Creamos el fichero `index.js`.

Dentro del fichero `package.json` definimos el script para arrancar el servidor Apollo.

# persons-backend

`mkdir .\example1\`

`cd .\example1\`

`npm init .\`

`npm install @apollo/server graphql graphql-tag --save`

Creamos el fichero `index.js`:

```
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: "3d599470-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: "3d599471-3436-11e9-bc57-8b80ba54c431",
  },
];

/* 1. Definimos el esquema GraphQL mediante la nomenclatura "gql`...`". Entre los acentos definimos cada uno de los tipos/modelos de la bbdd:
    - "type Person" : Dentro del objeto contiene cada propiedad del modelo (la exclamación "!" indica que no puede ser "null"). La propiedad "id" es de tipo "ID" (especial de GraphQL).
    - "type Query" : Cada propiedad especifica un nombre consulta; los parámetros que recibe (en caso de que sea necesario); el valor retornado.
 */
const typeDefs = gql`
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }
`;

/* 2. Declaramos un objeto que define como se debe responder a cada consulta GraphQL:

(La consulta "query { personCount }" respondería con "3")
*/
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    // Los resolutores reciben hasta 4 parámetros (obj, args, context, info) ("https://the-guild.dev/graphql/tools/docs/resolvers#resolver-function-signature").
    findPerson: (root, args) => persons.find((p) => p.name === args.name),
  },
};

// 3. Construimos el servidor Apollo pasándole como parámetro un objeto con las definiciones de los tipos junto a los resolutores:
const server = new ApolloServer({ typeDefs, resolvers });

// 4. Con la función "startStandaloneServer()" arrancamos el servidor Apollo con escucha en el puerto 4000. Es una operación asíncrona que retorna una "Promise" (el objeto retornado contiene una propiedad ".url" para acceder).
startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

Dentro del fichero `package.json` definimos el script para arrancar el servidor Apollo:

```
{
  ...,
  "scripts": {
    ...,
    "start": "node index.js"
  },
  ...
}
```

Iniciamos el servidor Apollo:

· `npm start`

Cuando realizamos una consulta a `findPerson(name: String!)` el servidor Apollo resuelve correctamente los campos de la persona (debido a su resolutor predeterminado).

Dentro del fichero `index.js` definimos resolutores personalizados para los campos del usuario:

```
...
const resolvers = {
  ...,
  /* 5. Los resolutores predeterminados devuelven el valor del campo correspondiente del objeto.
  Podemos definir por ejemplo que todas las personas recuperadas posean como dirección "Manhattan New York".
   */
  Person: {
    name: (root) => root.name,
    phone: (root) => root.phone,
    street: (root) => "Manhattan",
    city: (root) => "New York",
    id: (root) => root.id,
  },
};
...
```

Dentro del fichero `index.js` modificamos el esquema para que el tipo `Person` posea una propiedad del tipo `Address`:

```
...
const typeDefs = gql`
  #graphql
  type Address {
    street: String!
    city: String!
  }

  type Person {
    ...
    # 6. El esquema de "Person" ahora contiene un objeto de tipo "Address" en vez de sus campos separados.
    address: Address!
    ...
  }
  ...
`;
...
```

Cuando realicemos una consulta que requiera la dirección de la persona:

```
query {
    findPerson(name: "Arto Hellas") {
        phone
        address {
            city
            street
        }
    }
}
```

Dentro del fichero `index.js` podemos construir un resolutor personalizado para el campo `address` del tipo `Person`:

```
...
const resolvers = {
  ...
  Person: {
    ...,
    // street: (root) => "Manhattan",
    // city: (root) => "New York",
    ...,
    // 7. Sin un resolutor personalizado las consultas tan solo retornarían la persona de la lista de personas (ahí no tienen una propiedad "address", sino dos propiedades: "street", "city"). En el esquema hemos definido el campo "address" de tipo "Address" así que construimos un objeto con las propiedades que espera recibir.
    address: (root) => ({ street: root.street, city: root.city }),
  },
};
...
```

## Mutaciones

Instalamos la librería `Uuid` para crear identificadores únicos:

· `npm install uuid --save`

Dentro del fichero `index.js`:

```
...
const { v1: uuid } = require("uuid");
...
const typeDefs = gql`
  ...
  # 8. Definimos dentro del esquema un tipo "Mutation" para poder realizar las operaciones CREATE, UPDATE o DELETE. La mutación "mutation { addPerson(...) }" recibe como parámetros los que posee el tipo "Person" (sin incluir el "id"); retorna el objeto "Person" creado.
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person # Si la operación no es existosa retorna "null".
  }
`;
...
const resolvers = {
  ...,
  Mutation: {
    // 9. Definimos un resolutor personalizado para construir una nueva persona a partir de los valores recibidos como parámetros.
    addPerson: (root, args) => {
      const person = { ...args, id: uuid() };
      persons = persons.concat(person);
      return person;
    },
  },
};
...
```

### Modificación de un número de teléfono

Dentro del fichero `index.js`:

```
...
const typeDefs = gql`
  ...
  type Mutation {
    ...
    # 14. Definimos una mutación para modificar el número de teléfono de una persona.
    editNumber(name: String!, phone: String!): Person
  }
`;
...
const resolvers = {
  ...,
  Mutation: {
    ...,
    // 15. Definimos un resolutor personalizado para modificar el número de teléfono de una persona.
    editNumber: (root, args) => {
      const { name, phone } = args;
      const person = persons.find((p) => p.name === name);
      if (!person) return null; // Si la persona con dicho nombre no existe retornamos "null".

      const updatedPerson = { ...person, phone };
      persons = persons.map((p) => (p.name !== name ? p : updatedPerson));
      return updatedPerson;
    },
  },
};
...
```

## Manejo de errores

Dentro del fichero `index.js`:

```
...
const { GraphQLError } = require("graphql");
...
const resolvers = {
  ...,
  Mutation: {
    ...
    addPerson: (root, args) => {
      // 10. Bloqueamos con un error personalizado la adición de personas con el mismo nombre.
      if (persons.find((p) => p.name === args.name))
        throw new GraphQLError("Name must be unique", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name },
        });
      ...
    },
  },
};
...
```

## Enumerables

Dentro del fichero `index.js` definimos para la consulta `allPersons()` una manera de filtrar personas en función de si poseen o no un número de teléfono:

```
...
const typeDefs = gql`
  ...
  # 11. Definimos dentro del esquema el enumerable "YesNo".
  enum YesNo {
    YES
    NO
  }

  type Query {
    ...
    # 12. La consulta "allPersons()" ahora puede recibir (o no) como parámetro un enumerable "YesNo".
    allPersons(phone: YesNo): [Person!]!
    ...
  }
  ...
`;
...
const resolvers = {
  Query: {
    ...,
    allPersons: (root, args) => {
      // 13. Si no recibe como parámetro un enumerable retorna la lista completa.
      if (!args.phone) return persons;
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;
      return persons.filter(byPhone);
    },
    ...
  },
  ...
};
...
```

# Mongoose y Apollo

Instalamos la librería de `Dotenv` para poder definir variables de entorno accesibles dentro del fichero `.env`:

· `npm install dotenv --save`

Creamos el fichero `.env`:

```
MONGODB_URI=mongodb+srv://hugopmempleo:<db_password>@cluster0.u24mb.mongodb.net/libraryApp?retryWrites=true&w=majority&appName=Cluster0
```

Instalamos la librería `Mongoose` para poder conectarnos e interactuar con la bbdd:

· `npm install mongoose --save-dev`

Creamos el fichero `utils/config.js`:

```
require("dotenv").config(); // Configuramos el acceso al fichero `.env` para poder recuperar variables de entorno.

const MONGODB_URI = process.env.MONGODB_URI; // Recuperamos la URI de la bbdd mediante variables de entorno.

module.exports = { MONGODB_URI };
```

Creamos el modelo `models/books.js`:

```
const mongoose = require("mongoose"); // Importamos la librería de `Mongoose`.

/* Con el constructor de `mongoose.Schema()` creamos un esquema para el modelo `Book`.

El constructor recibe como parámetro un objeto en el que cada una de sus propiedades coincide con un campo del modelo.

Cada propiedad del objeto puede recibir una cadena de texto que define el tipo de dato (por ejemplo, `String`) o un objeto que define el tipo, si es requerido, si es único, etc...
*/
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, minlength: 2 },
  published: { type: Number },
  // El esquema de `Book` contiene el campo `author` que hace referencia a un autor existente en la bbdd.
  author: {
    type: mongoose.Schema.Types.ObjectId, // Es de tipo `ObjectId` (no una cadena de texto).
    ref: "Author", // Contiene el nombre del modelo al que hace referencia.
  },
  genres: [{ type: String }],
});

// // ¡IMPORTANTE! No necesitamos modificar el método `toJSON` puesto que GraphQL de manera automática transforma la propiedad `._id` del objeto a la propiedad `.id`.
// bookSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

module.exports = mongoose.model("Book", bookSchema); // Exportamos un modelo personalizado que utilizaremos para manipular elementos de la colección/entidad `Books` (plural de `Book`).
```

Creamos el modelo `models/authors.js`:

```
const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minlenght: 4 },
  born: { type: Number },
});

module.exports = mongoose.model("Author", authorSchema);
```

Trasladamos la aplicación al fichero `app.js`.

Dentro del fichero `index.js`:

```
const { startStandaloneServer } = require("@apollo/server/standalone");
const server = require("./app");

// 4. Con la función "startStandaloneServer()" arrancamos el servidor Apollo con escucha en el puerto 4000. Es una operación asíncrona que retorna una "Promise" (el objeto retornado contiene una propiedad ".url" para acceder).
startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

Dentro del fichero `app.js`:

```
...
const mongoose = require("mongoose");
const { MONGODB_URI } = require("./utils/config");
const Book = require("./models/books");
const Author = require("./models/authors");

mongoose.set("strictQuery", false);

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
...
const typeDefs = gql`
  ...
  type Book {
    ...
    # author: String!
    author: Author! # Hemos definido en el esquema del modelo "Book" que el campo "author" hace referencia a un elemento existente en la colección "Authors".
    ...
  }
  ...
`;
...
const resolvers = {
  Query: {
    ...
    bookCount: async () => await Book.collection.countDocuments(),
    ...
    authorCount: async () => await Author.collection.countDocuments(),
    ...
    allBooks: async (obj, { author, genre }) => {
      if (!author && !genre) return await Book.find({}).populate("author");
      return await Book.find({ genres: genre }).populate("author");
    },
    ...
    allAuthors: async () => await Author.find({}),
  },
  Mutation: {
    ...
    addBook: async (obj, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      const book = new Book({ ...args, author: author });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Creating book failed", {
          extensions: { code: "BAD_USER_INPUT", error },
        });
      }

      return book; // La mutación retorna un nuevo elemento de tipo `Book` (el `id` se encuentra incluido en el objeto retornado).
    },
    ...
    editAuthor: async (obj, { name, setBornTo }) => {
      const author = await Author.findOne({ name: name });
      author.born = setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError(`Editing birthyear failed`, {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: setBornTo, error },
        });
      }

      return author; // La mutación retorna el elemento de tipo `Author` modificado.
    },
  },
  ...
};
...
```

Los resolutores realizan operaciones asíncronas al tener que comunicarse con la base de datos. Devuelven el resultado de la `Promise`.

## Usuario e inicio de sesión

Instalamos la librería de `Jsonwebtoken`:

· `npm install jsonwebtoken --save`

Creamos el modelo `models/user.js`:

```
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  favouriteGenre: { type: String, required: true, minlength: 3 },
});

module.exports = mongoose.model("User", userSchema);
```

Dentro del fichero `app.js`:

```
...
const typeDefs = gql`
  ...
  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    ...
    me: User # Si no le pasamos la cabecera "Authorization" deberá retornar "null".
  }

  type Mutation {
    ...
    createUser(username: String!, favouriteGenre: String!): User # Puede retornar "null" si el nombre de usuario no es válido.
    login(username: String!): Token # Puede retornar "null" como la anterior mutación.
  }
`;
...
```

Generamos un secreto para utilizar en los JWT:

· `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Dentro del fichero `.env`:

```
...
JWT_SECRET=<secret>
```

Dentro del fichero `app.js`:

```
...
const User = require("./models/user");
const jwt = require("jsonwebtoken");
...
const resolvers = {
  ...,
  Mutation: {
    ...,
    createUser: async (obj, args) => {
      const user = new User({ ...args });

      try {
        await user.save();
      } catch (error) {
        throw new GraphQLError("Creating the user failed", {
          extensions: { code: "BAD_USER_INPUT", error },
        });
      }

      return user;
    },
    login: async (obj, args) => {
      const user = await User.findOne({ username: args.username });

      // Si el usuario no existe o la contraseña enviada como parámetro no es "secret"...
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Construimos el "payload" que va a contener el JWT.
      const userForToken = {
        username: user.username,
        favouriteGenre: user.favouriteGenre,
        id: user._id, // Para acceder al identificador utilizamos la propiedad `._id` dado que aún no ha sido transformado a `toJSON`.
      };

      // Debemos retornar un objeto de tipo `Token` definido en los tipos de GraphQL.
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  ...
};
...
```

### Context

Dentro del fichero `index.js`:

```
...
const jwt = require("jsonwebtoken");
const User = require("./models/users");
...
startStandaloneServer(server, {
  ...,
  /* La propiedad `context` tiene una función callback que recibe como parámetro un objeto con la petición + respuesta (la des-estructuramos).
  Lo que retorne la función callback se incluirá en el contexto.
   */
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null; // Si existe solicitud recuperamos la cabecera `Authorization`.

    // Si existe cabecera `Authorization` que comience por "Bearer "...
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id); // Recuperamos de la base de datos el usuario para almacenarlo en el contexto.
      return { currentUser };
    }
  },
}).then(({ url }) => {
  ...
});
```

Dentro del fichero `app.js`:

```
...
const resolvers = {
  Query: {
    ...,
    me: (obj, args, context) => context.currentUser,
  },
  Mutation: {
    ...
    addBook: async (obj, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      ...
    },
    ...
    editAuthor: async (obj, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      ...
    },
    ...
  },
  ...
};
...
```

# Fragmentos y suscripciones

## Suscripciones en el servidor

Seguimos los siguientes tutoriales para implementar suscripciones dentro del servidor Apollo:

- `https://www.apollographql.com/docs/apollo-server/api/express-middleware`
- `https://www.apollographql.com/docs/apollo-server/data/subscriptions`

Re-distribuimos la aplicación:

- `utils/config.js` : Contiene el acceso a las variables de entorno.
- `schema.js` : Dentro hemos trasladado la definición de tipos de GraphQL.
- `resolvers.js` : Dentro hemos trasladado los resolutores.
- `app.js` : Dentro hemos trasladado todo lo relacionado con el servidor Apollo (salvo la inicialización que se mantiene en el fichero `index.js`).

### Configurando el middleware de express.js

Instalamos las librerías de `Express` y `Cors`:

· `npm install express --save`
· `npm install cors --save`

Dentro del fichero `app.js`:

```
const { ApolloServer } = require("@apollo/server");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@apollo/server/express4");

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

// Dado que para crear el servidor Express.js primero debemos arrancar el servidor Apollo (es una operación asíncrona) debemos definir una función asíncrona que arranque tanto el servidor Apollo como el servidor Express.js.
const start = async () => {
  const app = express(); // Construimos el servidor Express.js

  const httpServer = http.createServer(app); // Creamos un servidor HTTP para manejar las solicitudes entrantes al servidor Express.js.

  // 3. Construimos el servidor Apollo pasándole como parámetro un objeto con las definiciones de los tipos junto a los resolutores:
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Pasamos a la lista de plugins el plugin de `ApolloServerPluginDrainHttpServer` que permitirá detener correctamente el servidor HTTP pasado como parámetro.
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: httpServer })],
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
  });
};

module.exports = start;
```

Dentro del fichero `index.js`:

```
const startServer = require("./app");

startServer();
```

### Habilitando las suscripciones

Instalamos las librerías de `Graphql-ws`, `ws` y `@graphql-tools/schema`:

· `npm install graphql-ws --save`
· `npm install ws --save`
· `npm install @graphql-tools/schema`

Dentro del fichero `app.js`:

```
...
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");
...
const start = async () => {
  ...
  // Construimos un servidor de WebSocket pasándole al constructor un objeto con las propiedades `server` (servidor de solicitudes HTTP) y `path` (ruta en donde se va a levantar el servidor).
  const wsServer = new WebSocketServer({ server: httpServer, path: "/" });

  // Creamos una instancia de `GraphQLSchema` ejecutable. Cuando creemos el servidor Apollo recibirá la instancia ejecutable en vez de los parámetros `typeDefs` y `resolvers` por separado.
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Arrancamos el servidor de WebSocket mediante el método `useServer()` que recibe como parámetros un objeto con la instancia del esquema ejecutable junto al servidor de WebSocket. El objeto retornado lo utilizaremos para realizar un drenado al detener servicios.
  const serverCleanup = useServer({ schema: schema }, wsServer);
  ...
  const server = new ApolloServer({
    ...
    schema: schema,
    ...
    plugins: [
      ...,
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
  ...
  httpServer.listen(PORT, () => {
    ...
    console.log(`Subscriptions ready at http://localhost:${PORT}`);
  });
};
...
```

Dentro del fichero `schema.js`:

```
...
const typeDefs = gql`
  ...
  type Subscription {
    bookAdded: Book! # Cuando un libro es creado la suscripción publicará una notificación a todos los clientes que se encuentren suscritos (el dato incluirá el nuevo libro creado).
  }
`;
...
```

Instalamos la librería de `Graphql-subscriptions`:

· `npm install graphql-subscriptions --save`

Dentro del fichero `resolvers.js`:

```
...
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
...
const resolvers = {
  ...,
  Mutation: {
    ...
    addBook: async (obj, args, { currentUser }) => {
      ...
      /* Siguiendo el principio de `publicar-suscribir` publicamos una notificación con nombre `BOOK_ADDED` y `payload` `{ bookAdded: book }` a todos los clientes suscritos.
       */
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      ...
    },
    ...
  },
  ...,
  Subscription: {
    // El resolutor para la suscripción `bookAdded` contiene un objeto con la propiedad `subscribe` que posee una función callback que retorna un iterador asíncrono.
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator(["BOOK_ADDED"]),
    },
  },
};
...
```

## Suscripciones en el cliente

Continuamos en el cliente...

## Problema del n+1

Dentro del fichero `app.js` habilitamos el modo de depuración de Mongoose:

```
...
mongoose.set("debug", true);
...
```

Dentro del fichero `schema.js` definimos la propiedad `friendOf` para el tipo `Person`:

```
...
const typeDefs = gql`
  ...
  type Person {
    ...
    friendOf: [User!]!
  }
  ...
`;
...
```

Dentro del fichero `resolvers.js` definimos el resolutor personalizado para la propiedad `friendOf` del tipo `Person`:

```
...
const resolvers = {
  ...,
  Person: {
    ...,
    friendOf: async (obj) => {
      // Recuperamos todos aquellos usuarios en los que el identificador de la persona actual aparezca en la propiedad `User.friends`.
      const friends = await User.find({ friends: { $in: [obj._id] } });

      return friends;
    },
  },
  ...
};
...
```

El problema es que se realizan múltiples llamadas a la base de datos por cada usuario que se encuentre dentro de la lista `friends`.

Para evitar realizar tantas llamadas a la base de datos una alternativa sería haber definido la propiedad `friendsOf` en el esquema Mongoose del tipo `Person` que hiciese referencia a tipo `User` de Mongoose. Después utilizariamos el método `.poblate("friendsOf")` para hacer un inner join que recupere los usuarios a los que el identificador hace referencia.
