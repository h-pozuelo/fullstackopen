import React, { forwardRef, useImperativeHandle, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";

/* El parámetro "children" recibido a través de las props corresponde a aquellos elementos que se encuentran entre las etiquetas de apretura/cierre de este componente.

Para poder exponer estados/controladores de eventos debemos encapsular al componente con "forwardRef()". La función callback del componente ahora recibe además de las props una matriz de referencias a dicho componente.
 */
const Togglable = forwardRef(({ buttonLabel, children }, refs) => {
  const [visible, setVisible] = useState(false);

  // Definimos estilos para mostrar u ocultar los elementos de manera condicional.
  const hideWhenVisible = { display: visible ? "none" : "" };
  const showWhenVisible = { display: visible ? "" : "none" };

  const toggleVisibility = () => setVisible(!visible);

  /* El hook "useImperativeHandle()" recibe como parámetros:
    - La matriz de referencias a dicho componente.
    - Una función callback que retorna un objeto en el que cada una de sus propiedades corresponde a un estado/controlador de eventos que queremos exponer.
  */
  useImperativeHandle(refs, () => ({ toggleVisibility }));

  return (
    <>
      <div style={hideWhenVisible}>
        <Button variant="contained" type="button" onClick={toggleVisibility}>
          {buttonLabel}
        </Button>
      </div>
      <div style={showWhenVisible}>
        {children}
        <Button
          variant="outlined"
          color="secondary"
          type="button"
          onClick={toggleVisibility}
        >
          close
        </Button>
      </div>
    </>
  );
});

/* Definimos en la propiedad "Togglable.propTypes" un objeto en el que cada una de sus propiedades corresponde a cada prop recibida.
 */
Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired, // La prop "buttonLabel" es una cadena de texto requerida.
};

Togglable.displayName = "Togglable";

export default Togglable;
