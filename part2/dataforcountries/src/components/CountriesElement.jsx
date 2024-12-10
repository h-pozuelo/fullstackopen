import React, { useState } from "react";
import Country from "./Country";

const CountriesElement = ({ country }) => {
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow((prev) => !prev);

  return (
    <div>
      {country.name.common}{" "}
      <button onClick={toggleShow}>{!show ? "show" : "hide"}</button>
      {show && <Country name={country.name.common} />}
    </div>
  );
};

export default CountriesElement;
