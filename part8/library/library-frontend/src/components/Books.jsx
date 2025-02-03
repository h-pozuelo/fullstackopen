import { useLazyQuery, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { FIND_BOOKS } from "../query";

const Books = ({ show }) => {
  const [books, setBooks] = useState([]);
  const [getBooks, booksResult] = useLazyQuery(FIND_BOOKS); // En vez de utilizar el hook `useQuery()` usamos el hook `useLazyQuery()` para ejecutar la consulta de forma dinámica.

  const [genres, setGenres] = useState([]); // Lista en donde almacenaremos los géneros disponibles la primera vez que renderice el componente.
  const [selectedGenre, setSelectedGenre] = useState(null); // Género por el que filtraremos los libros al momento de realizar la consulta.

  // Sólo la 1ª vez que se renderice el componente...
  useEffect(() => {
    getBooks().then(({ data }) => {
      // Del `result.data` recuperamos el valor de la consulta `allBooks` a la que mapeamos de todos sus elementos la propiedad `.genres` (es una lista). Posteriormente la "aplanamos" (fusionamos todas las listas contenidas dentro de la matriz principal) para crear un conjunto sin duplicados (Set) que transformamos a una lista con el "Spread Operator".
      setGenres([...new Set(data.allBooks.map((b) => b.genres).flat())]);
    });
  }, []); // eslint-disable-line

  // Cuando el valor de `booksResult` mute (quiere decir que ha completado la operación)...
  useEffect(() => {
    if (booksResult.data) {
      setBooks(booksResult.data.allBooks); // Guardamos los datos dentro del estado.
    }
  }, [booksResult]);

  // Cuando el valor del estado `selectedGenre` cambie...
  useEffect(() => {
    getBooks({ variables: { genre: selectedGenre } }); // Volvemos a ejecutar la consulta, lo que disparará el anterior `useEffect()` al mutar la variable `booksResult`.
  }, [selectedGenre]); // eslint-disable-line

  if (!show) return null;

  if (booksResult.loading) return <div>loading books...</div>;

  return (
    <div>
      <h2>books</h2>

      {selectedGenre && (
        <p>
          in genre <b>{selectedGenre}</b>
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
