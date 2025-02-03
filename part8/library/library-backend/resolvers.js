const { GraphQLError, subscribe } = require("graphql");
const { v1: uuid } = require("uuid");
const jwt = require("jsonwebtoken");

const Book = require("./models/books");
const Author = require("./models/authors");
const User = require("./models/users");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

/* 2. Declaramos un objeto que define como se debe responder a cada consulta GraphQL:

(La consulta "query { bookCount }" respondería con "7")
*/
const resolvers = {
  Query: {
    // bookCount: () => books.length,
    bookCount: async () => await Book.collection.countDocuments(),
    // authorCount: () => authors.length,
    authorCount: async () => await Author.collection.countDocuments(),
    // // Los resolutores reciben hasta 4 parámetros (obj, args, context, info) ("https://the-guild.dev/graphql/tools/docs/resolvers#resolver-function-signature").
    // allBooks: (obj, { author, genre }) => {
    //   if (!author && !genre) return books;
    //   const byAuthor = (book) => (!author ? true : book.author === author);
    //   const byGenre = (book) => (!genre ? true : book.genres.includes(genre));
    //   return books.filter(byAuthor).filter(byGenre);
    // },
    allBooks: async (obj, { author, genre }) => {
      if (!author && !genre) return await Book.find({}).populate("author");
      return await Book.find({ genres: genre }).populate("author");
    },
    // allAuthors: () => authors,
    allAuthors: async () => await Author.find({}),
    me: (obj, args, context) => context.currentUser,
  },
  Mutation: {
    // addBook: (obj, args) => {
    //   if (!authors.find((author) => author.name === args.author))
    //     authors = authors.concat({ name: args.author, id: uuid() });

    //   const book = { ...args, id: uuid() };
    //   books = books.concat(book);
    //   return book;
    // },
    addBook: async (obj, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

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

      /* Siguiendo el principio de `publicar-suscribir` publicamos una notificación con nombre `BOOK_ADDED` y `payload` `{ bookAdded: book }` a todos los clientes suscritos.
       */
      pubsub.publish("BOOK_ADDED", { bookAdded: book });

      return book; // La mutación retorna un nuevo elemento de tipo `Book` (el `id` se encuentra incluido en el objeto retornado).
    },
    // editAuthor: (obj, { name, setBornTo }) => {
    //   const author = authors.find((author) => author.name === name);
    //   if (!author)
    //     throw new GraphQLError("Author doesn't exist", {
    //       extensions: { code: "BAD_USER_INPUT", invalidArgs: name },
    //     });

    //   const updatedAuthor = { ...author, born: setBornTo };
    //   authors = authors.map((author) =>
    //     author.id !== updatedAuthor.id ? author : updatedAuthor
    //   );
    //   return updatedAuthor;
    // },
    editAuthor: async (obj, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

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
  Author: {
    // bookCount: (obj) => books.filter((b) => b.author === obj.name).length,
    bookCount: async (obj) =>
      await Book.find({ author: obj._id }).countDocuments(),
  },
  Subscription: {
    // El resolutor para la suscripción `bookAdded` contiene un objeto con la propiedad `subscribe` que posee una función callback que retorna un iterador asíncrono.
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
