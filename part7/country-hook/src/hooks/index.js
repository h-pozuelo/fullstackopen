import { useEffect } from "react";
import { useState } from "react";

export const useField = ({ name = null, type = "text" }) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return { name, type, value, onChange };
};

export const useCountry = (name) => {
  const [country, setCountry] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://studies.cs.helsinki.fi/restcountries/api/name/${name}`
        );

        const data = await response.json();

        if (data.error) {
          setCountry({ found: false });
          return;
        }

        setCountry({
          data: {
            name: data.name.common,
            capital: data.capital[0],
            population: data.population,
            flag: data.flags.svg,
          },
          found: true,
        });
      } catch (error) {
        setCountry(null);
      }
    };

    fetchData();
  }, [name]);

  return country;
};
