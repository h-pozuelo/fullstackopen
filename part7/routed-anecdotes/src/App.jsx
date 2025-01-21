import React, { useState } from "react";
import Menu from "./components/Menu";
import AnecdoteList from "./components/AnecdoteList";
import About from "./components/About";
import CreateNew from "./components/CreateNew";
import Footer from "./components/Footer";
import { Route, Routes, useMatch } from "react-router-dom";
import Anecdote from "./components/Anecdote";

const App = () => {
  const [anecdotes, setAnecdotes] = useState([
    {
      content: "If it hurts, do it more often",
      author: "Jez Humble",
      info: "https://martinfowler.com/bliki/FrequencyReducesDifficulty.html",
      votes: 0,
      id: 1,
    },
    {
      content: "Premature optimization is the root of all evil",
      author: "Donald Knuth",
      info: "http://wiki.c2.com/?PrematureOptimization",
      votes: 0,
      id: 2,
    },
  ]);

  const [notification, setNotification] = useState("");

  const addNew = (anecdote) => {
    anecdote.id = Math.round(Math.random() * 10000);
    setAnecdotes(anecdotes.concat(anecdote));

    setNotification(`a new anecdote ${anecdote.content} created!`);
    setTimeout(() => setNotification(""), 5000);
  };

  const anecdoteById = (id) => anecdotes.find((a) => a.id === id);

  const vote = (id) => {
    const anecdote = anecdoteById(id);

    const voted = {
      ...anecdote,
      votes: anecdote.votes + 1,
    };

    setAnecdotes(anecdotes.map((a) => (a.id === id ? voted : a)));
  };

  /* El hook "useMatch()" recupera el objeto "ruta" cuando la ruta coincide con el valor enviado como parámetro. Si coinciden el objeto retornado poseera todas las propiedades de la ruta actual (como ".params.id" para recuperar el parámetro ":id" enviado a través de la URL).

  Otra opción hubiese sido utilizar el hook "useParams()" que retorna un objeto con el que podremos acceder a los parámetros enviados a través de la URL.
   */
  const match = useMatch("/anecdotes/:id");
  const anecdote = match
    ? anecdotes.find((anecdote) => anecdote.id === Number(match.params.id)) // Debemos transformar a número el parámetro recuperado (es una cadena de texto).
    : null;

  return (
    <div>
      <h1>Software anecdotes</h1>
      <Menu />
      {notification}

      {/* Contenemos cada ruta dentro del bloque `<Routes> [...] </Routes>`. Una ruta posee los atributos: "path" para definir la URL a la que habría que acceder para renderizar el componente; "element" representa el componente a renderizar (con sus propios atributos). */}
      <Routes>
        <Route
          path="/anecdotes/:id"
          element={<Anecdote anecdote={anecdote} />}
        />
        <Route
          path="/anecdotes"
          element={<AnecdoteList anecdotes={anecdotes} />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/create" element={<CreateNew addNew={addNew} />} />
        <Route path="/" element={<AnecdoteList anecdotes={anecdotes} />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
