import axios from "axios";

const baseUrl = "http://localhost:3001/anecdotes";

const getAllAnecdotes = async () => (await axios.get(baseUrl)).data;

const createAnecdote = async (newAnecdote) =>
  (await axios.post(baseUrl, newAnecdote)).data;

const updateAnecdote = async (updatedAnecdote) =>
  (await axios.put(`${baseUrl}/${updatedAnecdote.id}`, updatedAnecdote)).data;

export default { getAllAnecdotes, createAnecdote, updateAnecdote };
