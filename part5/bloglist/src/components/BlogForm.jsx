import React, { useState } from "react";

/* Desde ahora los estados/controladores de eventos necesarios para la creación son declarados en el propio componente (no en `src/App.jsx`).
La función callback recibida como prop es la que añade el elemento a la base de datos.
 */
const BlogForm = ({ addBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: "", url: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();

    await addBlog(newBlog); // Enviamos el elemento al componente padre para añadirlo a la base de datos.
    setNewBlog({ title: "", url: "" });
  };

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={handleSubmit}>
        <div>
          title
          <input
            type="text"
            name="Title"
            value={newBlog.title}
            onChange={({ target }) =>
              setNewBlog({ ...newBlog, title: target.value })
            }
            data-testid="title"
          />
        </div>
        <div>
          url
          <input
            type="text"
            name="Url"
            value={newBlog.url}
            onChange={({ target }) =>
              setNewBlog({ ...newBlog, url: target.value })
            }
            data-testid="url"
          />
        </div>
        <button type="submit">create</button>
      </form>
    </>
  );
};

export default BlogForm;
