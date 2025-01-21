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

  const field = { name, type, value, onChange };

  const reset = () => {
    setValue("");
  };

  // Para no romper la aplicación con el "Spread Operator" el hook retornará un objeto con las propiedades: "field" que representa los atributos del control de formulario; "reset" que es la función para limpiar el control.
  return { field, reset };
};
