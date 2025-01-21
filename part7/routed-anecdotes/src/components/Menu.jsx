import React from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  const padding = {
    paddingRight: 5,
  };
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

export default Menu;
