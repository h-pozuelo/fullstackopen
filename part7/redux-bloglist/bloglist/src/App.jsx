import React, { useEffect, useRef, useState } from "react";
import loginService from "./services/login";
import blogService from "./services/blogs";
import Notification from "./components/Notification";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Togglable from "./components/Togglable";
import Blog from "./components/Blog";
import { useDispatch, useSelector } from "react-redux";
import { setAndCleanNotification } from "./reducers/notificationReducer";
import {
  setBlogs as initializeBlogs,
  createBlog,
  likeBlog as voteBlog,
  deleteBlog as eliminateBlog,
} from "./reducers/blogReducer";
import { loggedUser, loginUser, logoutUser } from "./reducers/userReducer";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [user, setUser] = useState(null); // "user === { username: String, name: String, token: String }".
  // const [blogs, setBlogs] = useState([]);
  // const [message, setMessage] = useState(null);
  const blogFormRef = useRef(); // Creamos un referenciador mediante el hook "useRef()".

  // El hook "useDispatch()" nos proporciona acceso al almacén de estados para realizar operaciones (actions) sobre él (en vez de ejecutar directamente el método "store.dispatch()" lo hacemos a través del hook "useDispatch()").
  const dispatch = useDispatch();

  const blogs = useSelector((state) => state.blogs);

  const user = useSelector((state) => state.user);

  // Cada vez que el componente es renderizado se recupera del almacenamiento local el usuario autenticado.
  useEffect(() => {
    // const loggedUserJSON = window.localStorage.getItem("loggedBloglistappUser");

    // if (loggedUserJSON) {
    //   const user = JSON.parse(loggedUserJSON); // Debemos transformar la cadena de texto a un objeto JavaScript.
    //   setUser(user);
    //   blogService.setToken(user.token); // Cuando el componente se renderice adjunta al servicio de solicitudes HTTP el token del usuario.
    // }

    dispatch(loggedUser());
  }, []);

  /* ¡IMPORTANTE!
  No podemos enviar como parámetro al hook "useEffect()" una función callback asíncrona.

  Para ejecutar un método asíncrono que devuelve una promesa podemos declarar una función asíncrona dentro de la función callback que ejecute lo necesario para recuperar los datos de la base de datos.
  */
  useEffect(() => {
    // async function fetchData() {
    //   const blogs = await blogService.getAllBlogs();
    //   dispatch(initializeBlogs(blogs));
    // }

    try {
      // fetchData();
      dispatch(initializeBlogs());
    } catch (error) {
      dispatch(setAndCleanNotification(error.message, 5));
    }
  }, []);

  const handleLogin = (event) => {
    // Detenemos la acción por defecto de envío del formulario.
    event.preventDefault();

    try {
      // // Hasta que el usuario no sea autenticado la ejecución queda detenida.
      // const user = await loginService.login({ username, password });

      // // Guardamos en el almacenamiento local el usuario autenticado.
      // window.localStorage.setItem(
      //   "loggedBloglistappUser",
      //   // Debemos almacenarlo como una cadena de texto (no como un objeto JavaScript).
      //   JSON.stringify(user)
      // );

      // // Guardamos en el servicio de solicitudes HTTP el token del usuario.
      // blogService.setToken(user.token);

      // setUser(user);

      dispatch(loginUser({ username, password }));
      setUsername("");
      setPassword("");
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };

  const handleLogout = () => {
    // window.localStorage.removeItem("loggedBloglistappUser");

    // // Eliminamos del servicio de solicitudes HTTP el token del usuario.
    // blogService.setToken("");

    // setUser(null);

    dispatch(logoutUser());
  };

  const addBlog = (newBlog) => {
    // event.preventDefault();

    try {
      // /* ¡IMPORTANTE!
      // Debemos modificar la ruta POST del controlador de rutas en el servidor web para incluir a la respuesta el usuario que ha creado el elemento. Si no no podremos verificar que el usuario que ha iniciado sesión es o no el autor hasta que actualicemos la aplicación.
      //  */
      // const returnedBlog = await blogService.createBlog(newBlog);
      dispatch(createBlog(newBlog));
      // setNewBlog({ title: "", url: "" });

      dispatch(
        setAndCleanNotification(
          `a new blog ${newBlog.title} by ${newBlog.author} added`,
          5
        )
      );

      blogFormRef.current.toggleVisibility(); // Ocultamos el formulario de creación mediante la referencia.
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };

  const likeBlog = (updatedBlog) => {
    try {
      // const returnedBlog = await blogService.updateBlog(
      //   updatedBlog.id,
      //   updatedBlog
      // );
      dispatch(voteBlog(updatedBlog));
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };

  // Cuando recuperamos la lista de publicaciones del almacén de estados es una variable inmutable (no podemos realizar un ".sort()" sobre la propia lista).
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);

  const deleteBlog = (id) => {
    try {
      // await blogService.deleteBlog(id);
      dispatch(eliminateBlog(id));

      dispatch(setAndCleanNotification(`blog deleted successfully`, 5));
    } catch ({ response }) {
      dispatch(setAndCleanNotification(response.data.error, 5));
    }
  };

  return (
    <div>
      <Notification />
      {user === null ? (
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
          <h2>blogs</h2>
          <p>
            {user.name} logged in <button onClick={handleLogout}>logout</button>
          </p>
          {/* Con el atributo "ref" podemos hacer que la variable "blogFormRef" esté haciendo referencia al componente "<Togglable />".
          Posteriormente podremos acceder a los estados/controladores de eventos del componente definidos dentro del hook "useImperativeHandle()".
           */}
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <BlogForm addBlog={addBlog} />
          </Togglable>
          {sortedBlogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              likeBlog={likeBlog}
              deleteBlog={deleteBlog}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default App;
