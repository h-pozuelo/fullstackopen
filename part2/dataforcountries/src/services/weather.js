import React from "react";
import axios from "axios";

const baseUrl = "http://api.openweathermap.org/data/2.5/weather";
const api_key = import.meta.env.VITE_SOME_KEY;

const getWeatherCountry = (countryName) => {
  const request = axios.get(
    `${baseUrl}?q=${countryName}&units=metric&APPID=${api_key}`
  );
  return request.then((response) => response.data);
};

export default { getWeatherCountry };
