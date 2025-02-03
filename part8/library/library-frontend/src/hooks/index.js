import { useState } from "react";

export const useField = ({ name, type = "text" }) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const reset = () => {
    setValue("");
  };

  const field = { name, type, value, onChange };

  return [field, reset];
};
