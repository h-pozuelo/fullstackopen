import React, { useEffect } from "react";
import { useField } from "../hooks";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../query";

const LoginForm = ({ setToken, setError, show, getCurrentUser }) => {
  const [username, resetUsername] = useField({ name: "username" });
  const [password, resetPassword] = useField({
    name: "password",
    type: "password",
  });

  const [login, result] = useMutation(LOGIN, {
    onError: ({ graphQLErrors }) => {
      const message = graphQLErrors.map((error) => error.message).join("\n");
      setError(message);
    },
  });

  // La primera vez que el componente sea renderizado y cuando la propiedad `result.data` mute...
  useEffect(() => {
    // Verificamos que la propiedad `result.data` no sea `null`.
    if (result.data) {
      const token = result.data.login.value; // Recuperamos del resultado de la consulta/mutación `login` el valor de la propiedad `value` (el token del usuario).
      setToken(token);
      window.localStorage.setItem("library-user-token", token);

      getCurrentUser();
    }
  }, [result.data]); // eslint-disable-line

  const onSubmit = (event) => {
    event.preventDefault();

    login({
      variables: {
        username: username.value,
        password: password.value,
      },
    });

    resetUsername();
    resetPassword();
  };

  if (!show) return null;

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          username: <input {...username} />
        </div>
        <div>
          password: <input {...password} />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
