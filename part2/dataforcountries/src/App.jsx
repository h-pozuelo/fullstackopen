import React, { useEffect, useState } from "react";
import countryService from "./services/countries";
import Country from "./components/Country";
import CountriesList from "./components/CountriesList";

const App = () => {
  const [value, setValue] = useState("");
  const [countries, setCountries] = useState([]);

  const handleChange = (event) => setValue(event.target.value);

  useEffect(() => {
    if (countries.length === 0) {
      countryService.getAllCountries().then((returnedCountries) => {
        setCountries([...returnedCountries]);
      });
    }
  }, [countries.length]);

  const includesCaseInsensitive = (str, searchString) =>
    new RegExp(searchString, "i").test(str);

  const filteredCountries = countries.filter((c) =>
    includesCaseInsensitive(c.name.common, value)
  );

  return (
    <div>
      find countries <input value={value} onChange={handleChange} />
      <br />
      {filteredCountries.length === 0 ||
      value === "" ? null : filteredCountries.length === 1 ? (
        <Country name={filteredCountries[0].name.common} />
      ) : filteredCountries.length > 10 ? (
        "Too many matches, specify another filter"
      ) : (
        <CountriesList countries={filteredCountries} />
      )}
    </div>
  );
};

export default App;
