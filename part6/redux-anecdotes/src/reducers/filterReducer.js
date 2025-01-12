import { createSlice } from "@reduxjs/toolkit";

// // Construimos otra función reducer personalizada; esta vez manejará el estado del filtro.
// const filterReducer = (state = "", action) => {
//   switch (action.type) {
//     case "SET_FILTER":
//       return action.payload;
//     default:
//       return state;
//   }
// };

// // Definimos el "action creator" para construir el objeto "action" que recibe el "reducer".
// export const filterChange = (filter) => ({
//   type: "SET_FILTER",
//   payload: filter,
// });

const filterSlice = createSlice({
  name: "filter",
  initialState: "",
  reducers: {
    filterChange(state, action) {
      const filter = action.payload;
      return filter;
    },
  },
});

export const { filterChange } = filterSlice.actions;

export default filterSlice.reducer;
