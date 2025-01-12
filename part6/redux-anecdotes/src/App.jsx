import React, { useEffect } from "react";
import AnecdoteList from "./components/AnecdoteList";
import AnecdoteForm from "./components/AnecdoteForm";
import { useDispatch } from "react-redux";
import anecdoteService from "./services/anecdotes";
import { initializeState, setAnecdotes } from "./reducers/anecdoteReducer";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      // const anecdotes = await anecdoteService.getAll();
      // dispatch(setAnecdotes(anecdotes));

      dispatch(initializeState());
    };

    fetchData();
  }, []);

  return (
    <div>
      <AnecdoteList />
      <AnecdoteForm />
    </div>
  );
};

export default App;
