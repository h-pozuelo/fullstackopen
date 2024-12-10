import React, { useEffect, useState } from "react";
import countryService from "../services/countries";
import Weather from "./Weather";

const Country = ({ name }) => {
  const [country, setCountry] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const returnedCountry = await countryService.getCountry(name);
      setCountry({ ...returnedCountry });
    };

    fetchData();
  }, [name]);

  if (!country) return null;

  return (
    <div>
      <h1>{country.name.common}</h1>

      <div>
        capital {country.capital[0]}
        <br />
        area {country.area}
      </div>

      <h3>languages:</h3>

      <ul>
        {Object.entries(country.languages).map(([key, value]) => (
          <li key={key}>{value}</li>
        ))}
      </ul>

      <img src={country.flags.png} alt={country.flags.alt} />

      <Weather country={country.name.common} />
    </div>
  );
};

export default Country;
