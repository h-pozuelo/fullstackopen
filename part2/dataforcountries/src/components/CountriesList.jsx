import React from "react";
import CountriesElement from "./CountriesElement";

const CountriesList = ({ countries }) => {
  return (
    <>
      {countries.map((c) => (
        <CountriesElement key={c.name.common} country={c} />
      ))}
    </>
  );
};

export default CountriesList;
