import React, { useEffect, useRef, useState } from "react";
import loginService from "./services/login";
import blogService from "./services/blogs";
import Notification from "./components/Notification";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Togglable from "./components/Togglable";
import Blog from "./components/Blog";
import {
  useDeleteBlogMutation,
  useNewBlogMutation,
  useResult,
  useUpdateBlogMutation,
} from "./client";
import { useNotificationDispatch } from "./contexts/NotificationContext";
import { setAndCleanNotification } from "./reducers/notificationReducer";
import { useUserDispatch, useUserValue } from "./contexts/UserContext";
import { cleanUser, setUser } from "./reducers/userReducer";
import { Route, Routes, useMatch } from "react-router-dom";
import Users from "./pages/Users";
import User from "./pages/User";
import BlogPage from "./pages/Blog";
import Menu from "./components/Menu";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [user, setUser] = useState(null); // "user === { username: String, name: String, token: String }".
  // const [blogs, setBlogs] = useState([]);
  // const [message, setMessage] = useState(null);
  const blogFormRef = useRef(); // Creamos un referenciador mediante el hook "useRef()".

  // Con el hook personalizado "useNotificationDispatch()" recuperación la función dispatch para realizar operaciones con el reducer (debemos enviar como parámetro un objeto "action = { type, payload }").
  const dispatch = useNotificationDispatch();

  const result = useResult();
  const newBlogMutation = useNewBlogMutation();
  const updateBlogMutation = useUpdateBlogMutation();
  const deleteBlogMutation = useDeleteBlogMutation();

  const userValue = useUserValue();
  const userDispatch = useUserDispatch();

  // Cada vez que el componente es renderizado se recupera del almacenamiento local el usuario autenticado.
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBloglistappUser");

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON); // Debemos transformar la cadena de texto a un objeto JavaScript.
      userDispatch(setUser(user));
      blogService.setToken(user.token); // Cuando el componente se renderice adjunta al servicio de solicitudes HTTP el token del usuario.
    }
  }, []);

  // /* ¡IMPORTANTE!
  // No podemos enviar como parámetro al hook "useEffect()" una función callback asíncrona.

  // Para ejecutar un método asíncrono que devuelve una promesa podemos declarar una función asíncrona dentro de la función callback que ejecute lo necesario para recuperar los datos de la base de datos.
  // */
  // useEffect(() => {
  //   async function fetchData() {
  //     const blogs = await blogService.getAllBlogs();
  //     setBlogs(blogs);
  //   }

  //   try {
  //     fetchData();
  //   } catch (error) {
  //     setMessage(error.message);
  //     setTimeout(() => setMessage(null), 5000);
  //   }
  // }, []);

  const handleLogin = async (event) => {
    // Detenemos la acción por defecto de envío del formulario.
    event.preventDefault();

    try {
      // Hasta que el usuario no sea autenticado la ejecución queda detenida.
      const user = await loginService.login({ username, password });

      // Guardamos en el almacenamiento local el usuario autenticado.
      window.localStorage.setItem(
        "loggedBloglistappUser",
        // Debemos almacenarlo como una cadena de texto (no como un objeto JavaScript).
        JSON.stringify(user)
      );

      // Guardamos en el servicio de solicitudes HTTP el token del usuario.
      blogService.setToken(user.token);

      userDispatch(setUser(user));
      setUsername("");
      setPassword("");
    } catch ({ response }) {
      // setMessage(response.data.error);
      // setTimeout(() => setMessage(null), 5000);

      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBloglistappUser");

    // Eliminamos del servicio de solicitudes HTTP el token del usuario.
    blogService.setToken("");

    userDispatch(cleanUser());
  };

  const addBlog = async (newBlog) => {
    // event.preventDefault();
    try {
      // /* ¡IMPORTANTE!
      // Debemos modificar la ruta POST del controlador de rutas en el servidor web para incluir a la respuesta el usuario que ha creado el elemento. Si no no podremos verificar que el usuario que ha iniciado sesión es o no el autor hasta que actualicemos la aplicación.
      //  */
      // const returnedBlog = await blogService.createBlog(newBlog);
      // setBlogs((prev) => prev.concat(returnedBlog));
      // // setNewBlog({ title: "", url: "" });

      // Como se trata de una operación asíncrona utilizamos el método ".mutateAsync()".
      const returnedBlog = await newBlogMutation.mutateAsync(newBlog);

      // setMessage(
      //   `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`
      // );
      // setTimeout(() => setMessage(null), 5000);

      setAndCleanNotification(
        {
          message: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
          duration: 5,
        },
        dispatch
      );

      blogFormRef.current.toggleVisibility(); // Ocultamos el formulario de creación mediante la referencia.
    } catch ({ response }) {
      // setMessage(response.data.error);
      // setTimeout(() => setMessage(null), 5000);

      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };

  const likeBlog = async (updatedBlog) => {
    try {
      // const returnedBlog = await blogService.updateBlog(
      //   updatedBlog.id,
      //   updatedBlog
      // );
      // setBlogs((prev) =>
      //   prev.map((blog) => (blog.id === returnedBlog.id ? returnedBlog : blog))
      // );

      await updateBlogMutation.mutateAsync({ id: updatedBlog.id, updatedBlog });
    } catch ({ response }) {
      // setMessage(response.data.error);
      // setTimeout(() => setMessage(null), 5000);

      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };

  /* El hook "useMatch()" recupera el objeto "ruta" cuando la ruta coincide con el valor enviado como parámetro. Si coinciden el objeto retornado poseera todas las propiedades de la ruta actual (como ".params.id" para recuperar el parámetro ":id" enviado a través de la URL).

  Otra opción hubiese sido utilizar el hook "useParams()" que retorna un objeto con el que podremos acceder a los parámetros enviados a través de la URL.
   */
  const match = useMatch("/blogs/:id");

  // Para que la aplicación no falle debemos controlar si las publicaciones han sido recuperadas.
  if (result.isLoading) return <div>loading blogs...</div>;

  const blogs = result.data; // La consulta "result" tiene en la propiedad ".data" la lista de publicaciones recuperadas del servidor web.

  const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);

  const blog = match
    ? blogs.find((blog) => blog.id === match.params.id) // Si el identificador es un número deberíamos transformar el parámetro recuperado (es una cadena de texto).
    : null;

  const deleteBlog = async (id) => {
    try {
      // await blogService.deleteBlog(id);
      // setBlogs((prev) => prev.filter((blog) => blog.id !== id));

      await deleteBlogMutation.mutateAsync(id);

      // setMessage(`blog deleted successfully`);
      // setTimeout(() => setMessage(null), 5000);

      setAndCleanNotification(
        { message: `blog deleted successfully`, duration: 5 },
        dispatch
      );
    } catch ({ response }) {
      // setMessage(response.data.error);
      // setTimeout(() => setMessage(null), 5000);

      setAndCleanNotification(
        { message: response.data.error, duration: 5 },
        dispatch
      );
    }
  };

  return (
    <Container>
      <Notification />
      {userValue === null ? (
        <>
          <Togglable buttonLabel="log in">
            {/* Con la des-estructuración de objetos aislamos la propiedad necesaria. */}
            <LoginForm
              onSubmit={handleLogin}
              username={username}
              handleUsernameChange={({ target }) => setUsername(target.value)}
              password={password}
              handlePasswordChange={({ target }) => setPassword(target.value)}
            />
          </Togglable>
        </>
      ) : (
        <>
          <Menu name={userValue.name} handleLogout={handleLogout} />
          <Typography variant="h3">blog app</Typography>
          {/* Contenemos cada ruta dentro del bloque `<Routes> [...] </Routes>`. Una ruta posee los atributos: "path" para definir la URL a la que habría que acceder para renderizar el componente; "element" representa el componente a renderizar (con sus propios atributos). */}
          <Routes>
            <Route path="/users/:id" element={<User />} />
            <Route path="/users" element={<Users />} />
            <Route
              path="/blogs/:id"
              element={
                <BlogPage
                  blog={blog}
                  likeBlog={likeBlog}
                  deleteBlog={deleteBlog}
                />
              }
            />
            <Route
              path="/"
              element={
                <>
                  {/* Con el atributo "ref" podemos hacer que la variable "blogFormRef" esté haciendo referencia al componente "<Togglable />".
                  Posteriormente podremos acceder a los estados/controladores de eventos del componente definidos dentro del hook "useImperativeHandle()".
                  */}
                  <Togglable buttonLabel="new blog" ref={blogFormRef}>
                    <BlogForm addBlog={addBlog} />
                  </Togglable>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        {sortedBlogs.map((blog) => (
                          <Blog
                            key={blog.id}
                            blog={blog}
                            // likeBlog={likeBlog}
                            // deleteBlog={deleteBlog}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              }
            />
          </Routes>
        </>
      )}
    </Container>
  );
};

export default App;
