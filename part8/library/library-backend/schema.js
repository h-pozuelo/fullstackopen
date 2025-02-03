const { gql } = require("graphql-tag");

/* 1. Definimos el esquema GraphQL mediante la nomenclatura "gql`...`". Entre los acentos definimos cada uno de los tipos/modelos de la bbdd:
    - "type Author" : Dentro del objeto contiene cada propiedad del modelo (la exclamación "!" indica que no puede ser "null"). La propiedad "id" es de tipo "ID" (especial de GraphQL).
    - "type Book" : Lo mismo que para el tipo "Author".
    - "type Query" : Cada propiedad especifica un nombre consulta; los parámetros que recibe (en caso de que sea necesario); el valor retornado.
 */
const typeDefs = gql`
  #graphql
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    # author: String!
    author: Author! # Hemos definido en el esquema del modelo "Book" que el campo "author" hace referencia a un elemento existente en la colección "Authors".
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User # Si no le pasamos la cabecera "Authorization" deberá retornar "null".
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author!
    createUser(username: String!, favouriteGenre: String!): User # Puede retornar "null" si el nombre de usuario no es válido.
    login(username: String!, password: String!): Token # Puede retornar "null" como la anterior mutación.
  }

  type Subscription {
    bookAdded: Book! # Cuando un libro es creado la suscripción publicará una notificación a todos los clientes que se encuentren suscritos (el dato incluirá el nuevo libro creado).
  }
`;

module.exports = typeDefs;
