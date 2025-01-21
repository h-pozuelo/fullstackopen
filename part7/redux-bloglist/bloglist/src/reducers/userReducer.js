import { createSlice } from "@reduxjs/toolkit";
import blogService from "../services/blogs";
import loginService from "../services/login";

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser(state, action) {
      const user = action.payload;
      return user;
    },
    cleanUser(state, action) {
      return null;
    },
  },
});

export const loggedUser = () => (dispatch, getState) => {
  const loggedUserJSON = window.localStorage.getItem("loggedBloglistappUser"); // Debemos transformar la cadena de texto a un objeto JavaScript.

  if (loggedUserJSON) {
    const user = JSON.parse(loggedUserJSON);
    dispatch({ type: "user/setUser", payload: user });
    blogService.setToken(user.token); // Cuando el componente se renderice adjunta al servicio de solicitudes HTTP el token del usuario.
  }
};

export const loginUser = (credentials) => async (dispatch, getState) => {
  // Hasta que el usuario no sea autenticado la ejecución queda detenida.
  const user = await loginService.login(credentials);

  // Guardamos en el almacenamiento local el usuario autenticado.
  window.localStorage.setItem(
    "loggedBloglistappUser",
    // Debemos almacenarlo como una cadena de texto (no como un objeto JavaScript).
    JSON.stringify(user)
  );

  // Guardamos en el servicio de solicitudes HTTP el token del usuario.
  blogService.setToken(user.token);

  dispatch({ type: "user/setUser", payload: user });
};

export const logoutUser = () => (dispatch, getState) => {
  window.localStorage.removeItem("loggedBloglistappUser");

  // Eliminamos del servicio de solicitudes HTTP el token del usuario.
  blogService.setToken(null);

  dispatch({ type: "user/cleanUser" });
};

export default userSlice.reducer;
