import React, { useEffect, useState } from "react";
import weatherService from "../services/weather";

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    weatherService
      .getWeatherCountry(country)
      .then((returnedWeather) => setWeather({ ...returnedWeather }));
  }, [country]);

  if (!weather) return null;

  return (
    <div>
      <h2>Weather in {country}</h2>

      <div>
        temperature {weather.main.temp} Celsium
        <br />
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
        />
        <br />
        wind {weather.wind.speed} m/s
      </div>
    </div>
  );
};

export default Weather;
