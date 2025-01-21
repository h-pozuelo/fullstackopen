import React from "react";
import { useResource } from "../hooks";
import { useParams } from "react-router-dom";
import { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";

const User = () => {
  const [users, userService] = useResource("/api/users");
  /* El hook "useMatch()" recupera el objeto "ruta" cuando la ruta coincide con el valor enviado como parámetro. Si coinciden el objeto retornado poseera todas las propiedades de la ruta actual (como ".params.id" para recuperar el parámetro ":id" enviado a través de la URL).

  Otra opción hubiese sido utilizar el hook "useParams()" que retorna un objeto con el que podremos acceder a los parámetros enviados a través de la URL.
   */
  const params = useParams();

  const user = userService.get(params.id);

  if (!user) return null;

  return (
    <>
      <Typography variant="h4">{user.name}</Typography>
      <div>
        <Typography variant="h5">added blogs</Typography>
        <List component={Paper}>
          {user.blogs.map((blog) => (
            <ListItem key={blog.id}>
              <ListItemText primary={blog.title} />
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
};

export default User;
