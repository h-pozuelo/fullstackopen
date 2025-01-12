import React from "react";
import { useDispatch } from "react-redux";
import { appendAnecdote, createAnecdote } from "../reducers/anecdoteReducer";
import {
  cleanMessage,
  setMessage,
  setNotification,
} from "../reducers/notificationReducer";
import anecdoteService from "../services/anecdotes";

const AnecdoteForm = () => {
  const dispatch = useDispatch();

  const addAnecdote = async (event) => {
    event.preventDefault();
    const content = event.target.anecdote.value;
    event.target.anecdote.value = "";

    // const newAnecdote = await anecdoteService.createNew(content);
    // dispatch(appendAnecdote(newAnecdote));

    dispatch(createAnecdote(content));

    // dispatch(setMessage(`you created '${content}'`));
    // setTimeout(() => dispatch(cleanMessage()), 5000);

    dispatch(setNotification(`you created '${content}'`, 5));
  };

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addAnecdote}>
        <input type="text" name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default AnecdoteForm;
