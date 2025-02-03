import { gql } from "@apollo/client";

/* Definiendo un fragmento podemos realizar consultas más compactas que retornen un mismo tipo de dato.
Definimos la constante `BOOK_DETAILS` que es un fragmento con alias `bookDetails` para el tipo definido `Book`.
 */
const BOOK_DETAILS = gql`
  #graphql
  fragment bookDetails on Book {
    author {
      bookCount
      born
      id
      name
    }
    genres
    id
    published
    title
  }
`;

export const ALL_AUTHORS = gql`
  #graphql
  query allAuthors {
    allAuthors {
      bookCount
      born
      id
      name
    }
  }
`;

/* Definimos la consulta `FIND_BOOKS` como una consulta programáticamente.
Este tipo de consultas se caracterizan por ser definidas con un nombre y recibir como parámetros variables GraphQL (que comiencen por un `$`).
*/
export const FIND_BOOKS = gql`
  #graphql
  query findBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      author {
        bookCount
        born
        id
        name
      }
      genres
      id
      published
      title
    }
  }
`;

export const AUTHOR_COUNT = gql`
  #graphql
  query {
    authorCount
  }
`;

export const BOOK_COUNT = gql`
  #graphql
  query {
    bookCount
  }
`;

export const CREATE_BOOK = gql`
  #graphql
  mutation createBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      author {
        bookCount
        born
        id
        name
      }
      genres
      id
      published
      title
    }
  }
`;

export const EDIT_AUTHOR = gql`
  #graphql
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      bookCount
      born
      id
      name
    }
  }
`;

export const LOGIN = gql`
  #graphql
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const CURRENT_USER = gql`
  #graphql
  query {
    me {
      username
      favouriteGenre
      id
    }
  }
`;

export const BOOK_ADDED = gql`
  #graphql
  subscription {
    bookAdded {
      ...bookDetails # Con el 'Spread Operator' separamos todos los campos del fragmento.
    }
  }

  # Con el símbolo '$' junto a las llaves incluimos la constante "BOOK_DETAILS" que contiene el fragmento 'bookDetails' que necesitamos.
  ${BOOK_DETAILS}
`;
