# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# ultimate-hooks

`npm create vite@latest ultimate-hooks -- -- --template react`

`cd .\ultimate-hooks\`

`npm install`

`code .\`

`npm install json-server --save-dev`

Dentro de `package.json` definimos el script para arrancar el servidor JSON:

```
{
  ...,
  "scripts": {
    ...,
    "server": "json-server -p 3001 --watch db.json"
  },
  ...
}
```

Creamos el fichero `db.json`.

`npm install axios --save`

Dentro del fichero `src/hooks/index.js` creamos el hook personalizado para realizar solicitudes HTTP al servidor JSON:

```
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

export const useField = ({ name, type = "text" }) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return { name, type, value, onChange };
};

/* El hook personalizado "useResource()" recibe como parámetro la URL del servidor web.

Devuelve un objeto lista (como el hook "useState()" o "useReducer()") en el que el 1º elemento es la lista de elementos (resources) mientras que el 2º elemento es el servicio con sus operaciones disponibles (service; por ejemplo "service.create").
*/
export const useResource = (baseUrl) => {
  const [resources, setResources] = useState([]);

  // Con el hook "useEffect()" especificamos como dependencia "baseUrl" para que siempre que su valor cambie re-rendericemos el hook personalizado (al momento de renderizar el hook personalizado se realiza una solicitud HTTP GET al servidor web).
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(baseUrl);
      setResources(response.data);
    };

    fetchData();
  }, [baseUrl]);

  const create = async (resource) => {
    const response = await axios.post(baseUrl, resource);
    setResources((prev) => prev.concat(response.data));
  };

  const service = { create };

  return [resources, service];
};
```