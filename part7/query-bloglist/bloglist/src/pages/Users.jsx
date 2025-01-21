import React from "react";
import { useResource } from "../hooks";
import { Link } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const Users = () => {
  const [users, userService] = useResource("/api/users");

  return (
    <>
      <Typography variant="h4">Users</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>blogs created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {/* En vez de utilizar la etiqueta de ancla `<a></a>` usamos el componente `<Link></Link>`. Posee el atributo `to` que especifica la ruta a visitar (debemos definir la ruta en el bloque de rutas). */}
                  <Link to={`/users/${user.id}`}>{user.name}</Link>
                </TableCell>
                <TableCell>{user.blogs.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Users;
