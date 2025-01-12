import React from "react";
import { useDispatch } from "react-redux";
import { filterChange } from "../reducers/filterReducer";

const Filter = () => {
  const dispatch = useDispatch();

  const handleChange = ({ target }) => {
    const filter = target.value;
    dispatch(filterChange(filter));
  };

  const style = { marginBottom: 10 };

  return (
    <div style={style}>
      filter <input type="text" onChange={handleChange} />
    </div>
  );
};

export default Filter;
