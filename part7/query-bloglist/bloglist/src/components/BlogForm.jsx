import { Box, Button, TextField, Typography } from "@mui/material";
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
      <Typography variant="h4">create new</Typography>
      <Box
        component="form"
        sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
        onSubmit={handleSubmit}
      >
        <div>
          <TextField
            label="title"
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
          <TextField
            label="url"
            type="text"
            name="Url"
            value={newBlog.url}
            onChange={({ target }) =>
              setNewBlog({ ...newBlog, url: target.value })
            }
            data-testid="url"
          />
        </div>
        <Button variant="contained" type="submit">
          create
        </Button>
      </Box>
    </>
  );
};

export default BlogForm;
