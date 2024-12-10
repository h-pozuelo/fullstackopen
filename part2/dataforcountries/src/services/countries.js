import React from "react";
import axios from "axios";

const baseUrl = "https://studies.cs.helsinki.fi/restcountries/api";

const getAllCountries = () => {
  const request = axios.get(`${baseUrl}/all`);
  return request.then((response) => response.data);
};

const getCountry = async (countryName) => {
  const request = axios.get(`${baseUrl}/name/${countryName}`);
  const response = await request;
  return response.data;
};

export default { getAllCountries, getCountry };
