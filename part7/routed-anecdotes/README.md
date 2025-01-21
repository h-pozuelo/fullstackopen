# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# routed-anecdotes

Instalamos la librería `React-router-dom` (no `React-router`) para poder realizar enrutamiento en nuestra aplicación web:

· `npm install react-router-dom --save`

Dentro de `src/main.jsx` rodeamos la aplicación con el componente `<BrowserRouter> [...] </BrowserRouter>` para habilitar el enrutamiento:

```
...
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

Dentro del componente `src/App.jsx` definimos las rutas disponibles:

```
...
import { Route, Routes } from "react-router-dom";

const App = () => {
  ...
  return (
    <div>
      ...
      {/* Contenemos cada ruta dentro del bloque `<Routes> [...] </Routes>`. Una ruta posee los atributos: "path" para definir la URL a la que habría que acceder para renderizar el componente; "element" representa el componente a renderizar (con sus propios atributos). */}
      <Routes>
        <Route
          path="/anecdotes"
          element={<AnecdoteList anecdotes={anecdotes} />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/create" element={<CreateNew addNew={addNew} />} />
        <Route path="/" element={<AnecdoteList anecdotes={anecdotes} />} />
      </Routes>
      ...
    </div>
  );
};
...
```

Dentro del componente `src/components/Menu.jsx` creamos los enlaces para poder visitar las rutas:

```
...
import { Link } from "react-router-dom";

const Menu = () => {
  ...
  return (
    <div>
      {/* En vez de utilizar la etiqueta de ancla `<a></a>` usamos el componente `<Link></Link>`. Posee el atributo `to` que especifica la ruta a visitar (debemos definir la ruta en el bloque de rutas). */}
      <Link to="/anecdotes" style={padding}>
        anecdotes
      </Link>
      <Link to="/create" style={padding}>
        create new
      </Link>
      <Link to="/about" style={padding}>
        about
      </Link>
    </div>
  );
};
...
```

## useParams() / useMatch() : Enviando parámetros a través de las rutas

Dentro del componente `src/App.jsx` creamos una nueva ruta para cuando querramos recuperar los datos de una anécdota:

```
...
import { Route, Routes, useMatch } from "react-router-dom";
import Anecdote from "./components/Anecdote";

const App = () => {
  ...
  /* El hook "useMatch()" recupera el objeto "ruta" cuando la ruta coincide con el valor enviado como parámetro. Si coinciden el objeto retornado poseera todas las propiedades de la ruta actual (como ".params.id" para recuperar el parámetro ":id" enviado a través de la URL).

  Otra opción hubiese sido utilizar el hook "useParams()" que retorna un objeto con el que podremos acceder a los parámetros enviados a través de la URL.
   */
  const match = useMatch("/anecdotes/:id");
  const anecdote = match
    ? anecdotes.find((anecdote) => anecdote.id === Number(match.params.id)) // Debemos transformar a número el parámetro recuperado (es una cadena de texto).
    : null;

  return (
    <div>
      ...
      <Routes>
        <Route
          path="/anecdotes/:id"
          element={<Anecdote anecdote={anecdote} />}
        />
        ...
      </Routes>
      ...
    </div>
  );
};
...
```

Dentro del componente `src/components/AnecdoteList.jsx` construimos el enlace para acceder a la ruta `/anecdotes/:id`:

```
...
import { Link } from "react-router-dom";

const AnecdoteList = ({ anecdotes }) => {
  return (
    <div>
      ...
      <ul>
        {anecdotes.map((anecdote) => (
          <li key={anecdote.id}>
            <Link to={`/anecdotes/${anecdote.id}`}>{anecdote.content}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnecdoteList;
```

## useNavigate() : Navegando a otras rutas

Dentro del componente `src/components/CreateNew.jsx`:

```
...
import { useNavigate } from "react-router-dom";

const CreateNew = (props) => {
  ...
  // Con el hook "useNavigate()" podemos acceder a otras rutas desde el componente.
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    ...
    navigate("/anecdotes");
  };
  ...
};
...
```

### <Navigate /> : Re-direccionado

Dentro del bloque de rutas podemos utilizar el componente `<Navigate />` con los atributos `replace` + `to` para re-direccionar a otra ruta (por ejemplo si no queremos que el usuario acceda a la lista de anécdotas si no ha iniciado sesión podríamos utilizar un condicional ternário).

## Hooks personalizados

### useField()

Creamos el índice `src/hooks/index.js` en donde almacenar cada uno de los hooks personalizados:

```
import { useState } from "react";

/* Podemos pensar que los hooks personalizados son como constructores a los que posteriormente llamamos para construir un objeto con las propiedades retornadas.

El hook personalizado "useField()" recibe como parámetro el tipo de control de formulario.

El objeto retornado por el hook consta de las propiedades "type", "value" y "onChange" (los nombres de estas propiedades coinciden con los nombres de los atributos de la etiqueta "<input />" a propósito para poder usar el "Spread Operator" al momento de incluirlas en la etiqueta: "<input {...anecdote} />").
*/
export const useField = ({ name, type }) => {
  // El hook maneja su propio estado.
  const [value, setValue] = useState("");

  // Definimos un controlador de eventos para cuando cambie el valor del control de formulario.
  const onChange = (event) => {
    setValue(event.target.value);
  };

  return { name, type, value, onChange };
};
```

Dentro del componente `src/components/CreateNew.jsx` implementamos el hook personalizado `useField()`:

```
...
import { useField } from "../hooks";

const CreateNew = (props) => {
  const content = useField({ name: "content", type: "text" });
  const author = useField({ name: "author", type: "text" });
  const info = useField({ name: "info", type: "text" });
  ...
  const handleSubmit = (e) => {
    ...
    props.addNew({
      content: content.value,
      author: author.value,
      info: info.value,
      ...
    });
    ...
  };

  return (
    <div>
      ...
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input {...content} />
        </div>
        <div>
          author
          <input {...author} />
        </div>
        <div>
          url for more info
          <input {...info} />
        </div>
        ...
      </form>
    </div>
  );
};
...
```

Dentro del hook personalizado `src/hooks/index.js` definimos una función que permita resetear el valor del estado para limpiar el control de formulario:

```
...
export const useField = ({ name, type }) => {
  ...
  const field = { name, type, value, onChange };

  const reset = () => {
    setValue("");
  };

  // Para no romper la aplicación con el "Spread Operator" el hook retornará un objeto con las propiedades: "field" que representa los atributos del control de formulario; "reset" que es la función para limpiar el control.
  return { field, reset };
};
```

Dentro del componente `src/components/CreateNew.jsx`:

```
...
const CreateNew = (props) => {
  ...
  const handleSubmit = (e) => {
    ...
    props.addNew({
      content: content.field.value,
      author: author.field.value,
      info: info.field.value,
      ...
    });
    ...
  };

  const handleReset = () => {
    content.reset();
    author.reset();
    info.reset();
  };

  return (
    <div>
      ...
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
        ...
        <button type="button" onClick={handleReset}>
          reset
        </button>
      </form>
    </div>
  );
};
...
```
