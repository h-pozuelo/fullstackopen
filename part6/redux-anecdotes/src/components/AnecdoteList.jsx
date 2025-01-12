import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { voteAnecdote } from "../reducers/anecdoteReducer";
import Filter from "./Filter";
import Notification from "./Notification";
import {
  cleanMessage,
  setMessage,
  setNotification,
} from "../reducers/notificationReducer";

const Anecdote = ({ anecdote, handleClick }) => {
  return (
    <div>
      {anecdote.content}
      <br />
      has {anecdote.votes}
      <button onClick={handleClick}>vote</button>
    </div>
  );
};

const AnecdoteList = () => {
  // El hook "useDispatch()" nos proporciona acceso al almacén de estados para realizar operaciones (actions) sobre él (en vez de ejecutar directamente el método "store.dispatch()" lo hacemos a través del hook "useDispatch()").
  const dispatch = useDispatch();
  // El hook "useSelector()" permite recuperar del almacén de estados un estado en concreto. En este caso estamos recuperando el estado al completo (podríamos filtrar el parámetro "state" para recuperar únicamente aquellas anécdotas con un valor de votos superior a X).
  const anecdotes = useSelector(({ anecdotes, filter }) => {
    const re = new RegExp(filter, "i");
    return anecdotes.filter((anecdote) => re.test(anecdote.content));
  });

  const sortedAnecdotes = anecdotes.sort((a, b) => b.votes - a.votes);

  const vote = (id, content) => {
    dispatch(voteAnecdote(id));

    // dispatch(setMessage(`you voted '${content}'`));
    // setTimeout(() => dispatch(cleanMessage()), 5000);

    dispatch(setNotification(`you voted '${content}'`, 5));
  };

  return (
    <div>
      <h2>Anecdotes</h2>
      <Notification />
      <Filter />
      {sortedAnecdotes.map((anecdote) => (
        <Anecdote
          key={anecdote.id}
          anecdote={anecdote}
          handleClick={() => vote(anecdote.id, anecdote.content)}
        />
      ))}
    </div>
  );
};

export default AnecdoteList;
