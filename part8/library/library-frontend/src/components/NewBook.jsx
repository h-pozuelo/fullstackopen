import React, { useState } from "react";
import { useField } from "../hooks";
import { useMutation } from "@apollo/client";
import { ALL_AUTHORS, CREATE_BOOK, FIND_BOOKS } from "../query";

const NewBook = ({ show }) => {
  const [title, resetTitle] = useField({ name: "title" });
  const [author, resetAuthor] = useField({ name: "author" });
  const [published, resetPublished] = useField({
    name: "published",
    type: "number",
  });
  const [genre, resetGenre] = useField({ name: "genre" });
  const [genres, setGenres] = useState([]);

  /* El hook `useMutation()` retorna una matriz con 2 elementos:
    - "addBook" : Le damos al 1º elemento el nombre de "addBook"; con el realizaremos la operación CREATE pasándole como parámetro un objeto con la propiedad `variables` que posee un objeto JavaScript con cada propiedad que corresponde a los parámetros que espera recibir ( addBook({ variables: { ... } }); ).
    - "result" : Nos sirve para comprobar el resultado de la operación (si ha sido llamada ".called"; si ha sido completada ".loading"; sus datos retornados ".data").
  */
  const [addBook, result] = useMutation(CREATE_BOOK, {
    // /* Como 2º parámetro le pasamos un objeto con la propiedad `refetchQueries`.
    // En su interior contiene una lista de objetos de consulta a las que la mutación llamará cuando la operación se realice.
    // */
    // refetchQueries: [{ query: ALL_AUTHORS }, { query: FIND_BOOKS }],
    /* La propiedad `update` posee una función callback que recibe como parámetros la caché actual del cliente Apollo y la respuesta retornada por la consulta/mutación.
     */
    update: (cache, response) => {
      /* Con el método `cache.updateQuery()` modificamos de la caché del cliente Apollo el resultado de la consulta `FIND_BOOKS`. Para ello le pasamos como parámetros:
        - consulta : un objeto con la consulta/mutación a modificar.
        - función callback : recibe como parámetro el `response.data` de la consulta/mutación que estamos actualizando (la hemos des-estructurado) mientras que el valor retornado es un objeto con el nombre de la consulta/mutación y su nuevo resultado.
      */
      cache.updateQuery({ query: FIND_BOOKS }, (data) => {
        console.log(data);
        const { allBooks } = data;
        return { allBooks: allBooks.concat(response.data.addBook) };
      });
    },
  });

  const addGenre = () => {
    setGenres((prev) => prev.concat(genre.value));
    resetGenre();
  };

  const onSubmit = (event) => {
    event.preventDefault();

    addBook({
      variables: {
        title: title.value,
        author: author.value,
        published: Number(published.value), // El campo `published` espera recibir un `Int`.
        genres,
      },
    });

    resetTitle();
    resetAuthor();
    resetPublished();
    resetGenre();
    setGenres([]);
  };

  if (!show) return null;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          title: <input {...title} />
        </div>
        <div>
          author: <input {...author} />
        </div>
        <div>
          published: <input {...published} />
        </div>
        <div>
          <input {...genre} />
          <button type="button" onClick={addGenre}>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
