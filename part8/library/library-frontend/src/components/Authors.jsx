import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../query";
import { useField } from "../hooks";

const EditAuthor = () => {
  // const [name, resetName] = useField({ name: "name" });
  const [name, setName] = useState("");
  const [born, resetBorn] = useField({ name: "born", type: "number" });

  // Cuando modificamos elementos que poseen un identificador único no es necesario que llamemos de nuevo a las consultas (`refetchQueries`) (al encontrarse en la caché de Apollo la actualización se realiza de manera automática).
  const [editAuthor, authorResult] = useMutation(EDIT_AUTHOR, {
    onError: ({ graphQLErrors }) => {
      const message = graphQLErrors.map((error) => error.message).join(`\n`);
      console.error(message);
    },
  });

  // Si en el servidor Apollo no hubiesemos lanzado una excepción cuando el nombre del autor no existe, podríamos manejar que la mutación ha fallado comprobando si el valor retornado por la operación es `null` ( `result.data.editAuthor === null ?` ).
  useEffect(() => {
    // La respuesta a la consulta se encuentra en su propio nombre de propiedad dentro de `result.data`.
    if (authorResult.data && authorResult.data.editAuthor === null)
      console.error("author not found");
  }, [authorResult.data]);

  const [authors, setAuthors] = useState([]);
  const authorsResult = useQuery(ALL_AUTHORS);

  useEffect(() => {
    if (authorsResult.data) setAuthors(authorsResult.data.allAuthors);
  }, [authorsResult]);

  const onSubmit = (event) => {
    event.preventDefault();

    // editAuthor({
    //   variables: { name: name.value, setBornTo: Number(born.value) },
    // });
    editAuthor({
      variables: { name, setBornTo: Number(born.value) },
    });

    // resetName();
    setName("");
    resetBorn();
  };

  return (
    <div>
      <h2>Set birthday</h2>
      <form onSubmit={onSubmit}>
        {/* <div>
          name: <input {...name} />
        </div> */}
        <div>
          name:{" "}
          <select name="name" onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born: <input {...born} />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

const Authors = ({ show }) => {
  const [authors, setAuthors] = useState([]);
  const result = useQuery(ALL_AUTHORS); // El hook `useQuery()` recibe como parámetro la consulta.

  /* Cuando se renderiza el componente por primera vez se comprueba que su propiedad `.data` no sea `null` (ahí se encuentra el resultado de la consulta con el formato `result.data === { allAuthors: [...] }`).

  Al mutar el valor de `result` vuelve a renderizar el componente aplicando ahora sí el valor de `result.data.allAuthors` al estado.
   */
  useEffect(() => {
    if (result.data) setAuthors(result.data.allAuthors);
  }, [result]);

  if (!show) return null;

  // Comprobamos con la propiedad `result.loading` que finalice la consulta.
  if (result.loading) return <div>loading authors...</div>;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditAuthor />
    </div>
  );
};

export default Authors;
