import React from "react";
import { useNavigate } from "react-router-dom";
import { useField } from "../hooks";

const CreateNew = (props) => {
  const content = useField({ name: "content", type: "text" });
  const author = useField({ name: "author", type: "text" });
  const info = useField({ name: "info", type: "text" });

  // Con el hook "useNavigate()" podemos acceder a otras rutas desde el componente.
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    props.addNew({
      content: content.field.value,
      author: author.field.value,
      info: info.field.value,
      votes: 0,
    });
    navigate("/anecdotes");
  };

  const handleReset = () => {
    content.reset();
    author.reset();
    info.reset();
  };

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input {...content.field} />
        </div>
        <div>
          author
          <input {...author.field} />
        </div>
        <div>
          url for more info
          <input {...info.field} />
        </div>
        <button>create</button>
        <button type="button" onClick={handleReset}>
          reset
        </button>
      </form>
    </div>
  );
};

export default CreateNew;
