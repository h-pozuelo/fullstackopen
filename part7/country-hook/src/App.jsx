import React, { useState } from "react";
import { useCountry, useField } from "./hooks";
import Country from "./components/Country";

const App = () => {
  // Construimos con el hook personalizado "useField()" un objeto con su propio estado / manejador de cambios para el control de texto "nameInput".
  const nameInput = useField({ type: "text" });
  const [name, setName] = useState(""); // Variable auxiliar a la que el hook personalizado "useCountry()" escuchará para los cambios mediante el "useEffect()".
  const country = useCountry(name);

  /* Cuando enviemos el formulario queremos modificar el valor del estado "name".

  Como el estado es enviado como parámetro al hook personalizado "useCountry()" este escuchará con el hook "useEffect()" los cambios que se produzcan. Cuando se produce un cambio vuelve a realizar un "fetch" a la API.

  No enviamos como parámetro el valor de "nameInput.value" dado que estaría realizando "fetch" con cada carácter introducido.
  */
  const fetch = (event) => {
    event.preventDefault();
    setName(nameInput.value);
  };

  return (
    <div>
      <form onSubmit={fetch}>
        <input {...nameInput} />
        <button type="submit">find</button>
      </form>

      <Country country={country} />
    </div>
  );
};

export default App;
