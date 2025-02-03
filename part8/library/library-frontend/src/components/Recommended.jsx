import { useLazyQuery, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { CURRENT_USER, FIND_BOOKS } from "../query";

const Recommended = ({ show, currentUser }) => {
  // const [currentUser, setCurrentUser] = useState(null);
  // const resultCurrentUser = useQuery(CURRENT_USER);

  const [books, setBooks] = useState([]);
  const [getBooks, resultBooks] = useLazyQuery(FIND_BOOKS);

  // // La 1ª vez que se renderice el componente y cuando la variable `resultCurrentUser` mute...
  // useEffect(() => {
  //   // Si se ha completado la operación almacenamos el resultado dentro del estado.
  //   if (resultCurrentUser.data) setCurrentUser(resultCurrentUser.data.me);
  // }, [resultCurrentUser]);

  // Sólo cuando el usuario actual es modificado...
  useEffect(() => {
    console.log(currentUser);
    // Comprobamos que el valor de `currentUser` no es `null`.
    if (currentUser)
      getBooks({ variables: { genre: currentUser.favouriteGenre } });
  }, [currentUser]); // eslint-disable-line

  // Sólo cuando el valor de `resultBooks` muta...
  useEffect(() => {
    // Guardamos el resultado de la consulta `allBooks` dentro del estado.
    if (resultBooks.data) setBooks(resultBooks.data.allBooks);
  }, [resultBooks]);

  if (!show) return null;

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favourite genre <b>{currentUser.favouriteGenre}</b>
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books &&
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommended;
