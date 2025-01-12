import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import anecdoteService from "./services/anecdotes";
import AnecdoteForm from "./components/AnecdoteForm";
import Notification from "./components/Notification";
import { useNotificationDispatch } from "./contexts/NotificationContext";

const App = () => {
  /* Con el hook "useQueryClient()" recuperamos el cliente pasado como contexto por el proveedor `<QueryClientProvider>` en el fichero `src/main.jsx`.
  De esta manera podremos manipular los valores de cada clave (ej. ["anecdotes"]).
   */
  const queryClient = useQueryClient();

  // Con el hook personalizado "useNotificationDispatch()" recuperación la función dispatch para realizar operaciones con el reducer (debemos enviar como parámetro un objeto "action = { type, payload }").
  const notificationDispatch = useNotificationDispatch();

  /* Para realizar operaciones como CREATE, UPDATE o DELETE debemos utilizar el hook "useMutation()". El hook recibe como parámetro un objeto con las propiedades:
      - "mutationFn" : Función callback que va a poder ser ejecutada mediante el método ".mutate()" que posee el objeto retornado al crear el "mutator" (newAnecdoteMutation.mutate()).
      - "onSuccess" : Función callback que se ejecuta cuando se completa con éxito la operación. Podemos especificar que reciba un parámetro que será el valor retornado por la función callback "mutationFn".
  
  Para poder ejecutar la operación llamamos al método "newAnecdoteMutation.mutate()" pasándole como parámetro el objeto que esperaría la función "anecdoteService.createAnecdote()".
  */
  const newAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.createAnecdote,
    onSuccess: (newAnecdote) => {
      // Recuperamos del cliente el valor de la clave ["anecdotes"].
      const currentAnecdotes = queryClient.getQueryData(["anecdotes"]);
      // Re-definimos el valor de la clave ["anecdotes"] concatenando la nueva anécdota.
      queryClient.setQueryData(
        ["anecdotes"],
        currentAnecdotes.concat(newAnecdote)
      );

      notificationDispatch({
        type: "SET_NOTIFICATION",
        payload: `anecdote '${newAnecdote.content}' created`,
      });
      setTimeout(
        () => notificationDispatch({ type: "CLEAN_NOTIFICATION" }),
        5000
      );
    },
    /* Si no cumplimos con los requerimientos para crear nuevas anécdotas (mínimo 5 caracteres) se producirá una excepción al momento de realizar la solicitud HTTP POST.
    La función callback en "onError" recibe como parámetro el objeto de error (podemos des-estructurarlo para acceder a la respuesta de la solicitud HTTP POST).
     */
    onError: ({ response }) => {
      const error = response.data.error;
      notificationDispatch({ type: "SET_NOTIFICATION", payload: error });
      setTimeout(
        () => notificationDispatch({ type: "CLEAN_NOTIFICATION" }),
        5000
      );
    },
  });

  const updateAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.updateAnecdote,
    onSuccess: (updatedAnecdote) => {
      const currentAnecdotes = queryClient.getQueryData(["anecdotes"]);
      queryClient.setQueryData(
        ["anecdotes"],
        currentAnecdotes.map((anecdote) =>
          anecdote.id !== updatedAnecdote.id ? anecdote : updatedAnecdote
        )
      );

      notificationDispatch({
        type: "SET_NOTIFICATION",
        payload: `anecdote '${updatedAnecdote.content}' voted`,
      });
      setTimeout(
        () => notificationDispatch({ type: "CLEAN_NOTIFICATION" }),
        5000
      );
    },
  });

  /* El hook "useQuery()" recibe como parámetro un objeto con las propiedades:
      - "queryKey" : Clave que identifica a la consulta. Para definir la clave la rodeamos por corchetes ([]).
      - "queryFn" : Función callback que se va a ejecutar. La información devuelta por la función callback es almacenada en la propiedad ".data" del objeto retornado por el hook "useQuery()".

  El hook "useQuery()" devuelve un objeto con propiedades como ".status", ".isLoading", ".data", ... (es como una promesa)
  */
  const result = useQuery({
    queryKey: ["anecdotes"],
    queryFn: anecdoteService.getAllAnecdotes,
    retry: false,
  });

  if (result.isPending) return <div>loading data...</div>;

  if (result.isError)
    return <div>anecdote service not available due to problems in server</div>;

  const anecdotes = result.data; // La consulta "result" tiene en la propiedad ".data" la lista de anécdotas recuperadas del servidor web.

  const handleVote = (anecdote) => {
    const votedAnecdote = { ...anecdote, votes: anecdote.votes + 1 };
    updateAnecdoteMutation.mutate(votedAnecdote);
  };

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm newAnecdoteMutation={newAnecdoteMutation} />

      <ul>
        {anecdotes &&
          anecdotes.map((anecdote) => (
            <li key={anecdote.id}>
              {anecdote.content}
              <br />
              has {anecdote.votes}
              <button onClick={() => handleVote(anecdote)}>vote</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;
